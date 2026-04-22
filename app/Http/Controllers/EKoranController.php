<?php

namespace App\Http\Controllers;

use App\Http\Requests\EkoranRequest;
use App\Http\Requests\StoreEkoranRequest;
use App\Models\Ekoran;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class EKoranController extends Controller
{

    public function __construct(
        protected CdnService $cdnService
    ) {}

    public function index(Request $request)
    {
        $query = Ekoran::query();

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                ->orWhere('id', $request->search);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $ekorans = $query->orderBy('datepub', 'desc')->paginate(10)->withQueryString();

        return inertia('Admin/Nasional/Ekoran/Index', [
            'ekorans' => $ekorans,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Nasional/Ekoran/Create');
    }

    private function uploadToCdn(UploadedFile $file, string $prefixName): string
    {
        // Generate nama file yang unik untuk menghindari bentrok di CDN
        $fileName = $prefixName . '_' . time() . '_' . Str::random(5);

        return $this->cdnService->uploadImage($file, $fileName, 6, 'convert', true);
    }
    public function store(EkoranRequest $request)
    {
        set_time_limit(0);
        $validated = $request->validated();

        $ekoranData = [
            'title'        => $validated['title'],
            'datepub'      => $validated['datepub'],
            'emagazine_id' => $validated['emagazine_id'] ?? null,
            'status'       => $validated['status'],
            'views'        => 0,
            'created_by'   => auth()->id(),
            'created'      => now(),
        ];

        DB::beginTransaction();

        try {
            // 1. Pemrosesan Halaman Reguler (img1 - img20)
            if ($request->hasFile('regular_pages')) {
                foreach ($request->file('regular_pages') as $index => $file) {
                    $columnNumber = $index + 1; // Index 0 jadi img1
                    $ekoranData['img' . $columnNumber] = $this->uploadToCdn($file, "ekoran_reguler_{$columnNumber}");
                }
            }

            // 2. Pemrosesan Halaman Promo (img21 - img22)
            if ($request->hasFile('spesial_pages')) {
                foreach ($request->file('spesial_pages') as $index => $file) {
                    $columnNumber = $index + 21; // Index 0 jadi img21
                    $ekoranData['img' . $columnNumber] = $this->uploadToCdn($file, "title_{$columnNumber}");
                }
            }

            // 3. Simpan data (beserta URL dari CDN) ke Database
            Ekoran::create($ekoranData);

            DB::commit();

            return redirect()->route('admin.nasional.ekoran.index')
                ->with('success', 'Edisi eKoran berhasil diterbitkan via CDN.');
        } catch (\Exception $e) {
            DB::rollBack();

            // Catatan Arsitektur: Jika upload ke CDN berhasil sebagian, lalu database gagal (misal server down),
            // gambar akan menjadi "orphan" di CDN. Idealnya di sini ada logika untuk menembak API Delete ke CDN
            // untuk membersihkan gambar yang terlanjur terupload pada request ini.

            return back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    public function edit(string $id)
    {
        // Cari data eKoran berdasarkan ID, jika tidak ada akan throw 404
        $ekoran = Ekoran::findOrFail($id);

        return inertia('Admin/Nasional/Ekoran/Edit', [
            'ekoran' => $ekoran
        ]);
    }

    public function update(EkoranRequest $request, string $id)
    {
        // Cegah timeout untuk proses upload gambar yang mungkin memakan waktu
        set_time_limit(0);

        $ekoran = Ekoran::findOrFail($id);
        $validated = $request->validated();

        // 1. Siapkan data dasar
        // Pastikan key konsisten dengan frontend (saya samakan dengan method store: emagazine_id)
        $ekoranData = [
            'title'        => $validated['title'],
            'datepub'      => $validated['datepub'],
            'emagazine_id' => $validated['emagazine_id'] ?? null,
            'status'       => $validated['status'],
            'modified_by'  => auth()->id(),
            'modified'     => now(),
        ];

        try {
            // --- 2. Pemrosesan Halaman Reguler (img1 - img20) ---
            for ($i = 1; $i <= 20; $i++) {
                $index = $i - 1;
                $colName = 'img' . $i;
                $fileKey = "regular_pages.{$index}";

                // Skenario A: Ada file FISIK baru di index ini
                if ($request->hasFile($fileKey)) {
                    $ekoranData[$colName] = $this->uploadToCdn($request->file($fileKey), "ekoran_reguler_{$i}");
                } else {
                    // Skenario B & C: Ambil string url dari input (jika ada)
                    $oldUrl = $request->input($fileKey);

                    if (!empty($oldUrl) && $oldUrl !== 'null') {
                        $ekoranData[$colName] = $oldUrl; // Skenario B: Mempertahankan gambar lama
                    } else {
                        $ekoranData[$colName] = null;   // Skenario C: User menghapus gambar
                    }
                }
            }

            // --- 3. Pemrosesan Halaman Promo (img21 - img22) ---

            for ($i = 21; $i <= 22; $i++) {
                $index = $i - 21;
                $colName = 'img' . $i;
                $fileKey = "spesial_pages.{$index}";

                if ($request->hasFile($fileKey)) {
                    $ekoranData[$colName] = $this->uploadToCdn($request->file($fileKey), "ekoran_promo_{$i}");
                } else {
                    $oldUrl = $request->input($fileKey);
                    $ekoranData[$colName] = (!empty($oldUrl) && $oldUrl !== 'null') ? $oldUrl : null;
                }
            }

            // --- 4. Transaksi Database ---
            // PRAKTIK TERBAIK: Panggil transaksi DB HANYA setelah semua proses I/O selesai.
            DB::beginTransaction();

            $ekoran->update($ekoranData);

            DB::commit();

            return redirect()->route('admin.nasional.ekoran.index')
                ->with('success', 'Edisi eKoran berhasil diperbarui.');
        } catch (\Exception $e) {
            // Hanya rollback jika transaksi DB memang sedang berjalan
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            return back()->withErrors(['error' => 'Gagal memperbarui data: ' . $e->getMessage()]);
        }
    }
}
