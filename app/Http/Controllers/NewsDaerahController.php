<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsDaerahFormRequest;
use App\Models\EditorDaerah;
use App\Models\FokusDaerah;
use App\Models\KanalDaerah;
use App\Models\NetworkDaerah;
use App\Models\NewsDaerah;
use App\Models\NewsDaerahImages;
use App\Models\TagsDaerah;
use App\Models\WriterDaerah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NewsDaerahController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $query = NewsDaerah::query()
            ->select(
                'id',
                'pin_urgent',
                'pin',
                'is_code',
                'cat_id',
                'title',
                'writer_id',
                'datepub',
                'views',
                'is_headline',
                'status',
                'created_at'
            )
            ->with(['kanal:id,name', 'writer:id,name']);

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

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Optimized sorting
        $query->orderByRaw("
        CASE status
            WHEN 2 THEN 1
            WHEN 3 THEN 2
            WHEN 1 THEN 3
            WHEN 0 THEN 4
        END
        ")->orderBy('created_at', 'DESC');

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

        return Inertia::render('Admin/Daerah/News/Index', [
            'news'    => $news,
            'writers' => $writers,
            'kanals' => $kanals,
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
        $writers = WriterDaerah::select(['id', 'name'])->get()
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
            'kanal_daerah' => $kanal_daerah,
            'focus_daerah' => $focus_daerah,
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
                'status'      => $request->status,
                'locus'       => $request->locus,
                'datepub'     => $request->datepub ?? now(),
                'is_headline' => $request->is_headline ? 1 : 0,
                'is_editorial' => $request->is_editorial ? 1 : 0,
                'is_adv'      => $request->is_adv ? 1 : 0,
                'pin'         => $request->pin ? 1 : 0,
                'caption'     => $request->image_caption,
            ]);


            NewsDaerahImages::create([
                'news_id'     => $news->id,
                'writer_id'   => $request->writer,
                'image_url'   => $request->image_1,
                'image_url_2' => $request->image_2,
                'image_url_3' => $request->image_3,
                'caption'     => $request->image_caption,
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
    public function edit(string $id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
