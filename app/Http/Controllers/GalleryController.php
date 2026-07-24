<?php

namespace App\Http\Controllers;

use App\Http\Requests\GalleryRequest;
use App\Models\EditorNasional;
use App\Models\Gallery;
use App\Models\GalleryCategory;
use App\Models\GalleryImage;
use App\Models\WriterNasional;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\In;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function __construct(
        protected CdnService $cdnService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 1. Tangkap parameter filter dari React
        $search = $request->query('search');
        $status = $request->query('status');
        $writer = $request->query('writer');
        $category  = $request->query('category');

        // [BARU] 2. Cek Role User yang sedang login
        $user = auth()->user();
        // Sesuaikan nama field role dan valuenya dengan database Anda (misal: 'role', 'level', atau menggunakan Spatie)
        $isFotografer = $user->hasRole('fotografer');
        // Sesuaikan dengan relasi/field ID fotografer pada user
        $fotograferId = $user->id_fotografer ?? null; // Pastikan ini sesuai dengan struktur database Anda


        // 3. Query Utama dengan Filter
        $galleries = Gallery::with(['kanal'])
            ->withCount('images') // [BARU] Ini akan otomatis membuat kolom 'images_count'
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('gal_title', 'like', "%{$search}%")
                        ->orWhere('gal_id', 'like', "%{$search}%");
                });
            })
            ->when(strlen($status) > 0, function ($query) use ($status) {
                $query->where('gal_status', $status);
            })
            // Filter dari dropdown (jika admin yang memfilter)
            ->when($writer, function ($query, $writer) {
                $query->where('fotografer_id', $writer);
            })
            ->when($category, function ($query, $category) {
                $query->where('gal_catid', $category);
            })
            // [BARU] Filter wajib jika yang login adalah Fotografer itu sendiri
            ->when($isFotografer, function ($query) use ($fotograferId) {
                // Saya gunakan 'fotografer_id' mengikuti kolom di filter $writer Anda
                $query->where('fotografer_id', $fotograferId);
            })
            ->orderBy('gal_datepub', 'desc')
            ->paginate(10)
            ->withQueryString();

        // 4. Siapkan data untuk dropdown filter (React-Select)
        // Opsional: Jika yang login fotografer, mungkin Anda tidak perlu mengirim daftar semua writer?
        $writers = WriterNasional::select('id as value', 'name as label')->where('status', 1)->get();
        $categories = GalleryCategory::select('id as value', 'title as label')->get();

        // 5. Kirim payload ke Inertia
        return Inertia::render('Admin/Nasional/Fotografi/Index', [
            'galleries'    => $galleries,
            'writers'      => $writers,
            'categories'   => $categories,
            'filters'      => $request->only(['search', 'status', 'writer', 'category']), // Typo diperbaiki: 'kanal' -> 'category'
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->where('status', 1)->get();
        $writers = WriterNasional::select('id as value', 'name as label')->where('status', 1)->get();
        $categories = GalleryCategory::select('id as value', 'title as label')->get();

        $user = auth()->user();

        return Inertia::render('Admin/Nasional/Fotografi/Create', [
            'editors' => $editors,
            'writers' => $writers,
            'categories' => $categories,
            'isFotografer'     => $user->hasRole('fotografer'),
            'userFotograferId' => $user->id_fotografer ?? null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(GalleryRequest $request)
    {
        // Buat galeri (metadata saja). Foto ditambahkan satu per satu di halaman Edit.
        $validated = $request->validated();

        $gallery = Gallery::create([
            'gal_catid' => $validated['categoryId'],
            'gal_title' => $validated['title'],
            'gal_subtitle' => $validated['subtitle'] ?? null,
            'gal_description' => $validated['description'] ?? null,
            'gal_content' => $validated['content'] ?? null,
            'gal_city' => $validated['city'] ?? null,
            'gal_pewarta' => $validated['fotografer'] ?? null,
            'fotografer_id' => $validated['fotografer_id'] ?? null,
            'editor_id' => $validated['editor'] ?? null,
            'gal_status' => $validated['status'],
            'gal_datepub' => $validated['datepub'],
            'created_by' => Auth::id() ?? 1,
            'created' => now(),
            'gal_view' => 1,
        ]);

        return redirect()
            ->route('admin.nasional.fotografi.edit', $gallery->gal_id)
            ->with('success', 'Galeri dibuat. Sekarang tambahkan foto satu per satu.');
    }

    /**
     * Tambah satu foto ke galeri yang sudah ada (upload langsung ke CDN).
     */
    public function storeImage(Request $request, $galleryId)
    {
        $validated = $request->validate([
            'file'     => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'caption'  => ['nullable', 'string', 'max:255'],
            'is_cover' => ['nullable', 'boolean'],
        ]);

        $gallery = Gallery::findOrFail($galleryId);

        $fileNameToCDN = Str::slug($gallery->gal_title) . '-' . time();
        $cdnImageUrl = $this->cdnService->uploadImage($validated['file'], $fileNameToCDN, 7, 'convert', true) ?? null;

        if (!$cdnImageUrl) {
            return back()->withErrors(['file' => 'Gagal mengunggah gambar ke CDN.']);
        }

        // Foto pertama otomatis cover; jika user memilih cover, lepaskan cover lama.
        $isCover = $request->boolean('is_cover') || $gallery->images()->count() === 0;
        if ($isCover) {
            GalleryImage::where('gal_id', $gallery->gal_id)->update(['gi_cover' => 0]);
        }

        GalleryImage::create([
            'gal_id'     => $gallery->gal_id,
            'gi_image'   => $cdnImageUrl,
            'gi_caption' => $validated['caption'] ?? null,
            'gi_cover'   => $isCover ? 1 : 0,
            'gi_status'  => 1,
            'created_by' => Auth::id() ?? 1,
            'created'    => now(),
        ]);

        return back()->with('success', 'Foto berhasil ditambahkan.');
    }

    /**
     * Hapus satu foto dari galeri.
     */
    public function destroyImage($imageId)
    {
        $image = GalleryImage::findOrFail($imageId);
        $wasCover = $image->gi_cover === 1;
        $galId = $image->gal_id;
        $image->delete();

        // Jika cover terhapus, jadikan foto tersisa berikutnya sebagai cover.
        if ($wasCover) {
            $next = GalleryImage::where('gal_id', $galId)->orderBy('created', 'desc')->first();
            $next?->update(['gi_cover' => 1]);
        }

        return back()->with('success', 'Foto berhasil dihapus.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Gallery $gallery)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $gallery = Gallery::findOrFail($id);
        $gallery->load(['images' => function ($query) {
            // Urutkan agar gambar cover selalu muncul pertama di UI
            $query->orderBy('gi_cover', 'desc')->orderBy('created', 'desc');
        }]);


        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->where('status', 1)->get();
        $writers = WriterNasional::select('id as value', 'name as label')->where('status', 1)->get();
        $categories = GalleryCategory::select('id as value', 'title as label')->get();

        $user = auth()->user();

        return Inertia::render('Admin/Nasional/Fotografi/Edit', [
            'gallery'    => $gallery,
            'categories' => $categories,
            'editors'    => $editors,
            'writers'    => $writers,
            'isFotografer' => $user->hasRole('fotografer'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(GalleryRequest $request, $id)
    {

        $gallery = Gallery::findOrFail($id);
        // 1. Ambil semua data yang sudah divalidasi oleh GalleryRequest
        $validated = $request->validated();
        $user_id = Auth::id() ?? 1;

        // Memulai Transaksi: Jika gagal di tengah jalan (misal CDN error), semua dibatalkan
        DB::beginTransaction();

        try {
            // 2. Update Informasi Utama Galeri
            $gallery->update([
                'gal_catid'       => $validated['categoryId'],
                'gal_title'       => $validated['title'],
                'gal_subtitle'    => $validated['subtitle'] ?? null,
                'gal_description' => $validated['description'] ?? null,
                'gal_content'     => $validated['content'] ?? null,
                'gal_city'        => $validated['city'] ?? null,
                'gal_pewarta'     => $validated['fotografer'] ?? null,
                'fotografer_id'   => $validated['fotografer_id'] ?? null,
                'editor_id'       => $validated['editor'] ?? null,
                'gal_status'      => collect(['pending' => 0, 'publish' => 1, 'review' => 2, 'on_pro' => 3])->get($validated['status'], $validated['status']),
                'gal_datepub'     => $validated['datepub'],
                'modified_by'      => $user_id,
                'modified'      => now(),
            ]);

            // 3. Eksekusi Penghapusan Gambar Lama (Deleted Images)
            if (!empty($validated['deleted_images'])) {
                // Ambil gambar dari DB untuk mendapatkan URL-nya jika Anda ingin menghapus dari CDN
                $imagesToDelete = GalleryImage::whereIn('gi_id', $validated['deleted_images'])->get();

                foreach ($imagesToDelete as $img) {

                    $img->delete();
                }
            }

            // 4. Update Metadata Gambar yang Tersisa (Caption & Cover)
            if (!empty($validated['existing_images_meta'])) {
                foreach ($validated['existing_images_meta'] as $meta) {
                    GalleryImage::where('gi_id', $meta['id'])->update([
                        'gi_caption' => $meta['caption'] ?? null,
                        'gi_cover'   => $meta['is_cover'] ? 1 : 0,
                    ]);
                }
            }

            // 5. Upload & Insert Gambar Baru (New Images)
            if (!empty($validated['new_images'])) {
                foreach ($validated['new_images'] as $index => $image) {
                    $file = $image['file'];
                    $fileNameToCDN = Str::slug($validated['title']) . '-' . time() . '-' . $index;

                    $cdnImageUrl = $this->cdnService->uploadImage($file, $fileNameToCDN, 7, 'convert', true) ?? null;
                    if (!$cdnImageUrl) {
                        throw new \Exception('Respons CDN tidak mengembalikan URL yang valid.');
                    }

                    // Simpan URL CDN ke database
                    GalleryImage::create([
                        'gal_id'     => $gallery->gal_id, // Gunakan primary key galeri
                        'gi_image'   => $cdnImageUrl,
                        'gi_caption' => $image['caption'] ?? null,
                        'gi_cover'   => $image['is_cover'] ? 1 : 0,
                        'gi_status'  => 1,
                        'created_by' => $user_id,
                        'created'    => now(),
                    ]);
                }
            }

            // Jika semua proses di atas (1-5) sukses, permanenkan ke database
            DB::commit();

            return redirect()
                ->route('admin.nasional.fotografi.index')
                ->with('success', 'Galeri berhasil diperbarui!');
        } catch (\Exception $e) {
            // Batalkan semua perubahan DB jika terjadi error
            DB::rollBack();
            Log::error('Error Update Gallery ID ' . $gallery->gal_id . ': ' . $e->getMessage());

            // Kembalikan user ke form edit dengan pesan error
            return back()->withErrors([
                'error' => 'Gagal memperbarui galeri: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Gallery $gallery)
    {
        //
    }
}
