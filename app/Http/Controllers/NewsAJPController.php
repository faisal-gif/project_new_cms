<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsAjpRequest;
use App\Http\Requests\PublishNewsAjpRequest;
use App\Models\EditorNasional;
use App\Models\FokusNasional;
use App\Models\KanalNasional;
use App\Models\NewsBerbayar;
use App\Models\NewsNasional;
use App\Models\WriterBerbayar;
use App\Models\WriterNasional;
use App\Services\CdnService;
use App\Services\NewsNasionalTagService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class NewsAJPController extends Controller
{

    public function __construct(
        protected CdnService $cdnService,
        protected NewsNasionalTagService $tagNasionalService
    ) {}

    public function index(Request $request)
    {
        $news = NewsBerbayar::query()
            ->with('writer:id,nama', 'newsNasional:is_code,news_id,news_title,news_status')
            ->where('type', '1')
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('is_code', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->filled('member'), function ($query) use ($request) {
                $query->where('pewarta_id', $request->member);
            })
            // Urutkan berdasarkan waktu tayang (datetime) terbaru
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        // Daftar member (pewarta) yang benar-benar punya berita AJP — untuk dropdown filter.
        $memberIds = NewsBerbayar::where('type', '1')->distinct()->pluck('pewarta_id');
        $members = WriterBerbayar::whereIn('id', $memberIds)
            ->orderBy('nama')
            ->get(['id as value', 'nama as label']);

        return Inertia::render('Admin/AJP/News/Index', [
            'news'    => $news,
            'members' => $members,
            'filters' => $request->only(['search', 'status', 'member']),
        ]);
    }

    public function create()
    {
        // FILTERING CERDAS: Hanya ambil penulis yang memenuhi syarat
        $writers = WriterBerbayar::select('id as value', 'nama as label', 'quota_news', 'dateexp')
            ->where('type', '1') // Hanya penulis AJP    
            ->where('status', '1') // Harus aktif
            ->where('quota_news', '>', 0) // Kuota harus ada
            ->where(function ($query) {
                // Masa aktif belum lewat hari ini, ATAU tidak memiliki masa aktif (null)
                $query->whereNull('dateexp')
                    ->orWhere('dateexp', '>=', Carbon::now()->startOfDay()->toDateString());
            })
            ->get();

        return Inertia::render('Admin/AJP/News/Create', [
            'writers' => $writers
        ]);
    }

    public function store(NewsAjpRequest $request)
    {
        $validated = $request->validated();

        $writer = WriterBerbayar::findOrFail($validated['pewarta_id']);

        if ($writer->quota_news <= 0) {
            return back()->withErrors([
                'pewarta_id' => 'Gagal! Penulis ini sudah tidak memiliki sisa kuota berita.'
            ])->withInput();
        }

        if ($writer->dateexp && Carbon::now()->startOfDay()->greaterThan(Carbon::parse($writer->dateexp))) {
            return back()->withErrors([
                'pewarta_id' => 'Gagal! Masa aktif paket penulis ini telah kadaluarsa.'
            ])->withInput();
        }

        $imageUrl = null;
        $imageId = null; // hanya untuk file BARU yang di-upload (dihapus bila rollback)
        $imageWatermark = $validated['image_watermark'] ?? false;
        if ($request->filled('image_url')) {
            // Foto dipilih dari galeri CDN — sudah URL final, tidak perlu upload.
            $imageUrl = $request->image_url;
        } elseif ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                // Nama file dari input user agar mudah dicari di galeri CDN; fallback ke judul.
                $baseName = filled($request->image_name) ? $request->image_name : $validated['title'];
                $imageName = Str::slug(Str::limit($baseName, 80, '')) . '-' . time();

                $imageUrl = $this->cdnService->uploadImage($file, $imageName, 3, 'convert', $imageWatermark ? 1 : 0);
                $imageId = $this->cdnService->getLastUploadedId();
            } catch (\Exception $e) {
                return back()->withErrors([
                    'image' => 'Sistem gagal mengunggah gambar ke CDN: ' . $e->getMessage()
                ])->withInput();
            }
        }

        try {
            DB::beginTransaction();

            $isCode = 'AJP-' . strtoupper(Str::random(8));

            NewsBerbayar::create([
                'is_code'    => $isCode,
                'pewarta_id' => $writer->id,
                'title'      => $validated['title'],
                'content'    => $validated['content'],
                'image'      => $imageUrl,
                'caption'    => $validated['caption'] ?? null,
                'city'       => $validated['city'] ?? null,
                'narsum'     => $validated['narsum'] ?? null,
                'profesi'    => $validated['profesi'] ?? null,
                'contact'    => $validated['contact'] ?? null,
                'datetime'   => now(),
                'type'       => 1,
                'status'     => 0,
                'created_by' => auth()->id(),
            ]);

            $writer->decrement('quota_news', 1);

            DB::commit();

            return redirect()->route('admin.ajp.news.index')
                ->with('success', 'Berita berhasil disimpan ke sistem dan kuota penulis telah disesuaikan.');
        } catch (\Exception $e) {
            DB::rollBack();
            // Berita batal tersimpan: hapus gambar yang sudah terlanjur di-upload ke CDN.
            $this->cdnService->delete($imageId);

            return back()->withErrors([
                'error' => 'Kegagalan pada database saat menyimpan berita: ' . $e->getMessage()
            ])->withInput();
        }
    }

    public function show($id)
    {
        // Gunakan eager loading untuk mengambil data relasi writer
        $news = NewsBerbayar::with('writer:id,nama,email', 'newsNasional:is_code,news_id,news_title,news_status')->findOrFail($id);


        if ($news->type != '1') {
            return redirect()->back()->with('error', 'Berita Ini bukan berita AJP');
        }

        return Inertia::render('Admin/AJP/News/Show', [
            'news' => $news,
        ]);
    }

    public function publish($id)
    {
        $user = Auth::user();
        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->get();
        $writers = WriterNasional::select('id as value', 'name as label')->get();
        $kanals = KanalNasional::select('catnews_id as value', 'catnews_title as label')->get();
        $fokus = FokusNasional::select('focnews_id as value', 'focnews_title as label')->get();
        // Gunakan eager loading untuk mengambil data relasi writer
        $news = NewsBerbayar::with('writer:id,nama,email')->findOrFail($id);


        return Inertia::render('Admin/AJP/News/PublishAJP', [
            'news' => $news,
            'editors' => $editors,
            'writers' => $writers,
            'kanal' => $kanals,
            'fokus' => $fokus,
            'hasEditor' => $user->hasRole('editor') ? true : false,
            'editor_id' => $user->editor ? $user->editor->id_ti : null,
        ]);
    }

    public function publishStore(PublishNewsAjpRequest $request, $id)
    {
        // 1. Tentukan is_code final di awal. 
        // Menggunakan filled() adalah best practice Laravel untuk mengecek string yang tidak kosong.
        $finalIsCode = $request->filled('is_code')
            ? $request->is_code
            : 'AJP-' . Str::upper(Str::random(8));

        // Id gambar BARU yang di-upload saat publish; dihapus dari CDN bila transaksi gagal.
        $newThumbnailId = null;

        // Gunakan koneksi mysql_nasional untuk transaksi
        DB::connection('mysql_nasional')->beginTransaction();

        try {
            $thumbnailUrl = null;
            $imageWatermark = $request->image_watermark;

            if ($request->hasFile('image_thumbnail')) {
                try {
                    $file = $request->file('image_thumbnail');
                    $nameThumbnail = Str::slug(Str::limit($request->title, 100, '')) . '-thumbnail';
                    $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 3, 'convert', $imageWatermark ? 1 : 0) ?? null;
                    $newThumbnailId = $this->cdnService->getLastUploadedId();
                } catch (\Exception $e) {
                    return back()->withInput()->withErrors(['error' => 'Gagal mengunggah gambar ke CDN: ' . $e->getMessage()]);
                }
            }

            $tagData = $this->tagNasionalService->processTags($request->tag, $request->is_content);

            $news = NewsNasional::create([
                'is_code'          => $finalIsCode, // 2. Gunakan variabel $finalIsCode di sini
                'editor_id'        => $request->editor,
                'catnews_id'       => '30',
                'news_title'       => $request->title,
                'news_description' => $request->description,
                'news_content'     => $tagData['content'],
                'news_image_new'   => $thumbnailUrl,
                'news_caption'     => $request->image_caption,
                'news_status'      => $request->status,
                'news_city'        => $request->locus,
                'news_datepub'     => $request->datepub ?? now(),
                'news_headline'    => $request->is_headline ? 1 : 0,
                'news_tags'        => $tagData['tagString'],
            ]);

            // 3. Simpan Tags (Many-to-Many) ke tabel Tag Nasional
            if (!empty($tagData['syncData'])) {
                $news->tags()->sync($tagData['syncData']);
            }

            // 4. Perbaikan Logika Query: 
            // Gunakan $isCode dari parameter (URL/Route) untuk mencari data original, bukan dari request.
            $ajpNews = NewsBerbayar::findOrFail($id);

            $ajpNews->update([
                'is_code' => $news->is_code,
                'status'  => '1',
                'url'     => 'https://timesindonesia.co.id/indonesia-positif/' . $news->news_id  . '/' . Str::slug($news->news_title),
            ]);

            DB::connection('mysql_nasional')->commit();

            return redirect()->route('admin.ajp.news.index')->with('success', 'Berita berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::connection('mysql_nasional')->rollBack();
            // Publish batal: hapus HANYA gambar baru yang terlanjur di-upload (bukan gambar lama).
            $this->cdnService->delete($newThumbnailId);

            return back()->withInput()->withErrors(['error' => 'Gagal simpan ke Nasional: ' . $e->getMessage()]);
        }
    }
}
