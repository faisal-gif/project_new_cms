<?php

namespace App\Http\Controllers;

use App\Exports\NewsNasionalExport;
use App\Http\Requests\NewsNasionalFormRequest;
use App\Models\EditorNasional;
use App\Models\FokusNasional;
use App\Models\KanalNasional;
use App\Models\NewsNasional;
use App\Models\TagsNasional;
use App\Models\WriterNasional;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class NewsNasionalController extends Controller
{

    public function __construct(
        protected CdnService $cdnService
    ) {}

    // Ekstrak query builder agar reusable
    private function buildQuery(Request $request)
    {
        $query = NewsNasional::query()
            ->select('news_id', 'is_code', 'catnews_id', 'news_title', 'news_writer', 'news_datepub', 'news_headline', 'news_status', 'created')
            ->with(['kanal:catnews_id,catnews_title,catnews_slug', 'viewData']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                if (is_numeric($request->search)) {
                    $q->where('news_id', $request->search);
                } else {
                    $q->where('news_title', 'like', "%{$request->search}%");
                }
            });
        }

        if ($request->writer) $query->where('news_writer', $request->writer);
        if ($request->kanal) $query->where('catnews_id', $request->kanal);
        if ($request->filled('status')) $query->where('news_status', $request->status);

        // FILTER RENTANG TANGGAL (Date Range)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('news_datepub', [
                Carbon::parse($request->start_date)->startOfDay(), // 00:00:00
                Carbon::parse($request->end_date)->endOfDay(),     // 23:59:59
            ]);
        } elseif ($request->filled('start_date')) {
            $query->where('news_datepub', '>=', Carbon::parse($request->start_date)->startOfDay());
        } elseif ($request->filled('end_date')) {
            $query->where('news_datepub', '<=', Carbon::parse($request->end_date)->endOfDay());
        }

        return $query->orderByRaw("
            CASE news_status
                WHEN 2 THEN 1 WHEN 3 THEN 2 WHEN 1 THEN 3 WHEN 0 THEN 4
            END
        ")->orderBy('created', 'DESC');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = $this->buildQuery($request);
        // Faster pagination
        $news = $query->simplePaginate(10)->withQueryString();


        $writers = WriterNasional::select('id', 'name')->where('status', '1')->get()
            ->map(fn($u) => [
                'value' => $u->name,
                'label' => $u->name,
            ]);

        $kanals = KanalNasional::select('catnews_id', 'catnews_title')->get()
            ->map(fn($u) => [
                'value' => $u->catnews_id,
                'label' => $u->catnews_title,
            ]);

        return Inertia::render('Admin/Nasional/News/Index', [
            'news'    => $news,
            'writers' => $writers,
            'kanals' => $kanals,
            'filters' => $request->only(['search', 'writer', 'kanal', 'status', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->get();
        $writers = WriterNasional::select('id as value', 'name as label')->get();
        $kanals = KanalNasional::select('catnews_id as value', 'catnews_title as label')->get();
        $fokus = FokusNasional::select('focnews_id as value', 'focnews_title as label')->get();

        return Inertia::render('Admin/Nasional/News/Create', [
            'editors' => $editors,
            'writers' => $writers,
            'kanal' => $kanals,
            'fokus' => $fokus,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NewsNasionalFormRequest $request)
    {
        // Gunakan koneksi mysql_nasional untuk transaksi
        DB::connection('mysql_nasional')->beginTransaction();

        try {
            $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

            // 2. Proses Upload image_thumbnail ke CDN
            $thumbnailUrl = null;

            // Pastikan input dari frontend (React) bernama 'image_thumbnail'
            if ($request->hasFile('image_thumbnail')) {
                $file = $request->file('image_thumbnail');
                $nameThumbnail = Str::slug($request->title, '-Thumbnail');
                // Ambil URL dari response JSON CDN
                $thumbnailUrl =   $this->cdnService->uploadImage($file, $nameThumbnail, 1, 'convert', $applyWatermark) ?? null;
            }

            // 1. Simpan tabel News (Koneksi Nasional)
            // Asumsi nama modelnya adalah NewsNasional (berdasarkan kode controller sebelumnya)
            $news = NewsNasional::create([
                'is_code'      => Str::random(8),
                'news_writer'    => $request->writer,
                'journalist_id' => $request->writer_id, // Simpan ID penulis di kolom journalist_id
                'editor_id'    => $request->editor,
                'catnews_id'       => $request->kanal,
                'focnews_id'     => $request->focus,
                'news_title'        => $request->title,
                'news_description'  => $request->description,
                'news_content'      => $request->is_content,
                'news_image_new'        =>  $thumbnailUrl,
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
            return redirect()->route('admin.nasional.news.index')->with('success', 'Berita Nasional berhasil diterbitkan!');
        } catch (\Exception $e) {

            DB::connection('mysql_nasional')->rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal simpan ke Nasional: ' . $e->getMessage()]);
        }
    }


    public function diagnose()
    {
        // 1. Buat Tag Dummy
        $testTag = \App\Models\TagsNasional::firstOrCreate([
            'name' => 'testing-tag-berhasil'
        ]);


        // 2. Buat News Dummy
        // PENTING: Isi data di bawah ini agar proses create() tidak error.
        $testNews = \App\Models\NewsNasional::create([
            'is_code'          => \Illuminate\Support\Str::random(8),
            'news_title'       => 'Test Berita Diagnostik2',
            'news_writer'      => 'Penulis Test',
            'catnews_id'       => 1, // Pastikan ID kanal 1 ada di database
            'news_status'      => '3',
        ]);

        // 3. Tes Simpan ke Pivot secara MANUAL (Bypass Eloquent)
        try {
            DB::connection('mysql_nasional')->table('news_tags')->insert([
                'news_id' => $testNews->news_id, // Ganti jadi 'id' kalau primary key tabel news kamu adalah 'id'
                'tag_id'  => $testTag->id
            ]);

            // Jika berhasil sampai sini, insert manual jalan!
            dd([
                'status' => 'SUKSES INSERT PIVOT MANUAL',
                'pesan' => 'Berarti masalah utamanya murni ada di penulisan fungsi ->tags() di dalam Model NewsNasional.php',
                'news_id' => $testNews->news_id,
                'tag_id' => $testTag->id
            ]);
        } catch (\Exception $e) {
            // Ini yang kita cari! Pesan error murni dari MySQL
            dd([
                'status' => 'DATABASE ERROR SAAT INSERT PIVOT',
                'pesan_asli_mysql' => $e->getMessage(),
                'solusi' => 'Periksa apakah tipe data kolom news_id/tag_id di tabel pivot sama persis dengan tabel aslinya.'
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(NewsNasional $newsNasional)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        // 1. Ambil data berita beserta relasi tag (Gunakan koneksi mysql_nasional)
        $news = NewsNasional::find($id)->with('tags')->findOrFail($id);

        // Format tags menjadi array string biasa untuk input frontend
        $news->tags_array = $news->tags->pluck('name')->toArray();

        // 2. Ambil data dropdown dari database mysql_nasional
        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->get();
        $writers = WriterNasional::select('id as value', 'name as label')->get();
        $kanal = KanalNasional::select('catnews_id as value', 'catnews_title as label')->get();
        $fokus = FokusNasional::select('focnews_id as value', 'focnews_title as label')->get();

        // 3. Return ke view Inertia
        return inertia('Admin/Nasional/News/Edit', [
            'news'    => $news,
            'writers' => $writers,
            'editors' => $editors,
            'kanal'   => $kanal,
            'fokus'   => $fokus,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(NewsNasionalFormRequest $request, $id)
    {
        DB::connection('mysql_nasional')->beginTransaction();

        try {
            $news = NewsNasional::on('mysql_nasional')->findOrFail($id);
            $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

            // Default: Gunakan URL lama jika user tidak upload file baru
            $thumbnailUrl = $news->news_image_new;

            // Proses Upload image_thumbnail HANYA jika ada file baru yang diunggah
            if ($request->hasFile('image_thumbnail')) {
                $file = $request->file('image_thumbnail');
                $nameThumbnail = Str::slug($request->title, '-Thumbnail');
                // Ambil URL dari response JSON CDN
                $thumbnailUrl =   $this->cdnService->uploadImage($file, $nameThumbnail, 1, 'convert', $applyWatermark) ?? null;
            }

            // 1. Update tabel News Nasional
            $news->update([
                'news_writer'      => $request->writer,
                'journalist_id'   => $request->writer_id, // Simpan ID penulis di kolom journalist_id
                'editor_id'        => $request->editor,
                'catnews_id'       => $request->kanal,
                'focnews_id'       => $request->focus,
                'news_title'       => $request->title,
                'news_description' => $request->description,
                'news_content'     => $request->is_content,
                'news_image_new'   => $thumbnailUrl, // Akan berisi URL baru atau lama
                'news_caption'     => $request->image_caption,
                'news_status'      => $request->status ?? '3',
                'news_city'        => $request->locus,
                'news_datepub'     => $request->datepub ?? now(),
                'news_headline'    => $request->is_headline ? 1 : 0,
                // Berdasarkan method store Anda sebelumnya, tag disimpan sebagai text di tabel ini juga
                'news_tags'        => implode(',', $request->tag ?? []),
            ]);

            // 2. Sync Tags (Many-to-Many) ke tabel Tag Nasional
            if ($request->has('tag') && is_array($request->tag)) {
                $tagIds = collect($request->tag)->map(function ($tagName) {
                    return TagsNasional::on('mysql_nasional')->firstOrCreate([
                        'name' => strtolower(trim($tagName))
                    ])->id;
                });
                $news->tags()->sync($tagIds);
            } else {
                $news->tags()->sync([]);
            }

            DB::connection('mysql_nasional')->commit();

            return redirect()->route('admin.nasional.news.index')->with('success', 'Berita Nasional berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::connection('mysql_nasional')->rollBack();
            return back()->withInput()->withErrors(['error' => 'Gagal update Nasional: ' . $e->getMessage()]);
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NewsNasional $newsNasional)
    {
        //
    }


    public function export(Request $request)
    {

        // Kita passing query yang sudah ter-filter ke dalam class Export
        $query = $this->buildQuery($request);



        return Excel::download(new NewsNasionalExport($query), 'laporan-news-nasional.xlsx');
    }
}
