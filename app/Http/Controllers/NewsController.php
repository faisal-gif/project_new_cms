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
use App\Models\NewsNasional;
use App\Models\Tags;
use App\Models\Writer;
use App\Models\WriterDaerah;
use App\Models\WriterNasional;
use App\Services\CdnService;
use App\Services\NewsDaerahTagService;
use App\Services\NewsNasionalTagService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NewsController extends Controller implements HasMiddleware
{

    public function __construct(
        protected CdnService $cdnService,
        protected NewsDaerahTagService $tagDaerahService,
        protected NewsNasionalTagService $tagNasionalService
    ) {}

    public static function middleware(): array
    {
        return [
            // User butuh permission 'view news master' untuk melihat daftar (index) atau detail (show)
            new Middleware('permission:view news master', only: ['index', 'show']),

            // User butuh permission 'create news' untuk melihat form tambah (create) dan menyimpan data (store)
            new Middleware('permission:create news master', only: ['create', 'store']),

            // User butuh permission 'edit news' untuk melihat form edit (edit) dan memperbarui data (update)
            new Middleware('permission:edit news master', only: ['edit', 'update']),

            // User butuh permission 'import nasional news master' untuk melihat form import nasional (importNasional) dan menyimpan data ke nasional (importNasionalStore)
            new Middleware('permission:import nasional news master', only: ['importNasional', 'importNasionalStore']),

            // User butuh permission 'import daerah news master' untuk melihat form import daerah (importDaerah) dan menyimpan data ke daerah (importDaerahStore)
            new Middleware('permission:import daerah news master', only: ['importDaerah', 'importDaerahStore']),

            // User butuh permission 'delete news' untuk menghapus data (destroy)
            new Middleware('permission:delete news master', only: ['destroy']),
        ];
    }


    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 1. Ambil data berita (DB 1 & Relasi DB 2/3)
        try {
            $query = News::query()
                ->select('id', 'is_code', 'title', 'writer_id', 'distribution_status', 'created_at')
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

            if ($request->filled('distribution_status')) {
                $query->where('distribution_status', $request->distribution_status);
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
            $writers = Writer::select('id', 'name')
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
            'filters' => $request->only(['search', 'writer', 'distribution_status']),
        ]);
    }

    public function show($news)
    {
        // 1. Ambil data beserta relasinya (Eager Loading)
        // Gunakan nama relasi persis seperti yang Anda tulis di model News.php
        $news = News::with([
            'tags:id,name',
            'writer:id,name',
            'newsDaerah:id,is_code,title,status,cat_id,datepub',
            'newsDaerah.kanal:id,name',
            'newsNasional:news_id,is_code,news_title,news_status,catnews_id,news_datepub',
            'newsNasional.kanal:catnews_id,catnews_title',
            'notes.user:id,full_name' // <--- TAMBAHKAN BARIS INI
        ])->findOrFail($news);


        // 2. Kirim data ke frontend React (Inertia)
        // Pastikan path string di bawah ini sesuai dengan lokasi file Show.jsx Anda
        return Inertia::render('Admin/News/Show', [
            'news' => $news,
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
        $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

        // 1. Proses Upload image_thumbnail ke CDN (DI LUAR DB TRANSACTION)
        // Kita tidak boleh menahan koneksi DB saat menunggu respon jaringan dari CDN.
        $thumbnailUrl = null;
        if ($request->hasFile('image_thumbnail')) {
            try {
                $file = $request->file('image_thumbnail');
                $nameThumbnail = Str::slug(Str::limit($request->judul, 100, '')) . '-thumbnail';

                // Ambil URL dari response JSON CDN
                $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 3, 'convert', $applyWatermark) ?? null;
            } catch (\Exception $e) {
                // Jika upload gagal, kembalikan response sebelum menyentuh database sama sekali
                return back()->withInput()->withErrors(['error' => 'Gagal mengunggah gambar ke CDN: ' . $e->getMessage()]);
            }
        }

        // Memulai Database Transaction HANYA untuk operasi database yang cepat (I/O memory/disk)
        DB::beginTransaction();

        try {
            $syncData = [];

            if ($request->has('tag') && is_array($request->tag)) {
                foreach ($request->tag as $index => $tagName) {
                    $cleanTagName = strtolower(trim($tagName));

                    $tag = Tags::firstOrCreate([
                        'name' => $cleanTagName
                    ]);

                    $syncData[$tag->id] = ['sort_order' => $index];
                }
            }
            // 3. Simpan tabel News
            $news = News::create([
                'is_code'         => Str::random(8),
                'writer_id'       => $request->writer,
                'title'           => $request->judul,
                'description'     => $request->description,
                'image_thumbnail' => $thumbnailUrl,
                'image_caption'   => $request->image_caption,
                'content'         => $request->content,
            ]);

            // 4. Proses Sync Tags dengan urutan (Sort Order)
            if (!empty($syncData)) {
                $news->tags()->sync($syncData);
            }

            // 5. Activity Logging Spatie
            activity('News Master')
                ->performedOn($news)
                ->causedBy(auth()->user())
                ->withProperties([
                    'attributes' => [
                        'title'     => $news->title,
                        'writer_id' => $news->writer_id,
                        'tags'      => $request->tag ?? [],
                    ]
                ])
                ->log('Membuat berita Master baru');

            // Jika semua operasi DB sukses, simpan permanen ke database
            DB::commit();

            return redirect()->route('admin.news.index')->with('success', 'Berita berhasil disimpan!');
        } catch (\Exception $e) {
            // Batalkan semua operasi insert/update di database jika ada script yang gagal
            DB::rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal menyimpan berita: ' . $e->getMessage()]);
        }
    }

    public function importDaerah($is_code)
    {

        $news = News::with(['writer', 'writer.daerah.network:id,name', 'tags'])->where('is_code', $is_code)->firstOrFail();

        $user = auth()->user();
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
                'hasEditor' => $user->hasRole('editor') ? true : false,
                'editor_id' => $user->editor ? $user->editor->id_daerah : null, // Set editor_id default ke editor yang sedang login, jika ada
                'datepub' => $news->created_at->format('Y-m-d\TH:i'), // Format untuk input type="datetime-local"
                'locus' => strtoupper($news->writer->daerah->network->name ?? ''),
            ],
            'canSelectAllNetwork' => $user->can('select all networks'),
        ]);
    }

    public function importDaerahStore(NewsDaerahImportFormRequest $request)
    {
        // Gunakan koneksi mysql_daerah untuk transaksi
        DB::connection('mysql_daerah')->beginTransaction();

        try {
            $isCode = $request->input('is_code');
            $masterNews = News::where('is_code', $isCode)->firstOrFail();
            $isExistInNasional = NewsNasional::where('is_code', $isCode)->exists();

            $newStatus = $isExistInNasional ? 2 : 1;

            $masterNews->update([
                'distribution_status' => $newStatus,
            ]);

            // 1. Proses Auto-Link Tag ke dalam Konten & Koleksi ID Tag
            $tagData = $this->tagDaerahService->processTags($request->tag, $request->is_content);
            // 2. Simpan tabel News (Koneksi Daerah)
            $news = NewsDaerah::create([
                'is_code'      => $request->is_code,
                'writer_id'    => $request->writer,
                'editor_id'    => $request->editor,
                'cat_id'       => $request->kanal,
                'fokus_id'     => $request->focus,
                'title'        => $request->title,
                'description'  => $request->description,
                'content'      => $tagData['content'], // Menggunakan konten yang sudah terinjeksi tautan Tag
                'image'        => $request->image_thumbnail,
                'caption'      => $request->image_caption,
                'status'       => $request->status,
                'locus'        => $request->locus,
                'datepub'      => $request->datepub ?? now(),
                'is_headline'  => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'       => $request->is_adv ? 1 : 0,
                'pin'          => $request->pin ? 1 : 0,
                'tag'          => $tagData['tagString'], // Menggunakan array tag yang sudah dibersihkan
            ]);

            // 3. Simpan Tags (Many-to-Many) dengan Urutan yang Terpelihara
            if (!empty($tagData['syncData'])) {
                $news->tags()->sync($tagData['syncData']);
            }

            // 4. Simpan Networks (Multiple Select)
            if ($request->has('network') && is_array($request->network)) {
                $news->networks()->sync($request->network);
            }

            activity('Import Berita')
                ->performedOn($masterNews)
                ->causedBy(auth()->user())
                ->withProperties([
                    'attributes' => [
                        'action'          => 'Import ke Daerah',
                        'news_daerah_id'  => $news->is_code,
                        'title'           => $news->title,
                        'datepub'         => $news->datepub,
                        'status'          => $news->status,
                    ]
                ])
                ->log('Import Ke Daerah');

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
        $news = News::with(['writer', 'writer.daerah.network:id,name', 'tags'])->where('is_code', $is_code)->firstOrFail();
        $user = auth()->user();

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
                'description' => $news->description ?? '',
                'content' => $news->content ?? '',
                'tag' => $news->tags ? $news->tags->pluck('name')->toArray() : [],
                'image_caption' => $news->caption ?? $news->image_caption ?? '',
                'image_thumbnail' => $news->image ?? $news->image_thumbnail ?? '',
                'hasEditor' => $user->hasRole('editor') ? true : false,
                'editor_id' => $user->editor ? $user->editor->id_ti : null,
                'datepub' => $news->created_at->format('Y-m-d\TH:i'),
                'locus' => strtoupper($news->writer->daerah->network->name ?? ''),
            ]
        ]);
    }

    public function importNasionalStore(NewsNasionalImportFormRequest $request)
    {
        // Gunakan koneksi mysql_nasional untuk transaksi
        DB::connection('mysql_nasional')->beginTransaction();

        try {
            $isCode = $request->input('is_code');
            $masterNews = News::where('is_code', $isCode)->firstOrFail();
            $isExistInDaerah = NewsDaerah::where('is_code', $isCode)->exists();

            $newStatus = $isExistInDaerah ? 2 : 1;

            $masterNews->update([
                'distribution_status' => $newStatus,
            ]);

            // 1. Proses Auto-Link Tag ke dalam Konten & Koleksi ID Tag
            $tagData = $this->tagNasionalService->processTags($request->tag, $request->is_content);

            // 2. Simpan tabel News (Koneksi Nasional)
            $news = NewsNasional::create([
                'is_code'          => $request->is_code ?? Str::random(8),
                'news_writer'      => $request->writer,
                'journalist_id'    => $request->writer_id, // Simpan ID penulis di kolom journalist_id
                'editor_id'        => $request->editor,
                'catnews_id'       => $request->kanal,
                'focnews_id'       => $request->focus,
                'news_title'       => $request->title,
                'news_description' => $request->description,
                'news_content'     => $tagData['content'], // 🔴 Menggunakan konten yang sudah terinjeksi tautan Tag
                'news_image_new'   => $request->image_thumbnail,
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

            activity('Import Berita')
                ->performedOn($masterNews) // Mengikat log ini ke berita Master
                ->causedBy(auth()->user()) // Siapa yang melakukan import
                ->withProperties([
                    'attributes' => [
                        'action'           => 'Import ke Nasional',
                        'news_nasional_id' => $news->is_code,
                        'title'            => $news->news_title,
                        'datepub'          => $news->news_datepub,
                        'status'           => $news->news_status,
                    ]
                ])
                ->log('Import Ke Nasional');

            DB::connection('mysql_nasional')->commit();

            return redirect()->route('admin.news.index')->with('success', 'Berita Nasional berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::connection('mysql_nasional')->rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal simpan ke Nasional: ' . $e->getMessage()]);
        }
    }
}
