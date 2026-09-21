<?php

namespace App\Http\Controllers;

use App\Exports\NewsDaerahExport;
use App\Http\Requests\NewsDaerahFormRequest;
use App\Http\Requests\NewsNasionalImportFormRequest;
use App\Jobs\CrawlAffiliateLink;
use App\Models\Editor;
use App\Models\EditorDaerah;
use App\Models\EditorNasional;
use App\Models\FokusDaerah;
use App\Models\FokusNasional;
use App\Models\KanalDaerah;
use App\Models\KanalNasional;
use App\Models\NetworkDaerah;
use App\Models\News;
use App\Models\NewsCommerceNasional;
use App\Models\NewsDaerah;
use App\Models\NewsNasional;
use App\Models\TagsDaerah;
use App\Models\Writer;
use App\Models\WriterDaerah;
use App\Models\WriterNasional;
use App\Services\CdnService;
use App\Services\NewsDaerahTagService;
use App\Services\NewsNasionalTagService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class NewsDaerahController extends Controller
{

    public function __construct(
        protected CdnService $cdnService,
        protected NewsDaerahTagService $tagService,
        protected NewsNasionalTagService $tagNasionalService
    ) {}

    /**
     * Link publik per network: https://{domain}/news/{kanal-slug}/{is_code}/{judul-slug}
     * Dipakai index() dan show(); jangan digandakan supaya bentuk URL-nya tidak hanyut.
     */
    private function shareLinks(NewsDaerah $item)
    {
        $titleSlug = Str::slug($item->title);
        // Fallback ke slug dari nama kanal bila kolom slug kosong.
        $kanalSlug = filled($item->kanal?->slug)
            ? $item->kanal->slug
            : Str::slug($item->kanal?->name ?? '');

        return $item->networks->map(fn($net) => [
            'network' => $net->name,
            'url' => ($kanalSlug !== '' && filled($item->is_code))
                ? "https://{$net->domain}/news/{$kanalSlug}/{$item->is_code}/{$titleSlug}"
                : null,
        ])->filter(fn($l) => $l['url'])->values();
    }

    // Ekstrak query builder agar reusable
    private function buildQuery(Request $request)
    {
        $query = NewsDaerah::query()
            ->select(
                'id',
                'pin_urgent',
                'pin',
                'is_code',
                'cat_id',
                'fokus_id',
                'title',
                'writer_id',
                'datepub',
                'views',
                'is_headline',
                'status',
                'created_at'
            )
            ->with([
                'kanal:id,name,slug',
                'writer:id,name',
                'fokus:id,name',
                // Network aktif tempat berita ini tayang — untuk copy link per network.
                // status kolom ENUM: bandingkan string '1', bukan int 1 (MySQL menganggap
                // int sebagai indeks enum, bukan nilainya).
                'networks' => fn ($q) => $q->where('network.status', '1'),
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

        // Filter kanal
        if ($request->kanal) {
            $query->where('cat_id', $request->kanal);
        }

        // Filter fokus
        if ($request->fokus) {
            $query->where('fokus_id', $request->fokus);
        }

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // FILTER RENTANG TANGGAL (Date Range)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('datepub', [
                Carbon::parse($request->start_date)->startOfDay(), // 00:00:00
                Carbon::parse($request->end_date)->endOfDay(),     // 23:59:59
            ]);
        } elseif ($request->filled('start_date')) {
            $query->where('datepub', '>=', Carbon::parse($request->start_date)->startOfDay());
        } elseif ($request->filled('end_date')) {
            $query->where('datepub', '<=', Carbon::parse($request->end_date)->endOfDay());
        }

        // Optimized sorting
        return $query->orderBy('datepub', 'DESC');
    }


    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        // newsNasional di-load di sini, bukan di buildQuery(), supaya export()/report
        // tidak ikut membayar query lintas-database.
        $query = $this->buildQuery($request)
            ->with(['newsNasional' => fn($q) => $q
                ->select('news_id', 'is_code', 'news_title', 'news_datepub', 'news_status')
                ->where('is_code', '<>', '')]);
        // Faster pagination
        $news = $query->simplePaginate(10)->withQueryString();

        $news->getCollection()->transform(function ($item) {
            $item->share_links = $this->shareLinks($item);
            $item->unsetRelation('networks'); // payload sudah diringkas ke share_links
            return $item;
        });


        $writers = WriterDaerah::select('id', 'name')->where('status', '1')->get()
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => $u->name,
            ]);


        $kanals = KanalDaerah::select('id', 'name')->get()
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => $u->name,
            ]);

        $fokus = FokusDaerah::select('id', 'name')->get()
            ->map(fn($u) => [
                'value' => $u->id,
                'label' => $u->name,
            ]);

        return Inertia::render('Admin/Daerah/News/Index', [
            'news'    => $news,
            'writers' => $writers,
            'kanals' => $kanals,
            'fokus' => $fokus,
            'filters' => $request->only(['search', 'writer', 'kanal', 'status']),
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $auth = Auth::user();
        $kanal_daerah = KanalDaerah::select(['id', 'name'])->where('status', '1')->orderBy('created_at', 'DESC')->get()
            ->map(fn($k) => [
                'value' => $k->id,
                'label' => $k->name,
            ]);
        $focus_daerah = FokusDaerah::select(['id', 'name'])->where('status', '1')->orderBy('created_at', 'DESC')->get()
            ->map(fn($f) => [
                'value' => $f->id,
                'label' => $f->name,
            ]);
        $networks = NetworkDaerah::select(['id', 'name'])->where('status', '1')->get()
            ->map(fn($net) => [
                'value' => $net->id,
                'label' => $net->name,
            ]);
        $writers = WriterDaerah::select(['id', 'name'])->where('status', '1')->get()
            ->map(fn($w) => [
                'value' => $w->id,
                'label' => $w->name,
            ]);
        $editors = EditorDaerah::select(['id', 'name'])->where('status', '1')->get()
            ->map(fn($e) => [
                'value' => $e->id,
                'label' => $e->name,
            ]);



        return Inertia::render('Admin/Daerah/News/Create', [
            'kanal' => $kanal_daerah,
            'fokus' => $focus_daerah,
            'networks' => $networks,
            'writers' => $writers,
            'editors' => $editors,
            'hasEditor' => auth()->user()->hasRole('editor') ? true : false,
            'editor_id' => auth()->user()->editor ? auth()->user()->editor->id_daerah : null,
            'initialData' => [
                'datepub' => now()->format('Y-m-d\TH:i'), // Format untuk input type="datetime-local"
            ],
            'canSelectAllNetwork' => auth()->user()->can('select all networks'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NewsDaerahFormRequest $request)
    {
        $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

        // 1. Tentukan thumbnail. Foto galeri CDN sudah URL final; kalau tidak ada baru
        //    upload file (DI LUAR DB TRANSACTION agar tak mengunci row DB saat tunggu CDN).
        $thumbnailUrl = null;
        $thumbnailId = null; // hanya untuk file BARU yang di-upload (dihapus bila rollback)
        if ($request->filled('image_thumbnail_url')) {
            $thumbnailUrl = $request->image_thumbnail_url;
        } elseif ($request->hasFile('image_thumbnail')) {
            try {
                $file = $request->file('image_thumbnail');
                // Nama file dari input user agar mudah dicari di galeri CDN; fallback ke judul.
                $baseName = filled($request->image_name) ? $request->image_name : $request->title;
                $nameThumbnail = Str::slug(Str::limit($baseName, 100, '')) . '-thumbnail';
                $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 3, 'convert', $applyWatermark) ?? null;
                $thumbnailId = $this->cdnService->getLastUploadedId();
            } catch (\Exception $e) {
                return back()->withInput()->withErrors(['error' => 'Gagal mengunggah gambar ke CDN: ' . $e->getMessage()]);
            }
        }

        // Gunakan koneksi mysql_daerah untuk transaksi database yang cepat
        DB::connection('mysql_daerah')->beginTransaction();

        try {

            // 2. Pemrosesan Tag Melalui Service 
            $tagData = $this->tagService->processTags($request->tag, $request->is_content);
            // 3. Simpan tabel News (Koneksi Daerah)
            $news = NewsDaerah::create([
                'is_code'      => $request->is_code ?? Str::random(8),
                'writer_id'    => $request->writer,
                'editor_id'    => $request->editor,
                'cat_id'       => $request->kanal,
                'fokus_id'     => $request->focus,
                'title'        => $request->title,
                'description'  => $request->description,
                'content'      => $tagData['content'],
                'image'        => $thumbnailUrl,
                'caption'      => $request->image_caption,
                'status'       => $request->status || '1',
                'locus'        => $request->locus,
                'datepub'      => $request->datepub ?? now(),
                'is_headline'  => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'       => $request->is_adv ? 1 : 0,
                'pin'          => $request->pin ? 1 : 0,
                'tag'          => $tagData['tagString'],
            ]);

            // 4. Simpan Relasi Tags (Many-to-Many) dengan urutan terpelihara
            if (!empty($tagData['syncData'])) {
                $news->tags()->sync($tagData['syncData']);
            }

            // 5. Simpan Networks (Multiple Select)
            if ($request->has('network') && is_array($request->network)) {
                $news->networks()->sync($request->network);
            }

            DB::connection('mysql_daerah')->commit();

            return redirect()->route('admin.daerah.news.index')->with('success', 'Berita Daerah berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::connection('mysql_daerah')->rollBack();
            // Berita batal tersimpan: hapus gambar yang sudah terlanjur di-upload ke CDN.
            $this->cdnService->delete($thumbnailId);
            Log::error('Store NewsDaerah Error: ' . $e->getMessage());

            return back()->withInput()->withErrors(['error' => 'Gagal simpan: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // buildQuery() select-nya terlalu sempit untuk halaman detail (tidak ada content,
        // description, image, editor_id), jadi pakai query sendiri.
        $news = NewsDaerah::with([
            'kanal:id,name,slug',
            'writer:id,name',
            'fokus:id,name',
            'editor:id,name',
            'tags',
            'networks' => fn($q) => $q->where('network.status', '1'),
            'newsNasional' => fn($q) => $q->where('is_code', '<>', ''),
        ])->findOrFail($id);

        // Berita daerah bisa tayang di beberapa domain network sekaligus, jadi tidak ada
        // satu publicUrl seperti di Nasional.
        $shareLinks = $this->shareLinks($news);
        $news->unsetRelation('networks');

        return Inertia::render('Admin/Daerah/News/Show', [
            'news' => $news,
            'shareLinks' => $shareLinks,
        ]);
    }

    /**
     * Form import berita Daerah ke DB Nasional.
     * Memakai ulang halaman Admin/News/ImportNasional (sama dengan flow master -> nasional),
     * hanya sumber datanya yang ditukar ke NewsDaerah.
     */
    public function importNasional($id)
    {
        $news = NewsDaerah::with([
            'writer:id,name',
            'tags',
            'newsNasional' => fn($q) => $q->where('is_code', '<>', ''),
        ])->findOrFail($id);

        if ($news->newsNasional) {
            return back()->withErrors(['error' => 'Berita ini sudah ada di Nasional.']);
        }

        // is_code adalah kunci korelasi lintas-DB. Sebagian baris daerah lama belum punya,
        // jadi dibuatkan dan disimpan sekarang. Cek tabrakan di KEDUA sisi.
        if (blank($news->is_code)) {
            do {
                $code = Str::random(8);
            } while (
                NewsDaerah::where('is_code', $code)->exists()
                || NewsNasional::where('is_code', $code)->exists()
            );

            $news->update(['is_code' => $code]);
        }

        $user = Auth::user();

        // Jembatan penulis lintas-DB: tabel writers master memetakan id_daerah -> id_nasional.
        // Tidak ketemu -> null, biar user memilih manual (writer_id divalidasi exists).
        $bridge = $news->writer_id
            ? Writer::where('id_daerah', $news->writer_id)->first()
            : null;

        // Editor mengikuti artikelnya (kontinuitas redaksi), bukan user yang mengimpor:
        // editors master memetakan id_daerah -> id_ti (= EditorNasional.editor_id).
        $editorBridge = $news->editor_id
            ? Editor::where('id_daerah', $news->editor_id)->first()
            : null;
        $mappedEditor = $editorBridge?->id_ti
            ? EditorNasional::select('editor_id', 'editor_name', 'status')->find($editorBridge->id_ti)
            : null;
        $editorNasionalId = $mappedEditor?->editor_id ?: $user->editor?->id_ti;

        $writers = WriterNasional::select('id as value', 'name as label')->where('status', '1')->get();
        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->where('status', '1')->get();
        $kanal   = KanalNasional::select('catnews_id as value', 'catnews_title as label')->where('catnews_status', '1')->get();
        $fokus   = FokusNasional::select('focnews_id as value', 'focnews_title as label')->where('status', '1')->get();

        // Editor/penulis hasil pemetaan bisa non-aktif di Nasional. Tanpa disisipkan, field
        // editor (yang terkunci untuk role editor) tampil kosong padahal nilainya terisi.
        if ($mappedEditor && $mappedEditor->status !== '1' && $mappedEditor->status != 1) {
            $editors->prepend((object) [
                'value' => $mappedEditor->editor_id,
                'label' => $mappedEditor->editor_name . ' (non-aktif)',
            ]);
        }
        if ($bridge?->id_nasional && !$writers->contains(fn($w) => $w->value == $bridge->id_nasional)) {
            $inactiveWriter = WriterNasional::select('id', 'name')->find($bridge->id_nasional);
            if ($inactiveWriter) {
                $writers->prepend((object) [
                    'value' => $inactiveWriter->id,
                    'label' => $inactiveWriter->name . ' (non-aktif)',
                ]);
            }
        }

        // Berita lama menyimpan tag sebagai CSV di kolom tag tanpa baris pivot.
        $tags = $news->tags->isNotEmpty()
            ? $news->tags->pluck('name')->toArray()
            : array_values(array_filter(array_map('trim', explode(',', (string) $news->tag))));

        return Inertia::render('Admin/News/ImportNasional', [
            'news'            => $news,
            'writers'         => $writers,
            'editors'         => $editors,
            'kanal'           => $kanal,
            'fokus'           => $fokus,
            'commerceKanalId' => NewsCommerceNasional::KANAL_ID,
            'storeRoute'      => 'admin.daerah.news.import.nasional.store',
            'initialData'     => [
                'is_code'         => $news->is_code,
                'title'           => $news->title,
                'writer'          => $news->writer?->name ?: ($bridge?->name ?? ''),
                'writer_id'       => $bridge?->id_nasional,
                'description'     => $news->description,
                'content'         => $news->content,
                'tag'             => $tags,
                'image_caption'   => $news->caption ?? '',
                'image_thumbnail' => $news->image ?? '',
                'hasEditor'       => $user->hasRole('editor'),
                'editor_id'       => $editorNasionalId,
                'datepub'         => ($news->datepub ? Carbon::parse($news->datepub) : now())->format('Y-m-d\TH:i'),
                'locus'           => $news->locus ?? '',
            ],
        ]);
    }

    public function importNasionalStore(NewsNasionalImportFormRequest $request)
    {
        $isCode = $request->input('is_code');
        $source = NewsDaerah::where('is_code', $isCode)->firstOrFail();

        if (NewsNasional::where('is_code', $isCode)->exists()) {
            return back()->withInput()->withErrors(['error' => 'Berita ini sudah ada di Nasional.']);
        }

        // Kanal Commerce: hitung sekali, dipakai di dalam & sesudah transaksi.
        $hasLink = (int) $request->kanal === NewsCommerceNasional::KANAL_ID && filled($request->affiliate_link);

        DB::connection('mysql_nasional')->beginTransaction();

        try {
            // Auto-link tag ke dalam konten + koleksi ID tag nasional.
            $tagData = $this->tagNasionalService->processTags($request->tag, $request->is_content);

            $news = NewsNasional::create([
                'is_code'          => $isCode,
                'news_writer'      => $request->writer,
                'journalist_id'    => $request->writer_id,
                'editor_id'        => $request->editor,
                'catnews_id'       => $request->kanal,
                'focnews_id'       => $request->focus,
                'news_title'       => $request->title,
                'news_description' => $request->description,
                'news_content'     => $tagData['content'],
                'news_image_new'   => $request->image_thumbnail,
                'news_caption'     => $request->image_caption,
                'news_status'      => $request->status,
                'news_city'        => $request->locus,
                'news_datepub'     => $request->datepub ?? now(),
                'news_headline'    => $request->is_headline ? 1 : 0,
                'news_tags'        => $tagData['tagString'],
            ]);

            if (!empty($tagData['syncData'])) {
                $news->tags()->sync($tagData['syncData']);
            }

            if ($hasLink) {
                NewsCommerceNasional::create([
                    'news_id'        => $news->news_id,
                    'affiliate_link' => $request->affiliate_link,
                    'crawl_status'   => 'pending',
                ]);
            }

            DB::connection('mysql_nasional')->commit();
        } catch (\Exception $e) {
            DB::connection('mysql_nasional')->rollBack();
            Log::error('Import Daerah ke Nasional gagal: ' . $e->getMessage());

            return back()->withInput()->withErrors(['error' => 'Gagal simpan ke Nasional: ' . $e->getMessage()]);
        }

        // Koneksi default, jadi HARUS di luar transaksi mysql_nasional (rollback tak bisa
        // membatalkannya). Berita native daerah bisa tidak punya baris master -> null-safe.
        News::where('is_code', $isCode)->first()?->update(['distribution_status' => 2]);

        // Dispatch SETELAH commit agar worker tidak jalan sebelum baris ter-commit.
        if ($hasLink) {
            CrawlAffiliateLink::dispatch($news->news_id);
        }

        activity('Import Berita')
            ->performedOn($source)
            ->causedBy(Auth::user())
            ->withProperties([
                'attributes' => [
                    'action'           => 'Import Daerah ke Nasional',
                    'news_nasional_id' => $news->news_id,
                    'is_code'          => $isCode,
                    'title'            => $news->news_title,
                    'datepub'          => $news->news_datepub,
                    'status'           => $news->news_status,
                ]
            ])
            ->log('Import Ke Nasional');

        return redirect()->route('admin.daerah.news.index')->with('success', 'Berita Nasional berhasil diterbitkan!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $user = auth()->user();
        // 1. Ambil data berita beserta relasi tag dan network
        // Pastikan koneksi dan nama relasi sesuai dengan model NewsDaerah kamu
        $news = NewsDaerah::on('mysql_daerah')->with(['tags', 'networks'])->findOrFail($id);

        // Format tags menjadi array string biasa (contoh: ['pemilu', 'malang']) 
        // agar komponen InputTag di React (data.tag) bisa membacanya dengan benar.
        $news->tags_array = $news->tags->pluck('name')->toArray();

        // 2. Ambil data untuk opsi Dropdown & Select
        // Sesuaikan Model ini dengan struktur database daerah kamu
        $writers = WriterDaerah::select('id as value', 'name as label')->get();
        $editors = EditorDaerah::select('id as value', 'name as label')->get();
        $kanal = KanalDaerah::select('id as value', 'name as label')->get();
        $fokus = FokusDaerah::select('id as value', 'name as label')->get();

        // Asumsi ada tabel networks
        $networks = NetworkDaerah::select('id as value', 'name as label')->get();

        // 3. Return ke view menggunakan Inertia
        return inertia('Admin/Daerah/News/Edit', [
            'news'     => $news,
            'writers'  => $writers,
            'editors'  => $editors,
            'kanal'    => $kanal,
            'fokus'    => $fokus,
            'networks' => $networks,
            'hasEditor' => auth()->user()->hasRole('editor') ? true : false, // Tambahkan flag untuk role editor
            'editor_id' => $news->editor_id ?: ($user->hasRole('editor') ? $user->editor?->id_daerah : null),
            'canSelectAllNetwork' => auth()->user()->can('select-all-networks'),
        ]);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(NewsDaerahFormRequest $request, $id)
    {
        // Cari data lama di luar transaksi DB untuk mendapatkan path gambar lama
        $news = NewsDaerah::findOrFail($id);
        $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

        // Default gunakan URL lama
        $thumbnailUrl = $news->image;

        // 1. Tentukan thumbnail: foto galeri CDN (URL final) diprioritaskan; kalau tidak
        //    ada baru upload file (DI LUAR DB TRANSACTION).
        // Simpan id gambar BARU saja; gambar lama tidak boleh dihapus saat rollback.
        $newThumbnailId = null;
        if ($request->filled('image_thumbnail_url')) {
            $thumbnailUrl = $request->image_thumbnail_url;
        } elseif ($request->hasFile('image_thumbnail')) {
            try {
                $file = $request->file('image_thumbnail');
                // Nama file dari input user agar mudah dicari di galeri CDN; fallback ke judul.
                $baseName = filled($request->image_name) ? $request->image_name : $request->title;
                $nameThumbnail = Str::slug(Str::limit($baseName, 100, '')) . '-thumbnail';
                $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 1, 'convert', $applyWatermark) ?? null;
                $newThumbnailId = $this->cdnService->getLastUploadedId();
            } catch (\Exception $e) {
                return back()->withInput()->withErrors(['error' => 'Gagal mengunggah gambar baru ke CDN: ' . $e->getMessage()]);
            }
        }

        // Mulai transaksi database daerah
        DB::connection('mysql_daerah')->beginTransaction();

        try {

            // 2. Proses Auto-Link Tag ke dalam Konten
            $tagData = $this->tagService->processTags($request->tag, $request->is_content);
            // 3. Update tabel News Daerah
            $news->update([
                'writer_id'    => $request->writer,
                'editor_id'    => $request->editor,
                'cat_id'       => $request->kanal,
                'fokus_id'     => $request->focus,
                'title'        => $request->title,
                'description'  => $request->description,
                'content'      => $tagData['content'],
                'image'        => $thumbnailUrl,
                'caption'      => $request->image_caption,
                'status'       => $request->status,
                'locus'        => $request->locus,
                'datepub'      => $request->datepub ?? now(),
                'is_headline'  => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'       => $request->is_adv ? 1 : 0,
                'pin'          => $request->pin ? 1 : 0,
                'tag'          => $tagData['tagString'],
            ]);

            // 4. Sync urutan Tags ke tabel pivot Daerah
            $news->tags()->sync($tagData['syncData']);

            // 5. Sync Networks (Multiple Select)
            if ($request->has('network') && is_array($request->network)) {
                $news->networks()->sync($request->network);
            } else {
                $news->networks()->sync([]);
            }

            DB::connection('mysql_daerah')->commit();

            return redirect()->route('admin.daerah.news.index')->with('success', 'Berita Daerah berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::connection('mysql_daerah')->rollBack();
            // Update batal: hapus HANYA gambar baru yang terlanjur di-upload (bukan gambar lama).
            $this->cdnService->delete($newThumbnailId);
            Log::error('Update NewsDaerah Error: ' . $e->getMessage());

            return back()->withInput()->withErrors(['error' => 'Gagal update: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function export(Request $request)
    {

        $query = $this->buildQuery($request);
        $fileName = 'laporan-news-daerah';
        if ($request->filled('kanal')) {
            $fileName .= '-' . Str::slug($request->kanal);
        }

        if ($request->filled('status')) {
            $fileName .= '-' . Str::slug($request->status);
        }

        if ($request->filled('writer')) {

            $writerName = WriterDaerah::where('id', $request->writer)->value('name'); // Sesuaikan field 'name'

            if ($writerName) {
                $fileName .= '-' . Str::slug($writerName);
            } else {
                $fileName .= '-writer-' . $request->writer;
            }
        }

        // 3. Tambahkan format timestamp
        $fileName .= '-' . now()->format('Ymd-His');

        // 4. Tambahkan ekstensi file
        $fileName .= '.xlsx';

        return Excel::download(new NewsDaerahExport($query), $fileName);
    }
}
