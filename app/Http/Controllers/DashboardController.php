<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\News;
use App\Models\NewsBerbayar;
use App\Models\PaymentsNewsBerbayar;
use App\Models\WriterBerbayar;
use App\Models\NewsDaerah;
use App\Models\NewsNasional;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $stats = [];

        // 1. Logika untuk Level Manajerial & Editor
        if ($user->can('view dashboard news')) {

            // Caching agregasi selama 5 menit untuk mencegah query berlebih ke DB
            $stats['news'] = Cache::remember('dashboard_news_stats_v6', 60 * 5, function () {

                // Agregasi Master Data (Tampungan)
                $distributionCounts = News::selectRaw('distribution_status, COUNT(*) as total')
                    ->groupBy('distribution_status')
                    ->pluck('total', 'distribution_status');

                // Agregasi Nasional (Hanya 1 Query)
                $nasionalCounts = $this->perDatabase('nasional', fn () => NewsNasional::selectRaw('news_status, COUNT(*) as total')
                    ->groupBy('news_status')
                    ->pluck('total', 'news_status'));

                // Agregasi Daerah (Hanya 1 Query)
                $daerahCounts = $this->perDatabase('daerah', fn () => NewsDaerah::selectRaw('status, COUNT(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status'));

                return [
                    'utama' => [
                        'title'          => 'Status Distribusi Master Berita',
                        'belum_tayang'   => $distributionCounts[0] ?? 0,
                        'tayang_parsial' => $distributionCounts[1] ?? 0,
                        'tayang_semua'   => $distributionCounts[2] ?? 0,
                    ],
                    'nasional' => [
                        'title'       => 'Berita Nasional',
                        // false = databasenya tidak terjangkau, angkanya bukan nol sungguhan.
                        'tersedia'    => $nasionalCounts !== null,
                        'published'   => $nasionalCounts[1] ?? 0,
                        'on_review'   => $nasionalCounts[2] ?? 0,
                        'on_progress' => $nasionalCounts[3] ?? 0,
                        'pending'     => $nasionalCounts[0] ?? 0,
                    ],
                    'daerah' => [
                        'title'       => 'Berita Daerah',
                        'tersedia'    => $daerahCounts !== null,
                        'published'   => $daerahCounts[1] ?? 0,
                        'on_review'   => $daerahCounts[2] ?? 0,
                        'on_progress' => $daerahCounts[3] ?? 0,
                        'pending'     => $daerahCounts[0] ?? 0,
                    ]
                ];
            });

            // Ranking berita nasional populer hari ini (berdasarkan pageviews)
            $stats['news']['popular_today'] = Cache::remember(
                'dashboard_popular_news_today_' . today()->toDateString(),
                60 * 5,
                function () {
                    return $this->perDatabase('nasional (berita populer)', fn () => NewsNasional::query()
                        ->leftJoin('news_views', 'news.news_id', '=', 'news_views.news_id')
                        // Rentang, bukan whereDate(): DATE(news_datepub) membungkus
                        // kolomnya sehingga index news_datepub tidak terpakai dan
                        // MySQL memindai seluruh tabel 2,8 GB.
                        ->whereBetween('news.news_datepub', [today(), today()->endOfDay()])
                        ->selectRaw('news.news_id, news.news_title, COALESCE(news_views.pageviews, 0) as pageviews')
                        ->orderByDesc('pageviews')
                        ->limit(10)
                        ->get()) ?? collect();
                }
            );

            // Logika Spesifik: Produktivitas Harian Editor
            // Di-cache per-user 2 menit: cukup real-time tapi tidak membebani DB tiap refresh
            if ($user->can('view dashboard editor performance')) {
                $stats['editor_performance'] = Cache::remember(
                    "dashboard_editor_perf_{$user->id}_" . today()->toDateString(),
                    60 * 2,
                    function () use ($user) {
                        $today = Carbon::today();

                        $countDaerah = $this->perDatabase('daerah (produktivitas editor)', fn () => NewsDaerah::where('editor_id', $user->editor->id_daerah)
                            ->whereDate('created_at', $today)
                            ->count()) ?? 0;

                        $countNasional = $this->perDatabase('nasional (produktivitas editor)', fn () => NewsNasional::where('editor_id', $user->editor->id_ti)
                            ->whereDate('created', $today)
                            ->count()) ?? 0;

                        return [
                            'total_today' => $countDaerah + $countNasional,
                            'daerah'      => $countDaerah,
                            'nasional'    => $countNasional,
                        ];
                    }
                );
            }
        }

        // 2. Logika untuk Kopi Times (berita berbayar, type = 4)
        if ($user->can('view dashboard kopi times')) {
            $ktCounts = Cache::remember('dashboard_kt_stats_v1', 60 * 5, function () {
                return $this->perDatabase('berbayar (Kopi Times)', fn () => NewsBerbayar::where('type', 4)
                    ->selectRaw('status, COUNT(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status')) ?? collect();
            });

            $stats['kopi_times'] = [
                'title'     => 'Berita Kopi Times',
                'draft'     => $ktCounts[0] ?? 0,
                'published' => $ktCounts[1] ?? 0,
                'on_pro'    => $ktCounts[2] ?? 0,
                'total'     => $ktCounts->sum(),
                'payment'   => $this->paidNewsPayment(4),
                'new_users' => $this->newActiveWriters(4),
            ];
        }

        // 3. Logika untuk AJP (berita berbayar, type = 1)
        if ($user->can('view dashboard ajp')) {
            $ajpCounts = Cache::remember('dashboard_ajp_stats_v1', 60 * 5, function () {
                return $this->perDatabase('berbayar (AJP)', fn () => NewsBerbayar::where('type', 1)
                    ->selectRaw('status, COUNT(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status')) ?? collect();
            });

            $stats['ajp'] = [
                'title'     => 'Berita AJP',
                'draft'     => $ajpCounts[0] ?? 0,
                'published' => $ajpCounts[1] ?? 0,
                'on_pro'    => $ajpCounts[2] ?? 0,
                'total'     => $ajpCounts->sum(),
                'payment'   => $this->paidNewsPayment(1),
                'new_users' => $this->newActiveWriters(1),
            ];
        }

        // 4. Logika untuk Fotografer (cache per-user 2 menit)
        if ($user->can('view dashboard photo')) {
            $stats['photos'] = Cache::remember(
                "dashboard_photos_{$user->id}_" . today()->toDateString(),
                60 * 2,
                function () use ($user) {
                    return $this->perDatabase('nasional (galeri)', fn () => [
                        // Pastikan kolom 'created' dan 'id_fotografer' akurat sesuai skema tabel Gallery
                        'uploaded_today' => Gallery::whereDate('created', today())
                            ->where('fotografer_id', $user->id_fotografer)
                            ->count(),

                        'pending_review' => Gallery::where('gal_status', 0)
                            ->where('fotografer_id', $user->id_fotografer)
                            ->count(),
                    ]) ?? ['uploaded_today' => 0, 'pending_review' => 0];
                }
            );
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    }

    /**
     * Jalankan agregasi yang menyentuh database di host lain.
     *
     * Dashboard ini membaca empat database di empat host; tiga di antaranya remote.
     * Satu host yang mati seharusnya mengosongkan satu kartu, bukan menjatuhkan
     * seluruh halaman — jadi kegagalannya dicatat dan dikembalikan sebagai null,
     * dan pemanggilnya yang memutuskan nilai penggantinya.
     */
    private function perDatabase(string $nama, callable $query)
    {
        try {
            return $query();
        } catch (\Throwable $e) {
            Log::warning("Dashboard: agregasi {$nama} gagal, kartunya dikosongkan.", [
                'pesan' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Agregasi pembayaran berita berbayar (paid) BULAN INI per tipe (1 = AJP, 4 = Kopi Times).
     */
    private function paidNewsPayment(int $type): array
    {
        $period = now()->format('Y_m');
        $agg = Cache::remember("dashboard_payment_stats_v2_{$type}_{$period}", 60 * 5, function () use ($type) {
            return $this->perDatabase("berbayar (pembayaran type {$type})", fn () => PaymentsNewsBerbayar::where('type', $type)
                ->where('status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->selectRaw('COUNT(*) as transactions, COALESCE(SUM(amount), 0) as revenue')
                ->first());
        });

        return [
            'revenue'      => (int) ($agg->revenue ?? 0),
            'transactions' => (int) ($agg->transactions ?? 0),
        ];
    }

    /**
     * Jumlah penulis berbayar baru bulan ini yang berstatus aktif (status = 1).
     */
    private function newActiveWriters(int $type): int
    {
        $period = now()->format('Y_m');
        return Cache::remember("dashboard_new_writers_v1_{$type}_{$period}", 60 * 5, function () use ($type) {
            return $this->perDatabase("berbayar (penulis baru type {$type})", fn () => WriterBerbayar::where('type', $type)
                ->where('status', 1)
                ->whereMonth('created', now()->month)
                ->whereYear('created', now()->year)
                ->count()) ?? 0;
        });
    }
}
