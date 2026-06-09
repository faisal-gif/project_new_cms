<?php

namespace App\Http\Controllers;

use App\Exports\NewsDaerahExport;
use App\Http\Requests\NewsDaerahFormRequest;
use App\Models\EditorDaerah;
use App\Models\FokusDaerah;
use App\Models\KanalDaerah;
use App\Models\NetworkDaerah;
use App\Models\NewsDaerah;
use App\Models\TagsDaerah;
use App\Models\WriterDaerah;
use App\Services\CdnService;
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
        protected CdnService $cdnService
    ) {}

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
            ->with(['kanal:id,name', 'writer:id,name', 'fokus:id,name']);

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
        return $query->orderByRaw("
        CASE status
            WHEN 2 THEN 1
            WHEN 3 THEN 2
            WHEN 1 THEN 3
            WHEN 0 THEN 4
        END
        ")->orderBy('created_at', 'DESC');
    }


    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $query = $this->buildQuery($request);
        // Faster pagination
        $news = $query->simplePaginate(10)->withQueryString();


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
        // Gunakan koneksi mysql_daerah untuk transaksi
        DB::connection('mysql_daerah')->beginTransaction();

        try {
            $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

            // 1. Proses Upload image_thumbnail ke CDN
            $thumbnailUrl = null;

            // Pastikan input dari frontend (React) bernama 'image_thumbnail'
            if ($request->hasFile('image_thumbnail')) {
                $file = $request->file('image_thumbnail');

                // Pembatasan panjang nama file agar tidak ditolak CDN (Error 422)
                $nameThumbnail = Str::slug(Str::limit($request->title, 100, '')) . '-thumbnail';

                // Ambil URL dari response JSON CDN
                $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 3, 'convert', $applyWatermark) ?? null;
            }

            // 2. Inisialisasi Konten dan Tag
            $content = $request->is_content; // Mengambil dari state React 'is_content'
            $tagIds = [];
            $tagNames = []; // Digunakan untuk menyimpan string nama tag di DB

            // Proses Auto-Link Tag ke dalam Konten
            if ($request->has('tag') && is_array($request->tag)) {
                foreach ($request->tag as $tagName) {
                    $cleanTagName = strtolower(trim($tagName));

                    // Simpan nama tag bersih untuk kolom 'tag' di NewsDaerah
                    $tagNames[] = $cleanTagName;

                    // Simpan atau ambil tag dari database daerah
                    $tag = TagsDaerah::firstOrCreate([
                        'name' => $cleanTagName
                    ]);
                    $tagIds[] = $tag->id;

                    // REGEX: Memastikan tidak merusak HTML bawaan konten
                    $pattern = '/(?!(?:[^<]+>|[^>]+<\/a>))\b(' . preg_quote($tag->name, '/') . ')\b/iu';

                    // Route untuk tag (Sesuaikan URL jika portal daerah memiliki format slug tersendiri)
                    $tagSlug = Str::slug($tag->name);
                    $tagUrl = 'https://timesindonesia.co.id/tag/' . $tagSlug;

                    // Template HTML Anchor
                    $replacement = '<a href="' . $tagUrl . '" class="text-blue-600 hover:underline font-semibold" title="Baca lebih lanjut tentang $1">$1</a>';

                    // LIMIT: 1 -> Hanya mengubah kata PERTAMA yang ditemukan di konten
                    $content = preg_replace($pattern, $replacement, $content, 1);
                }
            }

            // 3. Simpan tabel News (Koneksi Daerah)
            $news = NewsDaerah::create([
                'is_code'      => $request->is_code ?? Str::random(8),
                'writer_id'    => $request->writer,
                'editor_id'    => $request->editor,
                'cat_id'       => $request->kanal,
                'fokus_id'     => $request->focus,
                'title'        => $request->title,
                'description'  => $request->description,
                'content'      => $content, // Menggunakan konten yang sudah terinjeksi tautan Tag
                'image'        => $thumbnailUrl,
                'caption'      => $request->image_caption,
                'status'       => $request->status,
                'locus'        => $request->locus,
                'datepub'      => $request->datepub ?? now(),
                'is_headline'  => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'       => $request->is_adv ? 1 : 0,
                'pin'          => $request->pin ? 1 : 0,
                'tag'          => !empty($tagNames) ? implode(',', $tagNames) : null, // Menggunakan array tagNames yang sudah dibersihkan
            ]);

            // 4. Simpan Relasi Tags (Many-to-Many)
            if (!empty($tagIds)) {
                // Pastikan method relasinya adalah tags() di model NewsDaerah
                $news->tags()->sync($tagIds);
            }

            // 5. Simpan Networks (Multiple Select)
            if ($request->has('network') && is_array($request->network)) {
                $news->networks()->sync($request->network);
            }

            DB::connection('mysql_daerah')->commit();

            return redirect()->route('admin.daerah.news.index')->with('success', 'Berita Daerah berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::connection('mysql_daerah')->rollBack();

            // Catat error di Log untuk keperluan audit backend
            Log::error('Store NewsDaerah Error: ' . $e->getMessage());

            return back()->withInput()->withErrors(['error' => 'Gagal simpan: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
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
            'canSelectAllNetwork' => auth()->user()->can('select-all-networks'),
        ]);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(NewsDaerahFormRequest $request, $id)
    {
        DB::connection('mysql_daerah')->beginTransaction();

        try {
            $news = NewsDaerah::findOrFail($id);
            $applyWatermark = $request->boolean('image_watermark') ? '1' : '0';

            // Default gunakan URL lama
            $thumbnailUrl = $news->image;

            // Proses Upload image_thumbnail HANYA jika ada file baru yang diunggah
            if ($request->hasFile('image_thumbnail')) {
                $file = $request->file('image_thumbnail');
                $nameThumbnail = Str::slug(Str::limit($request->title, 100, '')) . '-thumbnail';
                // Ambil URL dari response JSON CDN
                $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 1, 'convert', $applyWatermark) ?? null;
            }

            // Inisialisasi Konten dan Tag
            $content = $request->is_content;
            $tagIds = [];
            $tagNames = [];

            // Proses Auto-Link Tag ke dalam Konten (Aman untuk Update berkat Regex)
            if ($request->has('tag') && is_array($request->tag)) {
                foreach ($request->tag as $tagName) {
                    $cleanTagName = strtolower(trim($tagName));
                    $tagNames[] = $cleanTagName;

                    // Simpan atau ambil tag dari database daerah
                    $tag = TagsDaerah::firstOrCreate([
                        'name' => $cleanTagName
                    ]);
                    $tagIds[] = $tag->id;

                    // REGEX: Mengabaikan teks yang sudah menjadi link <a> sebelumnya
                    $pattern = '/(?!(?:[^<]+>|[^>]+<\/a>))\b(' . preg_quote($tag->name, '/') . ')\b/iu';

                    $tagSlug = Str::slug($tag->name);
                    $tagUrl = 'https://timesindonesia.co.id/tag/' . $tagSlug;

                    $replacement = '<a href="' . $tagUrl . '" class="text-blue-600 hover:underline font-semibold" title="Baca lebih lanjut tentang $1">$1</a>';

                    // LIMIT 1: Hanya mengubah 1 kata pertama yang belum memiliki link
                    $content = preg_replace($pattern, $replacement, $content, 1);
                }
            }

            // 1. Update tabel News
            $news->update([
                'writer_id'    => $request->writer,
                'editor_id'    => $request->editor,
                'cat_id'       => $request->kanal,
                'fokus_id'     => $request->focus,
                'title'        => $request->title,
                'description'  => $request->description,
                'content'      => $content, // Menggunakan konten hasil Regex
                'image'        => $thumbnailUrl,
                'caption'      => $request->image_caption,
                'status'       => $request->status,
                'locus'        => $request->locus,
                'datepub'      => $request->datepub ?? now(),
                'is_headline'  => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'       => $request->is_adv ? 1 : 0,
                'pin'          => $request->pin ? 1 : 0,
                'tag'          => !empty($tagNames) ? implode(',', $tagNames) : null,
            ]);

            // 2. Sync Tags (Many-to-Many)
            // Cukup gunakan $tagIds, array kosong otomatis menghapus relasi jika user hapus semua tag di FE
            $news->tags()->sync($tagIds);

            // 3. Sync Networks (Multiple Select)
            if ($request->has('network') && is_array($request->network)) {
                $news->networks()->sync($request->network);
            } else {
                $news->networks()->sync([]);
            }

            DB::connection('mysql_daerah')->commit();

            return redirect()->route('admin.daerah.news.index')->with('success', 'Berita Daerah berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::connection('mysql_daerah')->rollBack();

            // Log error untuk audit
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
