<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsFormRequest;
use App\Models\EditorDaerah;
use App\Models\FokusDaerah;
use App\Models\KanalDaerah;
use App\Models\KanalNasional;
use App\Models\NetworkDaerah;
use App\Models\News;
use App\Models\NewsImages;
use App\Models\NewsTags;
use App\Models\Tags;
use App\Models\WriterDaerah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = News::query()
            ->select(
                'id',
                'is_code',
                'title',
                'writer_id',
                'created_at'
            )->with([
                'writer:id,name',
                'newsDaerah.kanal',
            ]);


        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $search = $request->search;

                if (is_numeric($search)) {
                    $q->where('id', $search);
                } else {
                    $q->where('title', 'like', "%{$search}%");
                }
            });
        }

        // Filter writer
        if ($request->writer) {
            $query->where('writer_id', $request->writer);
        }


        // Faster pagination
        $news = $query->latest()->simplePaginate(10)->withQueryString();

        $writers = WriterDaerah::select('id', 'name')->where('status', '1')->get()
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => $u->name,
            ]);

        return Inertia::render('Admin/News/Index', [
            'news'    => $news,
            'writers' => $writers,
            'filters' => $request->only(['search', 'writer', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $auth = Auth::user();
        $writers = WriterDaerah::select(['id', 'name'])->get()
            ->map(fn($w) => [
                'value' => $w->id,
                'label' => $w->name,
            ]);


        return Inertia::render('Admin/News/Create', [
            'writers' => $writers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NewsFormRequest $request)
    {
        // Memulai Database Transaction
        DB::beginTransaction();

        try {
            // 1. Simpan tabel News
            $news = News::create([
                'is_code'     => Str::random(8),
                'writer_id'   => $request->writer,
                'title'       => $request->judul,
                'description' => $request->description,
                'content'     => $request->content,
            ]);

            $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

            // 2. Proses Upload image_thumbnail ke CDN
            $thumbnailUrl = null;

            // Pastikan input dari frontend (React) bernama 'image_thumbnail'
            if ($request->hasFile('image_thumbnail')) {
                $file = $request->file('image_thumbnail');

                // Tembak langsung API CDN
                $response = Http::withHeaders([
                    'x-api-key' => 'QgwJShcyArAEGqLXKZ3xzcu4'
                ])->attach(
                    'file', // Key 'file' sesuai dengan form-data API CDN
                    file_get_contents($file->getPathname()),
                    $file->getClientOriginalName()
                )->post('https://cdn.tin.co.id/api/v1/images/upload', [
                    'name'          => Str::slug($request->judul) . '-thumbnail',
                    'category_id'   => '1', // Sesuaikan dengan kategori yang diinginkan
                    'process_type'  => 'convert',
                    'add_watermark' => $applyWatermark, 
                ]);

                // Jika gagal ke CDN, lemparkan error agar DB di-rollback
                if (!$response->successful()) {
                    throw new \Exception('Gagal mengupload thumbnail ke CDN: ' . $response->body());
                }

                $data = $response->json();

                // Ambil URL dari response JSON CDN
                $thumbnailUrl = $data['data']['url'] ?? $data['url'] ?? null;
            }

            // Simpan URL gambar ke tabel (asumsi disimpan di image_url pada tabel NewsImages)
            NewsImages::create([
                'news_id'     => $news->id,
                'writer_id'   => $request->writer,
                'image_url'   => $thumbnailUrl, // Menyimpan link CDN di sini
                'caption'     => $request->image_caption,
            ]);

            // 3. Proses Tags
            if ($request->has('tag')) {
                $tagIds = collect($request->tag)->map(function ($tagName) {
                    return Tags::firstOrCreate([
                        'name' => strtolower(trim($tagName))
                    ])->id;
                });

                $news->tags()->sync($tagIds);
            }

            // Jika semua sukses, simpan permanen ke database
            DB::commit();

            return redirect()->route('admin.news.index')->with('success', 'Berita berhasil disimpan!');
        } catch (\Exception $e) {
            // Jika ada error (termasuk dari CDN), batalkan insert ke database
            DB::rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal menyimpan berita: ' . $e->getMessage()]);
        }
    }

    public function importDaerah($is_code)
    {
        // 1. Ambil data dari DB Utama sebagai master data
        $news = News::with(['writer', 'tags', 'images'])->where('is_code', $is_code)->firstOrFail();


        // 2. Ambil data pendukung dari DB Daerah untuk dropdown
        $writers = WriterDaerah::select('id as value', 'name as label')->get();
        $editors = EditorDaerah::select('id as value', 'name as label')->get();
        $networks = NetworkDaerah::select('id as value', 'name as label')->get();
        $kanal = KanalDaerah::select('id as value', 'name as label')->get();
        $fokus = FokusDaerah::select('id as value', 'name as label')->get();

        return Inertia::render('Admin/News/ImportDaerah', [
            'news' => $news,
            'writers' => $writers,
            'editors' => $editors,
            'networks' => $networks,
            'kanal' => $kanal,
            'fokus' => $fokus,
            // Pre-fill data untuk React useForm
            'initialData' => [
                'is_code' => $news->is_code,
                'title' => $news->title,
                'writer_id' => $news->writer_id,
                'writer_network_id' => $news->writer->network_id ?? null,
                'description' => $news->description,
                'content' => $news->content,
                'tag' => $news->tags->pluck('name')->toArray(),
                'image_caption' => $news->images->caption ?? '',
                'image_1' => $news->images->image_url ?? '',
                'image_2' => $news->images->image_url_2 ?? '',
                'image_3' => $news->images->image_url_3 ?? '',
            ]
        ]);
    }
}
