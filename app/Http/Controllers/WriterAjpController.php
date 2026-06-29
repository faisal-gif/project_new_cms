<?php

namespace App\Http\Controllers;

use App\Enum\WriterBerbayarType;
use App\Http\Requests\WriterAjpRequest;
use App\Models\PaketBerita;
use App\Models\WriterBerbayar;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class WriterAjpController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 1. Ubah nama variabel menjadi jamak ($writers) karena ini adalah kumpulan data
        $writers = WriterBerbayar::query()
            // 2. Hindari "Magic Number". Gunakan Enum (direkomendasikan) 
            // Atau tetap gunakan ->where('type', 1) jika belum memakai Enum
            ->where('type', WriterBerbayarType::AJP->value)

            // 3. Gunakan method when() untuk menggantikan blok if()
            ->when($request->search, function ($query, $search) {
                // Tidak perlu nested closure jika hanya mencari di satu kolom
                $query->where('nama', 'like', "%{$search}%");
            })

            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })

            // 4. Gunakan helper method untuk urutan descending yang lebih ringkas
            ->orderByDesc('created')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/AJP/Writer/Index', [
            'writers' => $writers,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $paket = PaketBerita::where('status', 1)->where('type', '1')->get();
        return Inertia::render('Admin/AJP/Writer/Create', [
            'paket' => $paket
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(WriterAjpRequest $request)
    {
        $validated = $request->validated();
        $paket = PaketBerita::findOrFail($validated['paket_berita']);

        try {
            DB::beginTransaction();
            // Resolve Quota dan Date Expired (Mencegah manipulasi FE)
            $packageData = $this->resolvePackageData($paket, $validated);

            WriterBerbayar::create([
                'nama'       => $validated['name'],
                'email'      => $validated['email'],
                'password'   => Hash::make($validated['password']),
                'contact'    => $validated['phone'],
                'instansi'   => $validated['instansi'],
                'prov'       => $validated['provinsi'],
                'city'       => $validated['kota'],
                'address'    => $validated['alamat'],
                'status'     => $validated['status'],
                'package_id' => $paket->id,
                'quota_news' => $packageData['quota'],
                'dateexp'    => $packageData['dateexp'],
                'type'       => 1,

            ]);

            DB::commit();
            return redirect()->route('admin.ajp.writer.index')->with('success', 'Penulis AJP berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $writer = WriterBerbayar::find($id);
        // Ambil data paket untuk dropdown
        $pakets = PaketBerita::where('status', 1)->where('type', '1')->get();

        return Inertia::render('Admin/AJP/Writer/Edit', [
            'writer' => $writer,
            'paket'  => $pakets,
            // ... kirim data pendukung lainnya (provinsi, kota, dll)
        ]);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(WriterAjpRequest $request, string $id)
    {
        $writer = WriterBerbayar::find($id);

        $validated = $request->validated();
        $paket = PaketBerita::findOrFail($validated['paket_berita']);

        // Resolve Quota dan Date Expired
        $packageData = $this->resolvePackageData($paket, $validated);

        try {
            DB::beginTransaction();
            
            $updateData = [
                'nama'       => $validated['name'],
                'email'      => $validated['email'],
                'contact'    => $validated['phone'],
                'instansi'   => $validated['instansi'],
                'prov'       => $validated['provinsi'],
                'city'       => $validated['kota'],
                'address'    => $validated['alamat'],
                'status'     => $validated['status'],
                'package_id' => $paket->id,
                'quota_news' => $packageData['quota'],
                'dateexp'    => $packageData['dateexp'],
                'type'       => 1,
            ];

            // Hanya update password jika admin mengisinya di form edit
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $writer->update($updateData);

            DB::commit();
            return redirect()->route('admin.ajp.writer.index')->with('success', 'Data penulis AJP berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()]);
        }
    }

    private function resolvePackageData(PaketBerita $paket, array $validated): array
    {
        // Jika Paket Custom (Quota di DB bernilai null)
        if (is_null($paket->quota)) {
            // Kita percaya pada inputan manual dari form request
            return [
                'quota'   => $validated['quota_news'] ?? 0,
                'dateexp' => $validated['date_exp'] ? Carbon::parse($validated['date_exp'])->format('Y-m-d') : Carbon::now()->addMonth()->format('Y-m-d'),
            ];
        }

        // Jika Paket Standar, KALKULASI ULANG secara otomatis (Abaikan inputan dari FE)
        $dateExp = Carbon::now();
        if ($paket->jenis_periode && $paket->period) {
            switch (strtolower($paket->jenis_periode)) {
                case 'hari':
                    $dateExp->addDays($paket->period);
                    break;
                case 'minggu':
                    $dateExp->addWeeks($paket->period);
                    break;
                case 'bulan':
                    $dateExp->addMonths($paket->period);
                    break;
                case 'tahun':
                    $dateExp->addYears($paket->period);
                    break;
            }
        }

        return [
            'quota'   => $paket->quota,
            'dateexp' => $dateExp->format('Y-m-d'),
        ];
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
