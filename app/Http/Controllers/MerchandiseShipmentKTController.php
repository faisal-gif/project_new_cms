<?php

namespace App\Http\Controllers;

use App\Models\MerchandiseShipment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MerchandiseShipmentKTController extends Controller
{
    public function index(Request $request)
    {
        // Mengambil data pengiriman beserta relasi user/wartawan
        $shipments = MerchandiseShipment::with('member')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('member', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%");
                })
                    ->orWhere('tracking_number', 'like', "%{$search}%")
                    ->orWhere('item_name', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

 
            return Inertia::render('Admin/Kopi_Times/Merchandise/Shipment/Index', [
            'shipments' => $shipments,
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status'          => 'required|in:pending,processing,shipped,delivered',
            'tracking_number' => 'nullable|string|max:255',
        ], [
            'status.required' => 'Status Wajib di isi'
        ]);

        $shipment = MerchandiseShipment::findOrFail($id);

        $shipment->update([
            'status'          => $request->status,
            'tracking_number' => $request->tracking_number,
        ]);

        return back()->with('success', 'Status pengiriman berhasil diperbarui!');
    }
}
