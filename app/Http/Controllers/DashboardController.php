<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\News;
use App\Models\NewsDaerah;
use App\Models\NewsNasional;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $stats = [];

        // 1. Logika untuk Level Manajerial & Editor
        if ($user->hasAnyRole(['super-admin', 'admin', 'editor'])) {

            // Caching agregasi selama 5 menit untuk mencegah query berlebih ke DB
            $stats['news'] = Cache::remember('dashboard_news_stats_v6', 60 * 5, function () {

                // Agregasi Master Data (Tampungan)
                $distributionCounts = News::selectRaw('distribution_status, COUNT(*) as total')
                    ->groupBy('distribution_status')
                    ->pluck('total', 'distribution_status');

                // Agregasi Nasional (Hanya 1 Query)
                $nasionalCounts = NewsNasional::selectRaw('news_status, COUNT(*) as total')
                    ->groupBy('news_status')
                    ->pluck('total', 'news_status');

                // Agregasi Daerah (Hanya 1 Query)
                $daerahCounts = NewsDaerah::selectRaw('status, COUNT(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status');

                return [
                    'utama' => [
                        'title'          => 'Status Distribusi Master Berita',
                        'belum_tayang'   => $distributionCounts[0] ?? 0,
                        'tayang_parsial' => $distributionCounts[1] ?? 0,
                        'tayang_semua'   => $distributionCounts[2] ?? 0,
                    ],
                    'nasional' => [
                        'title'       => 'Berita Nasional',
                        'published'   => $nasionalCounts[1] ?? 0,
                        'on_review'   => $nasionalCounts[2] ?? 0,
                        'on_progress' => $nasionalCounts[3] ?? 0,
                        'pending'     => $nasionalCounts[0] ?? 0,
                    ],
                    'daerah' => [
                        'title'       => 'Berita Daerah',
                        'published'   => $daerahCounts[1] ?? 0,
                        'on_review'   => $daerahCounts[2] ?? 0,
                        'on_progress' => $daerahCounts[3] ?? 0,
                        'pending'     => $daerahCounts[0] ?? 0,
                    ]
                ];
            });

            // Logika Spesifik: Produktivitas Harian Editor
            // Tidak di-cache agar Editor bisa melihat progress real-time setiap kali refresh
            if ($user->hasRole('editor')) {
                $today = Carbon::today();

                // Pastikan kolom 'updated_at' valid untuk model NewsDaerah Anda
                $countDaerah = NewsDaerah::where('editor_id', $user->editor->id_daerah)
                    ->whereDate('datepub', $today)
                    ->count();

                // Pastikan kolom 'modified' valid untuk model NewsNasional Anda
                $countNasional = NewsNasional::where('editor_id', $user->editor->id_ti)
                    ->whereDate('modified', $today)
                    ->count();

                $stats['editor_performance'] = [
                    'total_today' => $countDaerah + $countNasional,
                    'daerah'      => $countDaerah,
                    'nasional'    => $countNasional,
                ];
            }
        }

        // 2. Logika untuk Fotografer
        if ($user->hasRole('fotografer')) {
            $stats['photos'] = [
                // Pastikan kolom 'created' dan 'id_fotografer' akurat sesuai skema tabel Gallery
                'uploaded_today' => Gallery::whereDate('created', today())
                    ->where('fotografer_id', $user->id_fotografer)
                    ->count(),

                'pending_review' => Gallery::where('gal_status', 0)
                    ->where('fotografer_id', $user->id_fotografer)
                    ->count(),
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    }
}
