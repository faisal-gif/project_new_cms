<?php

namespace App\Http\Controllers;

use App\Exports\NewsNasionalExport;
use App\Models\KanalNasional;
use App\Models\NewsNasional;
use App\Models\User;
use App\Models\WriterNasional;
use App\Notifications\ExportReadyNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportNewsNasionalController extends Controller
{
    // 1. PENTING: Jangan gunakan ->with() di sini agar query base-nya ringan
    private function buildQuery(Request $request)
    {
        $query = NewsNasional::query();

        // Karena kita sudah menyuntikkan nilai default di index(), 
        // blok ini akan selalu tereksekusi dengan aman.
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('news_datepub', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay(),
            ]);
        }

        if ($request->filled('kanal')) {
            $query->where('catnews_id', $request->kanal);
        }
        if ($request->filled('writer')) {
            $query->where('news_writer', $request->writer);
        }

        return $query;
    }

    public function index(Request $request)
    {
        // =========================================================
        // [OPTIMASI BARU]: Set Default "Bulan Ini" jika kosong
        // =========================================================
        if (!$request->filled('start_date') || !$request->filled('end_date')) {
            $request->merge([
                'start_date' => Carbon::now()->startOfMonth()->format('Y-m-d'),
                'end_date'   => Carbon::now()->endOfMonth()->format('Y-m-d'),
            ]);
        }

        // Sekarang, buildQuery akan memproses data berdasarkan bulan ini
        $baseQuery = $this->buildQuery($request);

        $totalNews = (clone $baseQuery)->count();
        $totalPublish = (clone $baseQuery)->where('news_status', 1)->count();
        $totalReview = (clone $baseQuery)->where('news_status', 2)->count();

        $totalViews = (clone $baseQuery)
            ->leftJoin('news_views', 'news.news_id', '=', 'news_views.news_id')
            ->sum('news_views.pageviews');

        $chartData = (clone $baseQuery)
            ->select(
                DB::raw('DATE(news.news_datepub) as date'),
                DB::raw('COUNT(news.news_id) as total_berita')
            )
            ->whereNotNull('news.news_datepub')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        $writers = WriterNasional::select('id', 'name')->where('status', '1')->get()
            ->map(fn($u) => ['value' => $u->name, 'label' => $u->name]);

        $kanals = KanalNasional::select('catnews_id', 'catnews_title')->get()
            ->map(fn($u) => ['value' => $u->catnews_id, 'label' => $u->catnews_title]);

        return Inertia::render('Admin/Nasional/News/Report/Index', [
            'summary' => [
                'total_news' => $totalNews,
                'total_publish' => $totalPublish,
                'total_review' => $totalReview,
                'total_views' => (int) $totalViews,
            ],
            'chart_data' => $chartData,
            'writers' => $writers,
            'kanals' => $kanals,
            // Variabel 'filters' ini sekarang PASTI berisi tanggal bulan ini
            // sehingga React di sisi depan akan otomatis mengisi input kolom tanggal.
            'filters' => $request->only(['start_date', 'end_date', 'kanal', 'writer']),
        ]);
    }

    // 2. Memproses Antrean Export Excel
    public function export(Request $request)
    {
        // 1. Validasi filter nasional
        $filters = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'kanal'      => 'nullable',
            'writer'     => 'nullable',
        ]);

        $fileName = 'Laporan_Nasional_' . Auth::id() . '_' . time() . '.xlsx';
        $userId = Auth::id();

        // 2. Queue dan simpan ke folder 'exports' di disk 'public'
        \Maatwebsite\Excel\Facades\Excel::queue(
            new NewsNasionalExport($filters),
            'exports/' . $fileName,
            'public'
        )->chain([
            function () use ($userId, $fileName) {
                // 3. Cari User dan picu notifikasi real-time via WebSocket Reverb
                $user = User::find($userId);

                if ($user) {
                    $user->notify(new ExportReadyNotification($fileName));
                }
            }
        ]);

        return back()->with('success', 'Laporan Berita Nasional sedang diproses di belakang layar. Silakan cek lonceng notifikasi dalam beberapa saat.');
    }
}
