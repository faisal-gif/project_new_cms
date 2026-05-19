<?php

namespace App\Http\Controllers;

use App\Http\Requests\FokusFormRequest;
use App\Models\FokusDaerah;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class FokusDaerahController extends Controller
{
    public function __construct(
        protected CdnService $cdnService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FokusDaerah::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }


        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $focus = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Daerah/Focus/Index', [
            'focus'   => $focus,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Daerah/Focus/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FokusFormRequest $request)
    {
        $ImageDesktopListUrl = null;
        $ImageDesktopNewsUrl = null;
        $ImageMobileUrl = null;

        try {
            DB::beginTransaction();

            if ($request->hasFile('img_desktop_list')) {
                $file = $request->file('img_desktop_list');
                $ImageDesktopListName = Str::slug($request->name, '-ImageDesktopList');
                // Ambil URL dari response JSON CDN
                $ImageDesktopListUrl = $this->cdnService->uploadImage($file, $ImageDesktopListName, 1, 'convert', 0) ?? null;
            }

            if ($request->hasFile('img_desktop_news')) {
                $file = $request->file('img_desktop_news');
                $ImageDesktopNewsName = Str::slug($request->name, '-ImageDesktopNews');
                // Ambil URL dari response JSON CDN
                $ImageDesktopNewsUrl = $this->cdnService->uploadImage($file, $ImageDesktopNewsName, 1, 'convert', 0) ?? null;
            }

            if ($request->hasFile('img_mobile')) {
                $file = $request->file('img_mobile');
                $ImageMobileName = Str::slug($request->name, '-ImageMobile');
                // Ambil URL dari response JSON CDN
                $ImageMobileUrl = $this->cdnService->uploadImage($file, $ImageMobileName, 1, 'convert', 0) ?? null;
            }

            $fokus = FokusDaerah::create([
                'name' => $request->name,
                'keyword' => $request->keyword,
                'description' => $request->description,
                'status' => $request->status,
                'img_desktop_list' => $ImageDesktopListUrl,
                'img_desktop_news' => $ImageDesktopNewsUrl,
                'img_mobile' => $ImageMobileUrl,
            ]);

            DB::commit();
            return redirect()->route('admin.daerah.fokus.index')->with('success', 'Fokus Berhasil Ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Fokus Gagal Ditambahkan : ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(FokusDaerah $fokus)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FokusDaerah $foku)
    {
        return Inertia::render('Admin/Daerah/Focus/Edit', [
            'fokus' => $foku,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FokusFormRequest $request, FokusDaerah $foku)
    {

        $ImageDesktopListUrl = $foku->img_desktop_list;
        $ImageDesktopNewsUrl = $foku->img_desktop_news;
        $ImageMobileUrl      = $foku->img_mobile;

        try {
            DB::beginTransaction();

            $baseSlug = Str::slug($request->name);
            $timestamp = time(); // Timestamp untuk mencegah isu caching pada CDN

            // 2. Cek masing-masing input. Jika ada file baru, upload dan timpa variabel URL.
            if ($request->hasFile('img_desktop_list')) {
                $file = $request->file('img_desktop_list');
                $ImageDesktopListName = "{$baseSlug}-ImageDesktopList-{$timestamp}";

                $ImageDesktopListUrl = $this->cdnService->uploadImage($file, $ImageDesktopListName, 1, 'convert', 0) ?? $ImageDesktopListUrl;
            }

            if ($request->hasFile('img_desktop_news')) {
                $file = $request->file('img_desktop_news');
                $ImageDesktopNewsName = "{$baseSlug}-ImageDesktopNews-{$timestamp}";

                $ImageDesktopNewsUrl = $this->cdnService->uploadImage($file, $ImageDesktopNewsName, 1, 'convert', 0) ?? $ImageDesktopNewsUrl;
            }

            if ($request->hasFile('img_mobile')) {
                $file = $request->file('img_mobile');
                $ImageMobileName = "{$baseSlug}-ImageMobile-{$timestamp}";

                $ImageMobileUrl = $this->cdnService->uploadImage($file, $ImageMobileName, 1, 'convert', 0) ?? $ImageMobileUrl;
            }

            $foku->name = $request->name;
            $foku->keyword = $request->keyword;
            $foku->description = $request->description;
            $foku->status = $request->status;
            $foku->img_desktop_list = $ImageDesktopListUrl;
            $foku->img_desktop_news = $ImageDesktopNewsUrl;
            $foku->img_mobile =   $ImageMobileUrl;
            $foku->save();
            DB::commit();

            return redirect()->route('admin.daerah.fokus.index')->with('success', 'Fokus Berhasil Diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->with('error', 'Error saat update Fokus Daerah : ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FokusDaerah $fokus)
    {
        //
    }
}
