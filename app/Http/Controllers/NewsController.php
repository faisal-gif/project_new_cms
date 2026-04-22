<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsDaerahImportFormRequest;
use App\Http\Requests\NewsFormRequest;
use App\Http\Requests\NewsNasionalImportFormRequest;
use App\Models\EditorDaerah;
use App\Models\EditorNasional;
use App\Models\FokusDaerah;
use App\Models\FokusNasional;
use App\Models\KanalDaerah;
use App\Models\KanalNasional;
use App\Models\NetworkDaerah;
use App\Models\News;
use App\Models\NewsDaerah;
use App\Models\NewsImages;
use App\Models\NewsNasional;
use App\Models\NewsTags;
use App\Models\Tags;
use App\Models\TagsDaerah;
use App\Models\TagsNasional;
use App\Models\Writer;
use App\Models\WriterDaerah;
use App\Models\WriterNasional;
use App\Services\CdnService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NewsController extends Controller
{

    public function __construct(
        protected CdnService $cdnService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 1. Ambil data berita (DB 1 & Relasi DB 2/3)
        try {
            $query = News::query()
                ->select('id', 'is_code', 'title', 'writer_id', 'created_at')
                ->with([
                    'writer:id,name',
                    'newsDaerah.kanal',
                    'newsDaerah.writer',
                    'newsNasional.kanal',
                    'newsNasional.writer',
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

            $news = $query->latest()->simplePaginate(10)->withQueryString();
        } catch (QueryException $e) {
            // Jika DB News atau relasinya mati, kembalikan data kosong yang valid untuk frontend
            Log::error('DB News/Relasi Error: ' . $e->getMessage());

            // Paginator kosong agar Inertia/Vue tidak error saat loop/render
            $news = new Paginator([], 10);
        }

        // 2. Ambil data dropdown filter (Koneksi DB Lainnya)
        try {
            $writers = WriterDaerah::select('id', 'name')
                ->where('status', '1')
                ->get()
                ->map(fn($u) => [
                    'value' => $u->id,
                    'label' => $u->name,
                ]);
        } catch (QueryException $e) {
            // Jika DB WriterDaerah mati, dropdown cukup dikosongkan
            Log::error('DB WriterDaerah Error: ' . $e->getMessage());
            $writers = collect();
        }

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
        $writers = Writer::select(['id', 'name'])->where('status', '1')->get()
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


            $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

            // 2. Proses Upload image_thumbnail ke CDN
            $thumbnailUrl = null;

            // Pastikan input dari frontend (React) bernama 'image_thumbnail'
            if ($request->hasFile('image_thumbnail')) {
                $file = $request->file('image_thumbnail');
                $nameThumbnail = Str::slug($request->judul, '-Thumbnail');
                // Ambil URL dari response JSON CDN
                $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 1, 'convert', $applyWatermark) ?? null;
            }
            // 1. Simpan tabel News
            $news = News::create([
                'is_code'     => Str::random(8),
                'writer_id'   => $request->writer,
                'title'       => $request->judul,
                'description' => $request->description,
                'image_thumbnail' => $thumbnailUrl, // Simpan URL thumbnail dari CDN
                'image_caption' => $request->image_caption,
                'content'     => $request->content,
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

        $news = News::with(['writer', 'tags'])->where('is_code', $is_code)->firstOrFail();

        // 2. Ambil data pendukung dari DB Daerah untuk dropdown
        $writers = WriterDaerah::select('id as value', 'name as label')->where('status', '1')->get();
        $editors = EditorDaerah::select('id as value', 'name as label')->where('status', '1')->get();
        $networks = NetworkDaerah::select('id as value', 'name as label')->where('status', '1')->get();
        $kanal = KanalDaerah::select('id as value', 'name as label')->where('status', '1')->get();
        $fokus = FokusDaerah::select('id as value', 'name as label')->where('status', '1')->get();

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
                'writer_id' => $news->writer->id_daerah ?? null, // Ambil ID penulis dari relasi writer
                'writer_network_id' => $news->writer->network_id ?? null,
                'description' => $news->description,
                'content' => $news->content,
                'tag' => $news->tags->pluck('name')->toArray(),
                'image_caption' => $news->image_caption ?? '',
                'image_thumbnail' => $news->image_thumbnail ?? '',

            ]
        ]);
    }

    public function importDaerahStore(NewsDaerahImportFormRequest $request)
    {

        // Gunakan koneksi mysql_daerah untuk transaksi
        DB::connection('mysql_daerah')->beginTransaction();

        try {
            // 1. Simpan tabel News (Koneksi Daerah)
            // Sesuaikan nama field 'cat_id', 'fokus_id' dsb sesuai skema DB daerah kamu
            $news = NewsDaerah::create([
                'is_code'     => $request->is_code ?? Str::random(8),
                'writer_id'   => $request->writer,
                'editor_id'   => $request->editor,
                'cat_id'      => $request->kanal, // kanal di form dipetakan ke cat_id
                'fokus_id'    => $request->focus,
                'title'       => $request->title,
                'description' => $request->description,
                'content'     => $request->is_content, // dari state react 'is_content'
                'image'       => $request->image_thumbnail, // Simpan URL thumbnail di field 'image'
                'caption'     => $request->image_caption,
                'status'      => $request->status,
                'locus'       => $request->locus,
                'datepub'     => $request->datepub ?? now(),
                'is_headline' => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'      => $request->is_adv ? 1 : 0,
                'pin'         => $request->pin ? 1 : 0,
            ]);

            // 3. Simpan Tags (Many-to-Many)
            if ($request->has('tag') && is_array($request->tag)) {
                $tagIds = collect($request->tag)->map(function ($tagName) {
                    return TagsDaerah::firstOrCreate([
                        'name' => strtolower(trim($tagName))
                    ])->id;
                });
                $news->tags()->sync($tagIds);
                // Catatan: Jika relasi di model NewsDaerah kamu namanya 'tags', ganti news() jadi tags()
            }

            // 4. Simpan Networks (Multiple Select)
            if ($request->has('network') && is_array($request->network)) {
                // Karena network biasanya ID yang sudah ada, langsung sync
                $news->networks()->sync($request->network);
            }

            DB::connection('mysql_daerah')->commit();

            return redirect()->route('admin.news.index')->with('success', 'Berita Daerah berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::connection('mysql_daerah')->rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal simpan: ' . $e->getMessage()]);
        }
    }

    public function importNasional($is_code)
    {
        // 1. Coba ambil dari DB Daerah dulu
        $news = News::with(['writer', 'tags'])->where('is_code', $is_code)->firstOrFail();

        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->where('status', '1')->get();
        // Pastikan model Writer ini sesuai dengan nama model untuk DB Nasional kamu
        $writers = WriterNasional::select('id as value', 'name as label')->where('status', '1')->get();

        // 2. Ambil data pendukung dari DB Nasional untuk dropdown
        $kanal = KanalNasional::select('catnews_id as value', 'catnews_title as label')->where('catnews_status', '1')->get();
        $fokus = FokusNasional::select('focnews_id as value', 'focnews_title as label')->where('status', '1')->get();

        return Inertia::render('Admin/News/ImportNasional', [
            'news' => $news,
            'writers' => $writers,
            'editors' => $editors,
            'kanal' => $kanal,
            'fokus' => $fokus,

            // Pre-fill data untuk React useForm
            'initialData' => [
                'is_code' => $news->is_code ?? '',
                'title' => $news->title ?? '',

                // Masukkan variabel yang sudah kita racik di atas
                'writer' => $news->writer->name ?? '', // Jika $initialWriter adalah objek WriterDaerah, ambil namanya
                'writer_id' => $news->writer->id_nasional ?? '', // Jika $initialWriter adalah objek WriterDaerah, ambil ID-nya
                'editor_id' => '',
                'datepub' => $news->datepub ?? '',
                'locus' => $news->locus ?? '',
                'description' => $news->description ?? '',
                'content' => $news->content ?? '',
                'tag' => $news->tags ? $news->tags->pluck('name')->toArray() : [],
                'image_caption' => $news->caption ?? $news->image_caption ?? '',
                'image_thumbnail' => $news->image ?? $news->image_thumbnail ?? '',
            ]
        ]);
    }

    public function importNasionalStore(NewsNasionalImportFormRequest $request)
    {
        // Gunakan koneksi mysql_nasional untuk transaksi
        DB::connection('mysql_nasional')->beginTransaction();

        try {
            // 1. Simpan tabel News (Koneksi Nasional)
            // Asumsi nama modelnya adalah NewsNasional (berdasarkan kode controller sebelumnya)
            $news = NewsNasional::create([
                'is_code'      => $request->is_code ?? Str::random(8),
                'news_writer'    => $request->writer,
                'journalist_id'   => $request->writer_id, // Simpan ID penulis di kolom journalist_id
                'editor_id'    => $request->editor,
                'catnews_id'       => $request->kanal,
                'focnews_id'     => $request->focus,
                'news_title'        => $request->title,
                'news_description'  => $request->description,
                'news_content'      => $request->is_content,
                'news_image_new'        => $request->image_thumbnail,
                'news_caption'      => $request->image_caption,
                'news_status'       => $request->status ?? '3', // Beri default jika status kosong
                'news_city'        => $request->locus,
                'news_datepub'      => $request->datepub ?? now(),
                'news_headline'  => $request->is_headline ? 1 : 0,
                'news_tags' => implode(',', $request->tag ?? []), // Simpan tag sebagai string, nanti bisa diubah ke relasi many-to-many jika diperlukan
            ]);

            // 2. Simpan Tags (Many-to-Many) ke tabel Tag Nasional
            if ($request->has('tag') && is_array($request->tag)) {
                $tagIds = collect($request->tag)->map(function ($tagName) {
                    // Gunakan model Tag (Nasional)
                    return TagsNasional::firstOrCreate([
                        'name' => strtolower(trim($tagName))
                    ])->id;
                });

                // Pastikan relasi di model News kamu bernama 'tags'
                $news->tags()->sync($tagIds);
            }

            DB::connection('mysql_nasional')->commit();

            // Ubah route tujuan sesuai dengan halaman index berita nasional kamu
            return redirect()->route('admin.news.index')->with('success', 'Berita Nasional berhasil diterbitkan!');
        } catch (\Exception $e) {

            DB::connection('mysql_nasional')->rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal simpan ke Nasional: ' . $e->getMessage()]);
        }
    }
}
