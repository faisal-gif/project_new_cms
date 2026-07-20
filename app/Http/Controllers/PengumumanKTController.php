<?php

namespace App\Http\Controllers;

use App\Http\Requests\PengumumanKTRequest;
use App\Models\PengumumanWebBerbayar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PengumumanKTController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Mengambil data pengumuman menggunakan query builder
        $pengumuman = PengumumanWebBerbayar::where('type', 4)
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })

            // 2. Filter Status: Menggunakan filled() karena nilai 0 (Tidak Aktif) bisa dianggap false di PHP
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('is_active', $request->status);
            })

            // 3. Urutkan berdasarkan data yang paling baru ditambahkan
            ->orderByDesc('created_at')

            // 4. Pagination 10 data per halaman, dengan menyertakan query parameter saat pindah page
            ->paginate(10)
            ->withQueryString();

        // 5. Render ke komponen Frontend React (Inertia)
        return Inertia::render('Admin/Kopi_Times/Pengumuman/Index', [
            'pengumuman' => $pengumuman,
            'filters'    => $request->only(['search', 'status']),
        ]);
    }

    // Menampilkan halaman form input
    public function create()
    {
        return Inertia::render('Admin/Kopi_Times/Pengumuman/Create');
    }

    // Memproses data yang dikirim dari form
    public function store(PengumumanKTRequest $request)
    {
        $validated = $request->validated();
        $user = Auth::id();
        try {

            DB::beginTransaction();

            $validated['created_by'] = $user;

            $validated['is_active'] = $request->input('is_active', true);
            $validated['type'] = '4';

            PengumumanWebBerbayar::create($validated);

            return redirect()->route('admin.kopi-times.pengumuman.index')
                ->with('success', 'Pengumuman Kopi Times berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Terjadi kesalahan sistem saat menyimpan data: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Menampilkan halaman form edit pengumuman.
     */
    public function edit($id)
    {
        $pengumuman = PengumumanWebBerbayar::findOrFail($id);

        return Inertia::render('Admin/Kopi_Times/Pengumuman/Edit', [
            'pengumuman' => $pengumuman
        ]);
    }

    /**
     * Memperbarui data pengumuman di database.
     */
    public function update(PengumumanKTRequest $request, $id)
    {
        $pengumuman = PengumumanWebBerbayar::findOrFail($id);

        $validated = $request->validated();

        try {
            
            $validated['is_active'] = $request->input('is_active', false);

            $pengumuman->update($validated);

            return redirect()->route('admin.kopi-times.pengumuman.index')
                ->with('success', 'Pengumuman Kopi Times berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Terjadi kesalahan sistem saat menyimpan data: ' . $e->getMessage()
            ]);
        }
    }
}
