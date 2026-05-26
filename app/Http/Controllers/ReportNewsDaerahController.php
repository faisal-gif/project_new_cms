<?php

namespace App\Http\Controllers;

use App\Exports\NewsDaerahExport;
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
            'kanals' => $kanals,
            // Properti filters ini akan melempar tanggal "Bulan Ini" ke Input React Anda
            'filters' => $request->only(['start_date', 'end_date', 'kanal', 'writer']),
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
        ]);

        $fileName = 'Laporan_Daerah_' . Auth::id() . '_' . time() . '.xlsx';
        $userId = \Illuminate\Support\Facades\Auth::id();

        // 2. Operkan $filters (tipe data Array murni) ke dalam NewsDaerahExport
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
