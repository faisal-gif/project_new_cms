<?php

namespace App\Http\Controllers;

use App\Models\PaketBerita;
use App\Models\PaymentsNewsBerbayar;
use Carbon\Carbon;
use Illuminate\Http\Request;
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

        // Daftar paket untuk dropdown filter
        $packages = PaketBerita::select('id', 'name')->where('type', 1)->where('status', 1)->get();

        return Inertia::render('Admin/AJP/Payments/Report', [
            'packages' => $packages,
            'chart_data' => $chartData,
            'package_distribution' => $packageDistribution,
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
}
