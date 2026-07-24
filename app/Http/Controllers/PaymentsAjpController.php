<?php

namespace App\Http\Controllers;

use App\Models\PaketBerita;
use App\Models\PaymentsNewsBerbayar;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentsAjpController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $packageId = $request->input('package_id');

        // Default ke Bulan Ini. 
        $startDate = $request->has('start_date') ? $request->input('start_date') : Carbon::now()->startOfMonth()->toDateString();
        $endDate = $request->has('end_date') ? $request->input('end_date') : Carbon::now()->endOfMonth()->toDateString();

        $query = PaymentsNewsBerbayar::with([
            'user:id,nama,email',
            'package:id,name,price'
        ])->where('type', 1);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('nama', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($status)) {
            $query->where('status', $status);
        }

        if (!empty($packageId)) {
            $query->where('package_id', $packageId);
        }

        if (!empty($startDate) && !empty($endDate)) {
            $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        } elseif (!empty($startDate)) {
            $query->where('created_at', '>=', $startDate . ' 00:00:00');
        } elseif (!empty($endDate)) {
            $query->where('created_at', '<=', $endDate . ' 23:59:59');
        }

        // --- OPTIMALISASI STATISTIK ---
        $statsQuery = clone $query;
        $totalUniqueUsers = (clone $statsQuery)->distinct('user_id')->count('user_id');
        $totalTransactions = (clone $statsQuery)->count();

        // MENGHITUNG TOTAL NOMINAL MASUK (Hanya yang berstatus PAID)
        $totalRevenue = (clone $statsQuery)->where('status', 'paid')->sum('amount');

        $payments = $query->latest()
            ->paginate(10)
            ->withQueryString();

        $packages = PaketBerita::select('id', 'name')
            ->where('type', 1)
            ->where('status', 1)
            ->get();

        return Inertia::render('Admin/AJP/Payments/Index', [
            'payments' => $payments,
            'packages' => $packages,
            'statistics' => [
                'total_users' => $totalUniqueUsers,
                'total_transactions' => $totalTransactions,
                'total_revenue' => $totalRevenue, // Dikirim ke React
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'package_id' => $packageId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function report(Request $request)
    {
        $packageId = $request->input('package_id');

        // Default filter diatur ke bulan berjalan jika tidak ada input
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Base query statistik ringkas tanpa memuat relasi berat (menghemat memori)
        $query = PaymentsNewsBerbayar::where('type', 1)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);

        if (!empty($packageId)) {
            $query->where('package_id', $packageId);
        }

        // 1. Hitung statistik ringkas untuk Box Card
        $statsQuery = clone $query;
        $totalUniqueUsers = (clone $statsQuery)->where('status', 'paid')->distinct('user_id')->count('user_id');
        $totalTransactions = (clone $statsQuery)->where('status', 'paid')->count();
        $totalRevenue = (clone $statsQuery)->where('status', 'paid')->sum('amount');

        // 2. Ambil data chart tren harian (Hanya transaksi berstatus paid)
        $chartData = (clone $statsQuery)
            ->where('status', 'paid')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total_revenue, COUNT(id) as total_transactions')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 3. Ambil data kontribusi paket (Bar/Pie Chart)
        $packageDistribution = (clone $statsQuery)
            ->where('status', 'paid')
            ->selectRaw('package_id, COUNT(id) as total_sales')
            ->groupBy('package_id')
            ->with('package:id,name')
            ->get()
            ->map(fn($item) => [
                'name' => $item->package?->name ?? 'Tanpa Paket',
                'value' => $item->total_sales
            ]);

        // =========================================================================
        // IMPLEMENTASI SMART CACHING UNTUK AI INSIGHTS
        // =========================================================================
        // Key unik berdasarkan parameter filter DAN nilai statistik saat ini.
        // Jika nominal omzet ($totalRevenue) berubah, key otomatis berubah & AI ter-regenerate.
        $cacheString = "gemini_report_ajp_{$startDate}_{$endDate}_{$packageId}_{$totalRevenue}_{$totalTransactions}";
        $cacheKey = md5($cacheString);

        // Simpan hasil generate AI di cache selama 12 jam
        $aiInsights = Cache::remember($cacheKey, now()->addHours(12), function () use ($totalRevenue, $totalTransactions, $totalUniqueUsers, $chartData, $packageDistribution) {
            Log::info("Memicu Kueri API Gemini Baru untuk Laporan Transaksi AJP.");

            return $this->generateGeminiInsights($totalRevenue, $totalTransactions, $totalUniqueUsers, $chartData, $packageDistribution);
        });

        // Daftar paket untuk dropdown filter
        $packages = PaketBerita::select('id', 'name')->where('type', 1)->where('status', 1)->get();

        return Inertia::render('Admin/AJP/Payments/Report', [
            'packages' => $packages,
            'chart_data' => $chartData,
            'package_distribution' => $packageDistribution,
            'ai_insights' => $aiInsights,
            'statistics' => [
                'total_users' => $totalUniqueUsers,
                'total_transactions' => $totalTransactions,
                'total_revenue' => $totalRevenue,
            ],
            'filters' => [
                'package_id' => $packageId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    private function generateGeminiInsights($totalRevenue, $totalTransactions, $totalUniqueUsers, $chartData, $packageDistribution)
    {
        $apiKey = config('services.gemini.api_key');

        if (!$apiKey || ($totalTransactions === 0)) {
            return [
                'has_data' => false,
                'summary' => 'Data transaksi kosong atau API Key belum dikonfigurasi.',
                'findings' => ['Tidak ada transaksi sukses untuk dianalisis.'],
                'recommendations' => ['Dorong pemasaran produk agar transaksi mulai masuk.']
            ];
        }

        // Susun payload mentah untuk dibaca oleh Gemini AI
        $dataContext = [
            'total_revenue' => $totalRevenue,
            'total_transactions' => $totalTransactions,
            'total_users' => $totalUniqueUsers,
            'daily_trend' => $chartData->toArray(),
            'package_performance' => $packageDistribution->toArray()
        ];

        // Prompt instruksi ketat agar Gemini mengembalikan format JSON murni
        $prompt = "Kamu adalah seorang Direktur Finansial dan Ahli Strategi Bisnis SaaS Senior. " .
            "Analisis data transaksi penjualan berikut dan berikan rekomendasi aksi bisnis yang konkret dalam Bahasa Indonesia. " .
            "Format output HARUS dalam bentuk JSON murni dengan struktur object: " .
            "{ \"summary\": \"string deskripsi singkat keseluruhan\", \"findings\": [\"array string berisi poin analisis temuan bisnis\"], \"recommendations\": [\"array string berisi poin aksi konkret untuk kedepannya\"] }. " .
            "Jangan sertakan backticks ```json atau teks markdown tambahan apapun di luar object JSON tersebut. " .
            "Berikut datanya: " . json_encode($dataContext);

        try {
            // Isolasi URL secara literal untuk membersihkan hidden formatting characters
            $url = "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=" . trim($apiKey);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $resultText = $response->json('candidates.0.content.parts.0.text');
                $parsedJson = json_decode($resultText, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    return array_merge(['has_data' => true], $parsedJson);
                }
            }
        } catch (\Exception $e) {
            Log::error("Gemini API Error: " . $e->getMessage());
        }

        // Fallback jika API down atau respon gagal di-parse
        return [
            'has_data' => true,
            'summary' => 'Sistem mendeteksi aktivitas penjualan yang stabil namun gagal terhubung ke AI Engine.',
            'findings' => ['Penjualan berjalan normal berdasarkan grafik tren.'],
            'recommendations' => ['Lakukan evaluasi manual terhadap pergerakan grafik omzet harian.']
        ];
    }
}
