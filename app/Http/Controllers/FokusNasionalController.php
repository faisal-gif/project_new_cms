<?php

namespace App\Http\Controllers;

use App\Http\Requests\FokusNasionalFormRequest;
use App\Models\FokusNasional;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class FokusNasionalController extends Controller
{

    public function __construct(
        protected CdnService $cdnService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FokusNasional::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('focnews_title', 'like', "%{$request->search}%");
            });
        }


        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $focus = $query->orderBy('focnews_id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Nasional/Focus/Index', [
            'focus'   => $focus,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Nasional/Focus/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FokusNasionalFormRequest $request)
    {

        $ImageDesktopListUrl = null;
        $ImageDesktopNewsUrl = null;
        $ImageMobileUrl = null;

        $createdBy = Auth::id();

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



            // 4. Insert ke Database
            $fokus = FokusNasional::create([
                'focnews_title' => $request->name,
                'focnews_description' => $request->description,
                'focnews_keyword' => $request->keyword,
                'focnews_image_body' => $ImageDesktopListUrl,
                'focnews_image_news' => $ImageDesktopNewsUrl,
                'focnews_image_mobile' => $ImageMobileUrl,
                'status' => $request->status,
                'created_by' => $createdBy,
            ]);

            DB::commit();

            return redirect()->route('admin.nasional.fokus.index')
                ->with('success', 'Fokus Berhasil Ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->withErrors(['error' => 'Gagal menyimpan fokus: ' . $e->getMessage()]);
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(FokusNasional $FokusNasional)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($fokusNasional)
    {
        $fokus = FokusNasional::find($fokusNasional);
        return Inertia::render('Admin/Nasional/Focus/Edit', [
            'fokus' => $fokus,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FokusNasionalFormRequest $request, $fokusNasional)
    {
        $fokus = FokusNasional::find($fokusNasional);
        // 1. Ambil URL lama dari database sebagai default
        $ImageDesktopListUrl = $fokus->focnews_image_body;
        $ImageDesktopNewsUrl = $fokus->focnews_image_news;
        $ImageMobileUrl      = $fokus->focnews_image_mobile;

        $updatedBy = Auth::id();
        // Opsional: Jika tabel Anda melacak siapa yang memperbarui
        // $updatedBy = Auth::id();

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

            // 3. Update data ke Database menggunakan instance model
            $fokus->update([
                'focnews_title'        => $request->name,
                'focnews_description'  => $request->description,
                'focnews_keyword'      => $request->keyword,
                'focnews_image_body'   => $ImageDesktopListUrl,
                'focnews_image_news'   => $ImageDesktopNewsUrl,
                'focnews_image_mobile' => $ImageMobileUrl,
                'status'               => $request->status,
                'modified_by'          => $updatedBy,
            ]);

            DB::commit();

            return redirect()->route('admin.nasional.fokus.index')
                ->with('success', 'Fokus Berhasil Diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->with('error', 'Error saat update Fokus Nasional: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FokusNasional $fokusNasional)
    {
        //
    }
}
