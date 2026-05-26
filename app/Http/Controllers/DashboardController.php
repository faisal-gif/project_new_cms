<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\News;
use App\Models\NewsDaerah;
use App\Models\NewsNasional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $stats = [];


        // Logika untuk Admin / Editor
        if ($user->hasAnyRole(['super-admin', 'admin', 'editor'])) {
            $stats['news'] = Cache::remember('dashboard_news_stats_v2', 60 * 5, function () {
                return [
                    // Kategori Utama sekarang hanya menghitung Total Row (Container)
                    'utama' => [
                        'title' => 'Total Master Berita (Tampungan)',
                        'total' => News::count(),
                    ],
                    'nasional' => [
                        'title'       => 'Berita Nasional',
                        'published'   => NewsNasional::where('news_status', 1)->count(),
                        'on_review'   => NewsNasional::where('news_status', 2)->count(),
                        'on_progress' => NewsNasional::where('news_status', 3)->count(),
                        'pending'     => NewsNasional::where('news_status', 0)->count(),
                    ],
                    'daerah' => [
                        'title'       => 'Berita Daerah',
                        'published'   => NewsDaerah::where('status', 1)->count(),
                        'on_review'   => NewsDaerah::where('status', 2)->count(),
                        'on_progress' => NewsDaerah::where('status', 3)->count(),
                        'pending'     => NewsDaerah::where('status', 0)->count(),
                    ]
                ];
            });
        }

        // Logika untuk Fotografer (tetap dipertahankan seperti desain sebelumnya)
        if ($user->hasRole('fotografer')) {
            $stats['photos'] = [
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
