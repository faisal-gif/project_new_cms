<?php

namespace App\Http\Controllers;

use App\Models\NewsBerbayarAddOnRequest;
use App\Models\WriterBerbayar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KtAddonRequestController extends Controller
{
    /**
     * Menampilkan daftar antrean request Feed IG & Ekoran.
     */
    public function index(Request $request)
    {
        // Gunakan Eager Loading untuk memanggil relasi 'news' dan 'wartawan'
        // Sesuaikan kolom yang di-select pada relasi jika diperlukan (misal: 'id', 'title', 'nama')
        $query = NewsBerbayarAddOnRequest::with([
            'news:id,title',
            'wartawan:id,nama' // Pastikan kolom nama wartawan di tabelmu benar 'nama'
        ])->orderBy('created_at', 'DESC');

        // Filter berdasarkan jenis request (Feed / Ekoran)
        if ($request->filled('jenis')) {
            $query->where('jenis_request', $request->jenis);
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Pagination
        $requests = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Kopi_Times/AddonRequest/Index', [
            'requests' => $requests,
            'filters'  => $request->only(['jenis', 'status']),
        ]);
    }

    public function show($id)
    {
        $addon = NewsBerbayarAddOnRequest::with(['news', 'wartawan'])->findOrFail($id);

        return Inertia::render('Admin/Kopi_Times/AddonRequest/Show', [
            'addon' => $addon
        ]);
    }

    /**
     * Memperbarui status antrean dan memanipulasi kuota wartawan jika ditolak.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,completed,rejected',
            'url_hasil' => 'nullable|string',
            'keterangan_admin' => 'nullable|string',
        ]);

        // Cari data request berdasarkan ID
        $addon = NewsBerbayarAddOnRequest::findOrFail($id);

        // PENTING: Gunakan koneksi spesifik untuk transaksi database
        DB::connection('mysql_berbayar')->beginTransaction();
        
        try {
            $statusLama = $addon->status;
            $statusBaru = $request->status;

            // LOGIKA 1: REFUND KUOTA (Jika ditolak oleh admin)
            if ($statusBaru === 'rejected' && $statusLama !== 'rejected') {
                $wartawan = WriterBerbayar::find($addon->wartawan_id);
                if ($wartawan) {
                    // Tambahkan kembali +1 kuota (entah itu feed_instagram atau ekoran)
                    $wartawan->increment($addon->jenis_request, 1); 
                }
            } 
            
            // LOGIKA 2: BATAL REFUND (Jika admin salah tolak, dan dikembalikan ke status diproses)
            elseif ($statusLama === 'rejected' && $statusBaru !== 'rejected') {
                $wartawan = WriterBerbayar::find($addon->wartawan_id);
                if ($wartawan) {
                    // Potong kembali -1 kuota karena dilanjutkan
                    $wartawan->decrement($addon->jenis_request, 1); 
                }
            }

            // Update baris antrean dengan status terbaru
            $addon->update([
                'status' => $statusBaru,
                'url_hasil' => $request->url_hasil,
                'keterangan_admin' => $request->keterangan_admin,
            ]);

            DB::connection('mysql_berbayar')->commit();
            
            return redirect()->route('admin.kopi-times.addon-requests.index')->with('success', 'Status antrean berhasil diperbarui.');
            
        } catch (\Exception $e) {
            DB::connection('mysql_berbayar')->rollBack();
            
            return back()->with('error', 'Terjadi kesalahan sistem saat memperbarui status: ' . $e->getMessage());
        }
    }
}
