<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsKTRequest;
use App\Http\Requests\PublishNewsKTRequest;
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

class NewsKTController extends Controller
{
    public function __construct(
        protected CdnService $cdnService,
        protected NewsNasionalTagService $tagNasionalService
    ) {}

    public function index(Request $request)
    {
        $news = NewsBerbayar::query()
            ->with('writer:id,nama', 'newsNasional:is_code,news_id,news_title,news_status')
            ->where('type', '4')
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


        return Inertia::render('Admin/Kopi_Times/News/Index', [
            'news'    => $news,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        // FILTERING CERDAS: Hanya ambil penulis yang memenuhi syarat
        $writers = WriterBerbayar::select('id as value', 'nama as label', 'quota_news', 'dateexp')
            ->where('type', '4') // Hanya penulis KT
            ->where('status', '1') // Harus aktif
            ->where('quota_news', '>', 0) // Kuota harus ada
            ->where(function ($query) {
                // Masa aktif belum lewat hari ini, ATAU tidak memiliki masa aktif (null)
                $query->whereNull('dateexp')
                    ->orWhere('dateexp', '>=', Carbon::now()->startOfDay()->toDateString());
            })
            ->get();

        return Inertia::render('Admin/Kopi_Times/News/Create', [
            'writers' => $writers
        ]);
    }

    public function store(NewsKTRequest $request)
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
        $imageWatermark = $validated['image_watermark'] ?? false;
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                $imageName = Str::slug(Str::limit($validated['title'], 80, '')) . '-' . time();

                $imageUrl = $this->cdnService->uploadImage($file, $imageName, 3, 'convert', $imageWatermark ? 1 : 0);
            } catch (\Exception $e) {
                return back()->withErrors([
                    'image' => 'Sistem gagal mengunggah gambar ke CDN: ' . $e->getMessage()
                ])->withInput();
            }
        }

        try {
            DB::beginTransaction();

            $isCode = 'KT-' . strtoupper(Str::random(8));

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
                'type'       => 4, // Tipe berita KT
                'status'     => 0,
                'created_by' => auth()->id(),
            ]);

            $writer->decrement('quota_news', 1);

            DB::commit();

            return redirect()->route('admin.kopi-times.news.index')
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


        if ($news->type != '4') {
            return redirect()->back()->with('error', 'Berita Ini bukan berita KT');
        }

        return Inertia::render('Admin/Kopi_Times/News/Show', [
            'news' => $news,
        ]);
    }

    public function edit($id)
    {
        $user = Auth::user();
        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->get();
        $writers = WriterNasional::select('id as value', 'name as label')->get();
        $kanals = KanalNasional::select('catnews_id as value', 'catnews_title as label')->get();
        $fokus = FokusNasional::select('focnews_id as value', 'focnews_title as label')->get();
        // Gunakan eager loading untuk mengambil data relasi writer
        $news = NewsBerbayar::with('writer:id,nama,email,kategori')->findOrFail($id);

        $writerCategory = $news->writer ? $news->writer->kategori : null;


        $writerkanal = null;
        switch ($writerCategory) {
            case '39':
                $writerkanal = '39';
                break;
            case '40':
                $writerkanal = '40';
                break;
            case '41':
                $writerkanal = '41';
                break;
            default:
                $writerkanal = '15';
        }


        return Inertia::render('Admin/Kopi_Times/News/Edit', [
            'news' => $news,
            'editors' => $editors,
            'writers' => $writers,
            'kanal' => $kanals,
            'fokus' => $fokus,
            'writerkanal' => $writerkanal,
            'hasEditor' => $user->hasRole('editor') ? true : false,
            'editor_id' => $user->editor ? $user->editor->id_ti : null,
        ]);
    }

    public function update(NewsKTRequest $request, $id)
    {
        // 1. Cari data berita
        $news = NewsBerbayar::findOrFail($id);

        // 2. Ambil data yang sudah lolos validasi
        $validatedData = $request->validated();

        // 3. Handle Tags (Opsional)
        // Jika dari React (InputTag) mengirim array, tapi database butuh string
        if (isset($validatedData['tags']) && is_array($validatedData['tags'])) {
            // Mengubah array ['berita', 'kopi'] menjadi string "berita,kopi"
            // Sesuaikan parameter mapping jika struktur object tag dari FE berbeda
            $validatedData['tags'] = implode(',', $validatedData['tags']);
        }

        // 4. Catat user yang memodifikasi (jika pakai sistem login Laravel)
        if (auth()->check()) {
            $validatedData['modified_by'] = auth()->id();
        }

        $validatedData['status'] = 2;
        // 5. Eksekusi Update
        $news->update($validatedData);

        // 6. Return response (Karena pakai Inertia, cukup redirect back)
        return redirect()->back()->with('success', 'Data berita berhasil diperbarui.');
    }

    public function publish($id)
    {
        $user = Auth::user();
        $editors = EditorNasional::select('editor_id as value', 'editor_name as label')->get();
        $writers = WriterNasional::select('id as value', 'name as label')->get();
        $kanals = KanalNasional::select('catnews_id as value', 'catnews_title as label')->get();
        $fokus = FokusNasional::select('focnews_id as value', 'focnews_title as label')->get();
        // Gunakan eager loading untuk mengambil data relasi writer
        $news = NewsBerbayar::with('writer:id,nama,email,kategori')->findOrFail($id);

        $writerCategory = $news->writer ? $news->writer->kategori : null;


        $writerkanal = null;
        switch ($writerCategory) {
            case '39':
                $writerkanal = '39';
                break;
            case '40':
                $writerkanal = '40';
                break;
            case '41':
                $writerkanal = '41';
                break;
            default:
                $writerkanal = '15';
        }


        return Inertia::render('Admin/Kopi_Times/News/PublishKT', [
            'news' => $news,
            'editors' => $editors,
            'writers' => $writers,
            'kanal' => $kanals,
            'fokus' => $fokus,
            'writerkanal' => $writerkanal,
            'hasEditor' => $user->hasRole('editor') ? true : false,
            'editor_id' => $user->editor ? $user->editor->id_ti : null,
        ]);
    }

    public function publishStore(PublishNewsKTRequest $request, $isCode)
    {
        // Gunakan koneksi mysql_nasional untuk transaksi
        $isCode = $request->input('is_code');
        $ktNews = NewsBerbayar::where('is_code', $isCode)->firstOrFail();
        $writerKT = WriterBerbayar::where('id', $ktNews->pewarta_id)->firstOrFail();

        DB::connection('mysql_nasional')->beginTransaction();

        try {


            $tagData = $this->tagNasionalService->processTags($request->tag, $request->is_content);

            // LOGIKA PENANGANAN FILE FOTO:
            $finalImage = $ktNews->image; // Default pakai gambar bawaan

            // Cek apakah ada file foto yang diunggah oleh editor
            if ($request->hasFile('image_thumbnail')) {
                try {
                    $file = $request->file('image_thumbnail');
                    $nameThumbnail = 'kopi-times-' . Str::slug(Str::limit($writerKT->nama, 100, '')) . '-thumbnail';
                    $finalImage = $this->cdnService->uploadImage($file, $nameThumbnail, 3, 'convert', false) ?? null;
                } catch (\Exception $e) {
                    return back()->withInput()->withErrors(['error' => 'Gagal mengunggah gambar ke CDN: ' . $e->getMessage()]);
                }
            }

            $news = NewsNasional::create([
                'is_code'          => $request->is_code,
                'editor_id'        => $request->editor,
                'catnews_id'       => $request->kanal,
                'news_title'       => $request->title,
                'news_description' => $request->description,
                'news_content'     => $tagData['content'],
                'news_image_new'   =>  $finalImage,
                'news_caption'     => $request->image_caption,
                'news_status'      => $request->status,
                'news_city'        => $request->locus,
                'news_datepub'     => $request->datepub ?? now(),
                'news_tags'        => $tagData['tagString'], // Menggunakan array tag yang sudah dibersihkan
            ]);

            // 3. Simpan Tags (Many-to-Many) ke tabel Tag Nasional dengan Urutan yang Terpelihara
            if (!empty($tagData['syncData'])) {
                $news->tags()->sync($tagData['syncData']);
            }

            $ktNews->update([
                'is_code' => $news->is_code,
                'status' => '1',
                'url' => 'https://timesindonesia.co.id/kopi-times/' . $news->news_id  . '/' . Str::slug($news->news_title),
            ]);

            DB::connection('mysql_nasional')->commit();

            return redirect()->route('admin.kopi-times.news.index')->with('success', 'Berita berhasil diterbitkan!');
        } catch (\Exception $e) {
            DB::connection('mysql_nasional')->rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal simpan ke Nasional: ' . $e->getMessage()]);
        }
    }
}
