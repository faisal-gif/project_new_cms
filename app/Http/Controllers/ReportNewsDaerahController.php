<?php

namespace App\Http\Controllers;

use App\Exports\NewsDaerahExport;
use App\Models\EditorDaerah;
use App\Models\KanalDaerah;
use App\Models\NewsDaerah;
use App\Models\User;
use App\Models\WriterDaerah;
use App\Notifications\ExportReadyNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class ReportNewsDaerahController extends Controller
{
    // 1. PENTING: Kueri dasar yang ringan, tanpa ->with() 
    private function buildQuery(Request $request)
    {
        $query = NewsDaerah::query();

        // Filter berdasarkan kolom datepub untuk daerah
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('datepub', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        // Filter relasi menggunakan foreign key daerah
        if ($request->filled('kanal')) {
            $query->where('cat_id', $request->kanal);
        }
        if ($request->filled('writer')) {
            $query->where('writer_id', $request->writer);
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

        // Sekarang, buildQuery akan memproses data berdasarkan bulan ini (atau filter user)
        $baseQuery = $this->buildQuery($request);

        // 2. Kalkulasi Ringan di sisi Database
        $totalNews = (clone $baseQuery)->count();
        $totalPublish = (clone $baseQuery)->where('status', 1)->count();
        $totalReview = (clone $baseQuery)->where('status', 2)->count();

        // Berita Daerah kolom views-nya ada di tabel utama, jadi tinggal sum() saja (Sangat Cepat)
        $totalViews = (clone $baseQuery)->sum('views');

        // 3. Kalkulasi Grafik Bar Chart
        $chartData = (clone $baseQuery)
            ->select(
                DB::raw('DATE(datepub) as date'),
                DB::raw('COUNT(id) as total_berita')
            )
            ->whereNotNull('datepub')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 4. Data Master untuk Dropdown
        $writers = WriterDaerah::select('id', 'name')->where('status', '1')->get()
            ->map(fn($u) => ['value' => $u->id, 'label' => $u->name]);

        $editors = EditorDaerah::select('id', 'name')->where('status', '1')->get()
            ->map(fn($u) => ['value' => $u->id, 'label' => $u->name]);

        $kanals = KanalDaerah::select('id', 'name')->get()
            ->map(fn($u) => ['value' => $u->id, 'label' => $u->name]);

        return Inertia::render('Admin/Daerah/News/Report/Index', [
            'summary' => [
                'total_news' => $totalNews,
                'total_publish' => $totalPublish,
                'total_review' => $totalReview,
                'total_views' => (int) $totalViews, // Pastikan outputnya selalu integer
            ],
            'chart_data' => $chartData,
            'writers' => $writers,
            'editors' => $editors,
            'kanals' => $kanals,
            // Properti filters ini akan melempar tanggal "Bulan Ini" ke Input React Anda
            'filters' => $request->only(['start_date', 'end_date', 'kanal', 'writer', 'editor']),
        ]);
    }

    public function export(Request $request)
    {
        // 1. Validasi Input
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'kanal'      => 'nullable',
            'writer'     => 'nullable',
            'editor'     => 'nullable',
        ]);

        // 2. Buat Array untuk merangkai nama file
        $nameParts = ['Laporan-Daerah'];

        // Tambahkan rentang tanggal (karena required, datanya pasti ada)
        // Diubah formatnya dari 2026-06-01 menjadi 20260601 agar nama file tidak terlalu panjang
        $nameParts[] = date('Ymd', strtotime($filters['start_date'])) . '-sd-' . date('Ymd', strtotime($filters['end_date']));

        // Cek dan tambahkan filter Kanal
        if (!empty($filters['kanal'])) {
            $nameParts[] = 'kanal-' . Str::slug($filters['kanal']);
        }

        // Cek dan tambahkan filter Writer (Ambil nama asli dari DB jika yang dikirim ID)
        if (!empty($filters['writer'])) {
            $writerName = WriterDaerah::where('id', $filters['writer'])->value('name');

            if ($writerName) {
                $nameParts[] = Str::slug($writerName);
            } else {
                $nameParts[] = 'writer-' . $filters['writer'];
            }
        }

        if (!empty($filters['editor'])) {
            $editorName = EditorDaerah::where('id', $filters['editor'])->value('name');

            if ($editorName) {
                $nameParts[] = Str::slug($editorName);
            } else {
                $nameParts[] = 'editor-' . $filters['editor'];
            }
        }

        // Gabungkan array $nameParts menggunakan tanda strip (-)
        // Lalu tambahkan Auth ID dan time() di paling belakang agar file tetap unik dan tidak tertimpa
        $fileName = implode('-', $nameParts) . '_' . Auth::id() . '_' . time() . '.xlsx';

        $userId = Auth::id();

        // 3. Operkan $filters (tipe data Array murni) ke dalam NewsDaerahExport
        Excel::queue(new NewsDaerahExport($filters), 'exports/' . $fileName, 'public')->chain([
            function () use ($userId, $fileName) {
                $user = User::find($userId);

                if ($user) {
                    $user->notify(new ExportReadyNotification($fileName));
                }
            }
        ]);

        return back()->with('success', 'Laporan Berita Daerah sedang diproses di belakang layar. Silakan cek lonceng notifikasi dalam beberapa saat.');
    }
}
