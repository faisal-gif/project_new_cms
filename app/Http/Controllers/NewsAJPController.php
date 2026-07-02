<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublishNewsAjpRequest;
use App\Models\EditorNasional;
use App\Models\FokusNasional;
use App\Models\KanalNasional;
use App\Models\NewsBerbayar;
use App\Models\NewsNasional;
use App\Models\WriterNasional;
use App\Services\CdnService;
use App\Services\NewsNasionalTagService;
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
            ->orderByDesc('datetime')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/AJP/News/Index', [
            'news'    => $news,
            'filters' => $request->only(['search', 'status']),
        ]);
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
                'is_code'          => $request->is_code,
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
