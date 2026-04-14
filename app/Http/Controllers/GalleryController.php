<?php

namespace App\Http\Controllers;

use App\Http\Requests\GalleryRequest;
use App\Models\EditorNasional;
use App\Models\Gallery;
use App\Models\GalleryCategory;
use App\Models\GalleryImage;
use App\Models\WriterNasional;
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
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 1. Tangkap parameter filter dari React
        $search = $request->query('search');
        $status = $request->query('status');
        $writer = $request->query('writer');
        $category  = $request->query('category'); // Sesuaikan dengan nama parameter yang dikirim dari React-Select

        // 2. Query Utama dengan Filter
        $galleries = Gallery::with(['kanal']) // Eager load relasi untuk optimasi
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('gal_title', 'like', "%{$search}%")
                        ->orWhere('gal_id', 'like', "%{$search}%");
                });
            })
            // Gunakan strlen untuk memastikan angka '0' (Pending) tidak dianggap kosong
            ->when(strlen($status) > 0, function ($query) use ($status) {
                $query->where('gal_status', $status);
            })
            ->when($writer, function ($query, $writer) {
                $query->where('fotografer_id', $writer);
            })
            ->when($category, function ($query, $category) {
                $query->where('gal_catid', $category); // Sesuaikan dengan foreign key kategori Anda
            })
            ->orderBy('gal_datepub', 'desc')
            // 3. Paginasi & Pertahankan Query String
            ->paginate(10)
            ->withQueryString();

        // 4. Siapkan data untuk dropdown filter (React-Select)
        $writers = WriterNasional::select('id as value', 'name as label')->where('status', 1)->get();
        $categories = GalleryCategory::select('id as value', 'title as label')->get();

        // 5. Kirim payload ke Inertia
        return Inertia::render('Admin/Nasional/Fotografi/Index', [
            'galleries'    => $galleries, // Ini akan langsung dibaca oleh <PaginationDaisy data={news} />
            'writers' => $writers,
            'categories'  => $categories,
            'filters' => $request->only(['search', 'status', 'writer', 'kanal']),
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
        return Inertia::render('Admin/Nasional/Fotografi/Create', [
            'editors' => $editors,
            'writers' => $writers,
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(GalleryRequest $request)
    {
        // Jika kode sampai di baris ini, artinya validasi SUDAH LOLOS.
        // Kita tinggal mengambil data yang sudah divalidasi dan dibersihkan.
        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $user_id = Auth::id() ?? 1;
            $now = now();

            // 2. Insert tabel 'gallery'
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
                'created_by' => $user_id,
                'created' => $now,
                'gal_view' => 1,
            ]);


            // 3. Proses Upload Array Gambar
            // Karena kita menggunakan $request->file(), kita bisa memanggil loop dari Request utama
            foreach ($request->gallery_images as $index => $image) {

                $file = $image['file'];

                // Buat nama unik untuk file di CDN (mencegah bentrok)
                $fileNameToCDN = Str::slug($validated['title']) . '-' . time() . '-' . $index . '.' . $file->getClientOriginalExtension();


                // Tembak ke API CDN
                $response = Http::withHeaders([
                    'x-api-key' => 'QgwJShcyArAEGqLXKZ3xzcu4' // Sebaiknya ini dipindah ke .env nanti
                ])->attach(
                    'file',
                    file_get_contents($file->getPathname()),
                    $fileNameToCDN
                )->post('https://cdn.tin.co.id/api/v1/images/upload', [
                    // Sesuaikan payload ini dengan kebutuhan API CDN Anda
                    'name'          => $fileNameToCDN,
                    'category_id'   => 7, // Menggunakan ID kategori berita
                    'process_type'  => 'convert',

                    'add_watermark' => '1',
                ]);

                // Pastikan upload berhasil
                if (!$response->successful()) {
                    // Lempar exception agar transaksi DB di-rollback
                    throw new \Exception('Gagal mengunggah gambar ke CDN: ' . $response->body());
                }

                // Ambil URL/Path balasan dari CDN
                $responseData = $response->json();

                // ASUMSI: API CDN mengembalikan URL lengkap atau path pada key 'data.url' atau 'url'
                // Anda HARUS menyesuaikan ini dengan struktur response JSON dari API Anda
                $cdnImageUrl = $responseData['data']['url'] ?? $responseData['url'] ?? null;

                if (!$cdnImageUrl) {
                    throw new \Exception('Respons CDN tidak valid atau tidak mengembalikan URL.');
                }

                // 3. Simpan URL dari CDN ke tabel 'gallery_img'
                GalleryImage::create([
                    'gal_id' => $gallery->gal_id,
                    'gi_image' => $cdnImageUrl, // Simpan URL CDN
                    'gi_caption' => $image['caption'] ?? null,
                    'gi_cover' => $image['is_cover'] ? 1 : 0,
                    'gi_status' => 1,
                    'created_by' => $user_id,
                    'created' => $now,
                ]);
            }

            DB::commit();

            return redirect()
                ->route('admin.nasional.fotografi.index')
                ->with('success', 'Galeri fotografi berhasil dipublikasikan!');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error Store Gallery: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ])->withInput();
        }
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

        return Inertia::render('Admin/Nasional/Fotografi/Edit', [
            'gallery'    => $gallery,
            'categories' => $categories,
            'editors'    => $editors,
            'writers'    => $writers,
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
                    $fileNameToCDN = Str::slug($validated['title']) . '-' . time() . '-' . $index . '.' . $file->getClientOriginalExtension();

                    // Tembak ke API CDN (Sama seperti logika saat Create)
                    $response = Http::withHeaders([
                        'x-api-key' => env('CDN_TIN_API_KEY', 'QgwJShcyArAEGqLXKZ3xzcu4')
                    ])->attach(
                        'file',
                        file_get_contents($file->getPathname()),
                        $fileNameToCDN
                    )->post(env('CDN_TIN_UPLOAD_URL', 'https://cdn.tin.co.id/api/v1/images/upload'), [
                        'name'          => $fileNameToCDN,
                        'category_id'   => $validated['categoryId'],
                        'process_type'  => 'convert',
                        'add_watermark' => '1',
                    ]);

                    if (!$response->successful()) {
                        throw new \Exception('Gagal mengunggah gambar baru ke CDN: ' . $response->body());
                    }

                    $responseData = $response->json();
                    $cdnImageUrl = $responseData['data']['url'] ?? $responseData['url'] ?? null;

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
