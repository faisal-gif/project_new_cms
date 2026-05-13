<?php

namespace App\Http\Controllers;

use App\Http\Requests\NetworkFormRequest;
use App\Models\History;
use App\Models\Network;
use App\Models\NetworkDaerah;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NetworkDaerahController extends Controller
{

    public function __construct(
        protected CdnService $cdnService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = NetworkDaerah::select('id', 'title', 'domain', 'name', 'analytics', 'is_web', 'status');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('name', 'like', "%{$request->search}%");
            });
        }


        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $networks = $query->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Daerah/Network/Index', [
            'networks'   => $networks,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Daerah/Network/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NetworkFormRequest $request)
    {
        $auth = Auth::user();

        $ImageLogoUrl = null;
        $ImageLogoMobileUrl = null;
        $ImageSocmedUrl = null;

        try {

            $baseSlug = Str::slug($request->name);
            $timestamp = time(); // Timestamp untuk mencegah isu caching pada CDN

            // 2. Cek masing-masing input. Jika ada file baru, upload dan timpa variabel URL.
            if ($request->hasFile('logo')) {
                $file = $request->file('logo');
                $ImageLogo = "{$baseSlug}-ImageLogo-{$timestamp}";

                $ImageLogoUrl = $this->cdnService->uploadImage($file, $ImageLogo, 1, 'convert', 0) ?? $ImageLogoUrl;
            }

            if ($request->hasFile('logo_m')) {
                $file = $request->file('logo_m');
                $ImageLogoMobileName = "{$baseSlug}-ImageLogoMobile-{$timestamp}";

                $ImageLogoMobileUrl = $this->cdnService->uploadImage($file, $ImageLogoMobileName, 1, 'convert', 0) ?? $ImageLogoMobileUrl;
            }

            if ($request->hasFile('img_socmed')) {
                $file = $request->file('img_socmed');
                $ImageSocmedName = "{$baseSlug}-ImageSocmed-{$timestamp}";

                $ImageSocmedUrl = $this->cdnService->uploadImage($file, $ImageSocmedName, 1, 'convert', 0) ?? $ImageSocmedUrl;
            }

            $network = NetworkDaerah::create([
                'name' => $request->name,
                'domain' => $request->domain,
                'slug' => Str::slug($request->name),
                'title' => $request->title,
                'tagline' => $request->tagline,
                'logo' => $ImageLogoUrl,
                'logo_m' => $ImageLogoMobileUrl,
                'img_socmed' => $ImageSocmedUrl,
                'keyword' => $request->keyword,
                'description' => $request->description,
                'analytics' => $request->analytics,
                'gverify' => $request->gverify,
                'fb' => $request->fb,
                'tw' => $request->tw,
                'ig' => $request->ig,
                'gp' => $request->gp,
                'yt' => $request->yt,
                'is_main' => $request->is_main,
                'is_web' => $request->is_web,
                'status' => $request->status,
            ]);
            DB::commit();

            return redirect()->route('admin.daerah.network.index')->with('success', 'Network Berhasil Ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->withErrors(['error' => 'Gagal menyimpan Network Daerah: Terjadi kesalahan sistem.' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(NetworkDaerah $network)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(NetworkDaerah $network)
    {
        return Inertia::render('Admin/Daerah/Network/Edit', [
            'network' => $network,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(NetworkFormRequest $request, NetworkDaerah $network)
    {
        $ImageLogoUrl = $network->logo;
        $ImageLogoMobileUrl = $network->logo_m;
        $ImageSocmedUrl = $network->img_socmed;

        try {

            $baseSlug = Str::slug($request->name);
            $timestamp = time(); // Timestamp untuk mencegah isu caching pada CDN

            // 2. Cek masing-masing input. Jika ada file baru, upload dan timpa variabel URL.
            if ($request->hasFile('logo')) {
                $file = $request->file('logo');
                $ImageLogo = "{$baseSlug}-ImageLogo-{$timestamp}";

                $ImageLogoUrl = $this->cdnService->uploadImage($file, $ImageLogo, 1, 'convert', 0) ?? $ImageLogoUrl;
            }

            if ($request->hasFile('logo_m')) {
                $file = $request->file('logo_m');
                $ImageLogoMobileName = "{$baseSlug}-ImageLogoMobile-{$timestamp}";

                $ImageLogoMobileUrl = $this->cdnService->uploadImage($file, $ImageLogoMobileName, 1, 'convert', 0) ?? $ImageLogoMobileUrl;
            }

            if ($request->hasFile('img_socmed')) {
                $file = $request->file('img_socmed');
                $ImageSocmedName = "{$baseSlug}-ImageSocmed-{$timestamp}";

                $ImageSocmedUrl = $this->cdnService->uploadImage($file, $ImageSocmedName, 1, 'convert', 0) ?? $ImageSocmedUrl;
            }

            $network->name = $request->name;
            $network->domain = $request->domain;
            $network->slug = Str::slug($request->name);
            $network->title = $request->title;
            $network->tagline = $request->tagline;
            $network->keyword = $request->keyword;
            $network->description = $request->description;
            $network->logo = $ImageLogoUrl;
            $network->logo_m = $ImageLogoMobileUrl;
            $network->img_socmed = $ImageSocmedUrl;
            $network->analytics = $request->analytics;
            $network->gverify = $request->gverify;
            $network->fb = $request->fb;
            $network->tw = $request->tw;
            $network->ig = $request->ig;
            $network->gp = $request->gp;
            $network->yt = $request->yt;
            $network->is_main = $request->is_main;
            $network->is_web = $request->is_web;
            $network->status = $request->status;

            $network->save();

            DB::commit();
            return redirect()->route('admin.daerah.network.index')->with('success', 'Network Berhasil Diubah');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->withErrors(['error' => 'Gagal Mengubah Network Daerah: Terjadi kesalahan sistem.' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(NetworkDaerah $network)
    {
        //
    }
}
