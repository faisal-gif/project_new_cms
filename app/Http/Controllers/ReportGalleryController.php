<?php

namespace App\Http\Controllers;

use App\Exports\GalleryExport;
use App\Models\EditorNasional;
use App\Models\Gallery;
use App\Models\GalleryCategory;
use App\Models\User;
use App\Models\WriterNasional;
use App\Notifications\ExportReadyNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportGalleryController extends Controller
{
    // 1. Kueri dasar yang ringan
    private function buildQuery(Request $request)
    {
        $query = Gallery::query();

        // Filter berdasarkan tanggal rilis (gal_datepub)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('gal_datepub', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        // Filter berdasarkan relasi / foreign key
        if ($request->filled('kanal')) {
            $query->where('gal_catid', $request->kanal);
        }
        if ($request->filled('fotografer')) {
            $query->where('fotografer_id', $request->fotografer);
        }
        if ($request->filled('editor')) {
            $query->where('editor_id', $request->editor);
        }

        return $query;
    }

    public function index(Request $request)
    {
        // =========================================================
        // [OPTIMASI]: Set Default "Bulan Ini" jika tanggal kosong
        // =========================================================
        if (!$request->filled('start_date') || !$request->filled('end_date')) {
            $request->merge([
                'start_date' => Carbon::now()->startOfMonth()->format('Y-m-d'),
                'end_date'   => Carbon::now()->endOfMonth()->format('Y-m-d'),
            ]);
        }

        $baseQuery = $this->buildQuery($request);


        // 2. Kalkulasi Ringan di sisi Database (Menggunakan clone agar baseQuery tidak termutasi)
        $totalGallery = (clone $baseQuery)->count();
        // Asumsi gal_status: 1 = Publish, 2 = Review (Sesuaikan dengan sistem Anda)
        $totalPublish = (clone $baseQuery)->where('gal_status', 1)->count();
        $totalReview  = (clone $baseQuery)->where('gal_status', 2)->count();

        // Sum langsung dari kolom gal_view
        $totalViews   = (clone $baseQuery)->sum('gal_view');

        // 3. Kalkulasi Grafik Bar Chart
        $chartData = (clone $baseQuery)
            ->select(
                DB::raw('DATE(gal_datepub) as date'),
                DB::raw('COUNT(gal_id) as total_galeri')
            )
            ->whereNotNull('gal_datepub')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 4. Data Master untuk Dropdown (Sesuaikan Model Fotografer & Editor dengan milik Anda)
        $kanals = GalleryCategory::select('id', 'title')->get()
            ->map(fn($k) => ['value' => $k->id, 'label' => $k->title]);

        // Catatan: Jika Fotografer & Editor diambil dari tabel User
        $fotografers = WriterNasional::select('id', 'name')->where('status', '1')->get()
            ->map(fn($u) => ['value' => $u->id, 'label' => $u->name]);

        $editors = EditorNasional::select('editor_id', 'editor_name')->where('status', '1')->get()
            ->map(fn($u) => ['value' => $u->editor_id, 'label' => $u->editor_name]);

        return Inertia::render('Admin/Nasional/Fotografi/Report/Index', [
            'summary' => [
                'total_gallery' => $totalGallery,
                'total_publish' => $totalPublish,
                'total_review'  => $totalReview,
                'total_views'   => (int) $totalViews,
            ],
            'chart_data'  => $chartData,
            'kanals'      => $kanals,
            'fotografers' => $fotografers,
            'editors'     => $editors,
            'filters'     => $request->only(['start_date', 'end_date', 'kanal', 'fotografer', 'editor']),
        ]);
    }

    public function export(Request $request)
    {
        // 1. Validasi Input
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'kanal'      => 'nullable',
            'fotografer' => 'nullable', // Menyesuaikan input dari React
            'editor'     => 'nullable',
        ]);

        // 2. Buat Array untuk merangkai nama file
        $nameParts = ['Laporan-Galeri-Nasional'];

        $nameParts[] = date('Ymd', strtotime($filters['start_date'])) . '-sd-' . date('Ymd', strtotime($filters['end_date']));

        // Cek dan tambahkan filter Kanal
        if (!empty($filters['kanal'])) {
            $nameParts[] = 'kanal-' . Str::slug($filters['kanal']);
        }

        // Cek dan tambahkan filter Fotografer
        if (!empty($filters['fotografer'])) {
            $fotoName = WriterNasional::where('id', $filters['fotografer'])->value('name');
            $nameParts[] = 'fotografer-' . ($fotoName ? Str::slug($fotoName) : $filters['fotografer']);
        }

        // Cek dan tambahkan filter Editor
        if (!empty($filters['editor'])) {
            $editorName = EditorNasional::where('editor_id', $filters['editor'])->value('editor_name');
            $nameParts[] = 'editor-' . ($editorName ? Str::slug($editorName) : $filters['editor']);
        }

        // Gabungkan string dan pastikan file unik
        $fileName = implode('-', $nameParts) . '_' . Auth::id() . '_' . time() . '.xlsx';
        $userId = Auth::id();

        // 3. Masukkan ke Queue menggunakan GalleryExport
        Excel::queue(new GalleryExport($filters), 'exports/' . $fileName, 'public')->chain([
            function () use ($userId, $fileName) {
                $user = User::find($userId); // Pastikan Model User sesuai sistem Anda

                if ($user) {
                    $user->notify(new ExportReadyNotification($fileName));
                }
            }
        ]);

        return back()->with('success', 'Laporan Galeri Nasional sedang diproses di belakang layar. Silakan cek lonceng notifikasi dalam beberapa saat.');
    }
}
