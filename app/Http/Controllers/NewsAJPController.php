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
            ->with('writer:id,nama')
            ->where('type', '1')
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('is_code', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            // Urutkan berdasarkan waktu tayang (datetime) terbaru
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/AJP/News/Index', [
            'news'    => $news,
            'filters' => $request->only(['search', 'status']),
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
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                $imageName = Str::slug(Str::limit($validated['title'], 80, '')) . '-' . time();

                $imageUrl = $this->cdnService->uploadImage($file, $imageName, 3, 'convert', 0);
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

    public function publishStore(PublishNewsAjpRequest $request, $isCode)
    {
        // Gunakan koneksi mysql_nasional untuk transaksi
        DB::connection('mysql_nasional')->beginTransaction();

        try {

            $thumbnailUrl = null;
            if ($request->hasFile('image_thumbnail')) {
                try {
                    $file = $request->file('image_thumbnail');
                    $nameThumbnail = Str::slug(Str::limit($request->title, 100, '')) . '-thumbnail';
                    $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 3, 'convert', 0) ?? null;
                } catch (\Exception $e) {
                    return back()->withInput()->withErrors(['error' => 'Gagal mengunggah gambar ke CDN: ' . $e->getMessage()]);
                }
            }


            $tagData = $this->tagNasionalService->processTags($request->tag, $request->is_content);


            $news = NewsNasional::create([
                'is_code'          => $request->is_code || Str::random(10),
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
                'news_tags'        => $tagData['tagString'], // Menggunakan array tag yang sudah dibersihkan
            ]);

            // 3. Simpan Tags (Many-to-Many) ke tabel Tag Nasional dengan Urutan yang Terpelihara
            if (!empty($tagData['syncData'])) {
                $news->tags()->sync($tagData['syncData']);
            }

            $isCode = $request->input('is_code');
            $ajpNews = NewsBerbayar::where('is_code', $isCode)->firstOrFail();


            $ajpNews->update([
                'is_code' => $news->is_code,
                'status' => '1',
                'url' => 'https://timesindonesia.co.id/indonesia-positif/' . $news->news_id  . '/' . Str::slug($news->news_title),
            ]);

            DB::connection('mysql_nasional')->commit();

            return redirect()->route('admin.ajp.news.index')->with('success', 'Berita berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::connection('mysql_nasional')->rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal simpan ke Nasional: ' . $e->getMessage()]);
        }
    }
}
