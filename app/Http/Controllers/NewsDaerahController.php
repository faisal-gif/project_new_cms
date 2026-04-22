<?php

namespace App\Http\Controllers;

use App\Exports\NewsDaerahExport;
use App\Http\Requests\NewsDaerahFormRequest;
use App\Models\EditorDaerah;
use App\Models\FokusDaerah;
use App\Models\KanalDaerah;
use App\Models\NetworkDaerah;
use App\Models\NewsDaerah;
use App\Models\NewsDaerahImages;
use App\Models\TagsDaerah;
use App\Models\WriterDaerah;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
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
        if ($auth->role == 3) {
            $editors = EditorDaerah::where('user_id', $auth->id)->select(['id', 'name'])->first()
                ->map(fn($e) => [
                    'value' => $e->id,
                    'label' => $e->name,
                ]);
        }

        return Inertia::render('Admin/Daerah/News/Create', [
            'kanal' => $kanal_daerah,
            'fokus' => $focus_daerah,
            'networks' => $networks,
            'writers' => $writers,
            'editors' => $editors,
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

            // 2. Proses Upload image_thumbnail ke CDN
            $thumbnailUrl = null;

            // Pastikan input dari frontend (React) bernama 'image_thumbnail'
            if ($request->hasFile('image_thumbnail')) {
                $file = $request->file('image_thumbnail');
                $nameThumbnail = Str::slug($request->title, '-Thumbnail');
                // Ambil URL dari response JSON CDN
                $thumbnailUrl =   $this->cdnService->uploadImage($file, $nameThumbnail, 1, 'convert', $applyWatermark) ?? null;
            }

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
                'image'       => $thumbnailUrl, // Simpan URL thumbnail di field 'image'
                'caption'     => $request->image_caption,
                'status'      => $request->status,
                'locus'       => $request->locus,
                'datepub'     => $request->datepub ?? now(),
                'is_headline' => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'      => $request->is_adv ? 1 : 0,
                'pin'         => $request->pin ? 1 : 0,
                'tag'        => $request->tag ? implode(',', $request->tag) : null,
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

            return redirect()->route('admin.daerah.news.index')->with('success', 'Berita Daerah berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::connection('mysql_daerah')->rollBack();

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
                $nameThumbnail = Str::slug($request->title, '-Thumbnail');
                // Ambil URL dari response JSON CDN
                $thumbnailUrl =   $this->cdnService->uploadImage($file, $nameThumbnail, 1, 'convert', $applyWatermark) ?? null;
            }

            // 1. Update tabel News
            $news->update([
                'writer_id'   => $request->writer,
                'editor_id'   => $request->editor,
                'cat_id'      => $request->kanal,
                'fokus_id'    => $request->focus,
                'title'       => $request->title,
                'description' => $request->description,
                'content'     => $request->is_content,
                'image'       => $thumbnailUrl, // Menyimpan URL baru atau tetap yang lama
                'caption'     => $request->image_caption,
                'status'      => $request->status,
                'locus'       => $request->locus,
                'datepub'     => $request->datepub ?? now(),
                'is_headline' => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'      => $request->is_adv ? 1 : 0,
                'pin'         => $request->pin ? 1 : 0,
                'tag'        => $request->tag ? implode(',', $request->tag) : null,
            ]);

            // 2. Sync Tags (Many-to-Many)
            if ($request->has('tag') && is_array($request->tag)) {
                $tagIds = collect($request->tag)->map(function ($tagName) {
                    return TagsDaerah::firstOrCreate([
                        'name' => strtolower(trim($tagName))
                    ])->id;
                });
                $news->tags()->sync($tagIds);
            } else {
                // Kosongkan tag jika user menghapus semua tag
                $news->tags()->sync([]);
            }

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

        // Kita passing query yang sudah ter-filter ke dalam class Export
        $query = $this->buildQuery($request);

        return Excel::download(new NewsDaerahExport($query), 'laporan-news-daerah.xlsx');
    }
}
