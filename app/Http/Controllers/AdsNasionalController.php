<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdsNasionalRequest;
use App\Models\AdsNasional;
use App\Models\AdsNasionalCost;
use App\Models\AdsNasionalLocate;
use App\Models\AdsNasionalLocateMaster;
use App\Models\AdsNasionalNetwork;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdsNasionalController extends Controller
{

    public function __construct(
        protected CdnService $cdnService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //// Gunakan pagination. Hindari N+1 Query jika Anda merelasikan tabel lain (gunakan with())
        // Contoh: AdsTi::with('creatives')->orderBy('id', 'desc')->paginate(10);

        $ads = AdsNasional::orderBy('id', 'desc')->paginate(10);

        return inertia('Admin/Nasional/Ads/Index', [
            'ads' => $ads
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $desktopLocations = AdsNasionalLocateMaster::where('type', 'd')->where('is_status', 1)->where('is_page', 'home')->get();
        $mobileLocations = AdsNasionalLocateMaster::where('type', 'm')->where('is_status', 1)->where('is_page', 'home')->get();


        return Inertia::render('Admin/Nasional/Ads/Create', [
            'desktopLocations' => $desktopLocations,
            'mobileLocations' => $mobileLocations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AdsNasionalRequest $request)
    {
        $user = Auth::user();

        try {
            $baseSlug = Str::slug($request->title);

            // PERBAIKAN 1: Gunakan hasFile() agar tidak error jika salah satu gambar tidak diunggah
            $desktopImgUrl = $request->hasFile('d_img')
                ? $this->cdnService->uploadImage($request->file('d_img'), "{$baseSlug}-desktop", 1, 'convert', 0)
                : null;

            $mobileImgUrl  = $request->hasFile('m_img')
                ? $this->cdnService->uploadImage($request->file('m_img'), "{$baseSlug}-mobile", 1, 'convert', 0)
                : null;

            DB::beginTransaction();

            // 1. Insert ke Database Utama
            $adsTi = AdsNasional::create([
                'unique_id'  => Str::random(20),
                'title'      => $request->title,
                'datestart'  => $request->datestart,
                'dateend'    => $request->dateend,
                'url'        => $request->url,
                'd_img'      => $desktopImgUrl,
                'm_img'      => $mobileImgUrl,
                'cpc'        => $request->cpc,
                'cost'       => $request->cost,
                'is_status'  => $request->status,
            ]);

            // 2. Insert Cost & Network (Database Kedua)
            AdsNasionalCost::create([
                'ads_id'   => $adsTi->id,
                'cost_end' => $adsTi->cost,
            ]);

            AdsNasionalNetwork::create([
                'ads_id' => $adsTi->id,
                'net_id' => 1,
            ]);

            // PERBAIKAN 2: Penanganan untuk locate yang bukan array (single value)
            // Masukkan value ke dalam array, lalu gunakan array_filter untuk membuang nilai null/kosong
            $allLocates = array_filter([
                $request->locate_desktop,
                $request->locate_mobile
            ]);

            // Hapus duplikasi jika ID lokasi desktop dan mobile ternyata sama
            $allLocates = array_unique($allLocates);

            if (!empty($allLocates)) {
                // Map menjadi Array Multidimensi
                $locateData = collect($allLocates)->map(function ($locate_id) use ($adsTi) {
                    return [
                        'ads_id'    => $adsTi->id,
                        'locate_id' => $locate_id,
                    ];
                })->toArray(); // Konversi ke bentuk array murni

                // Eksekusi INSERT HANYA 1 KALI
                AdsNasionalLocate::insert($locateData);
            }

            DB::commit();

            return redirect()->route('admin.nasional.ads.index')
                ->with('success', 'Campaign Iklan berhasil ditambahkan.');
        } catch (\Exception $e) {
            // Rollback KEDUA database jika ada SALAH SATU yang gagal
            DB::rollBack();

            return back()->withInput()->withErrors(['error' => 'Gagal menyimpan iklan. Kesalahan sistem: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AdsNasional $adsNasional)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $ad = AdsNasional::with('locates')->findOrFail($id);

        $desktopLocations = AdsNasionalLocateMaster::where('type', 'd')
            ->where('is_status', 1)->get(['id', 'name', 'width', 'height']);

        $mobileLocations  = AdsNasionalLocateMaster::where('type', 'm')
            ->where('is_status', 1)->get(['id', 'name', 'width', 'height']);

        $selectedLocateIds = $ad->locates->pluck('locate_id')->toArray();

        $selectedDesktopLocate = collect($desktopLocations)
            ->whereIn('id', $selectedLocateIds)
            ->pluck('id')
            ->first() ?? '';

        $selectedMobileLocate = collect($mobileLocations)
            ->whereIn('id', $selectedLocateIds)
            ->pluck('id')
            ->first() ?? '';

        // 5. Render ke Inertia Component
        return inertia('Admin/Nasional/Ads/Edit', [
            'ads'                   => $ad,
            'desktopLocations'      => $desktopLocations,
            'mobileLocations'       => $mobileLocations,
            'selectedDesktopLocate' => $selectedDesktopLocate,
            'selectedMobileLocate'  => $selectedMobileLocate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AdsNasionalRequest $request, string $id)
    {
        try {
            // Kita lock baris ini dengan instance object
            $adsTi = AdsNasional::findOrFail($id);
            $baseSlug = Str::slug($request->title);

            // Logika Gambar: Hanya upload jika ada file baru di-request
            $desktopImgUrl = $adsTi->d_img;
            if ($request->hasFile('d_img')) {
                // Opsional: Implementasikan fungsi delete gambar lama di CDN jika diperlukan
                $desktopImgUrl = $this->cdnService->uploadImage($request->file('d_img'), "{$baseSlug}-desktop", 1, 'convert', 0);
            }

            $mobileImgUrl = $adsTi->m_img;
            if ($request->hasFile('m_img')) {
                // Opsional: Implementasikan fungsi delete gambar lama di CDN jika diperlukan
                $mobileImgUrl = $this->cdnService->uploadImage($request->file('m_img'), "{$baseSlug}-mobile", 1, 'convert', 0);
            }

            DB::beginTransaction();

            // 1. Update Tabel Utama
            $adsTi->update([
                'title'      => $request->title,
                'datestart'  => $request->datestart,
                'dateend'    => $request->dateend,
                'url'        => $request->url,
                'd_img'      => $desktopImgUrl,
                'm_img'      => $mobileImgUrl,
                'cpc'        => $request->cpc,
                'cost'       => $request->cost,
                'is_status'  => $request->status,
            ]);

            // 2. Update Cost (Gunakan updateOrCreate untuk keamanan jika data sebelumnya anomali/hilang)
            AdsNasionalCost::updateOrCreate(
                ['ads_id'   => $adsTi->id],
                ['cost_end' => $adsTi->cost]
            );

            AdsNasionalLocate::where('ads_id', $adsTi->id)->delete();

            $allLocates = array_filter([
                $request->locate_desktop,
                $request->locate_mobile
            ]);
            $allLocates = array_unique($allLocates);

            if (!empty($allLocates)) {
                $locateData = collect($allLocates)->map(function ($locate_id) use ($adsTi) {
                    return [
                        'ads_id'    => $adsTi->id,
                        'locate_id' => $locate_id,
                    ];
                })->toArray();

                // Insert kembali relasi terbaru
                AdsNasionalLocate::insert($locateData);
            }

            DB::commit();

            return redirect()->route('admin.nasional.ads.index')
                ->with('success', 'Campaign Iklan berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update Ads Failed: ' . $e->getMessage()); // Catat ke log server

            return back()->withInput()->withErrors(['error' => 'Gagal memperbarui iklan. Kesalahan sistem: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdsNasional $adsNasional)
    {
        //
    }
}
