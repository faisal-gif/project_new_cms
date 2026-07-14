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
}
