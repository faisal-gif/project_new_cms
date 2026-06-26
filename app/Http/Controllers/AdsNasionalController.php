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
        // 1. Ambil data iklan beserta relasi lokasinya (Eager Loading)
        // Pastikan Anda sudah mendefinisikan relasi 'locates' di model AdsNasional
        $ad = AdsNasional::with('locates')->findOrFail($id);



        $desktopLocations = AdsNasionalLocateMaster::where('type', 'd')->get(['id', 'name']);
        $mobileLocations  = AdsNasionalLocateMaster::where('type', 'm')->get(['id', 'name']);

        $selectedLocateIds = $ad->locates->pluck('locate_id')->toArray();

        $selectedDesktopLocates = collect($desktopLocations)
            ->whereIn('id', $selectedLocateIds)
            ->pluck('id')
            ->toArray();

        $selectedMobileLocates = collect($mobileLocations)
            ->whereIn('id', $selectedLocateIds)
            ->pluck('id')
            ->toArray();

        // 5. Render ke Inertia Component (Frontend)
        return inertia('Admin/Nasional/Ads/Edit', [
            'ad'                     => $ad,
            'desktopLocations'       => $desktopLocations,
            'mobileLocations'        => $mobileLocations,
            'selectedDesktopLocates' => $selectedDesktopLocates,
            'selectedMobileLocates'  => $selectedMobileLocates,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AdsNasionalRequest $request, $id)
    {
        $ad = AdsNasional::findOrFail($id);

        DB::beginTransaction();

        try {
            // 1. Cek dan Upload Gambar (Hanya jika ada file baru yang diunggah)
            $desktopImgUrl = $ad->d_img; // Gunakan gambar lama sebagai default
            if ($request->hasFile('d_img')) {
                $baseSlug = Str::slug($request->title);
                $desktopImgUrl = $this->cdnService->uploadImage($request->file('d_img'), "{$baseSlug}-desktop-edit", 1, 'convert', 0);
            }

            $mobileImgUrl = $ad->m_img; // Gunakan gambar lama sebagai default
            if ($request->hasFile('m_img')) {
                $baseSlug = Str::slug($request->title);
                $mobileImgUrl = $this->cdnService->uploadImage($request->file('m_img'), "{$baseSlug}-mobile-edit", 1, 'convert', 0);
            }

            // 2. Update Data Master
            $ad->update([
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

            // 3. Update Cost (Asumsi ads_id adalah foreign key)
            AdsNasionalCost::where('ads_id', $ad->id)->update([
                'cost_end' => $request->cost,
            ]);

            // 4. Sinkronisasi Lokasi (Delete old, Batch Insert new)
            // Ini jauh lebih cepat dan aman daripada mengecek satu per satu
            AdsNasionalLocate::where('ads_id', $ad->id)->delete();

            $desktopLocates = $request->locate_desktop ?? [];
            $mobileLocates  = $request->locate_mobile ?? [];
            $allLocates     = array_unique(array_merge($desktopLocates, $mobileLocates));

            if (!empty($allLocates)) {
                // BATCH INSERT YANG BENAR (1 kali query eksekusi)
                $locateData = collect($allLocates)->map(function ($locate_id) use ($ad) {
                    return [
                        'ads_id'     => $ad->id,
                        'locate_id'  => $locate_id,
                    ];
                })->toArray();

                AdsNasionalLocate::insert($locateData);
            }

            DB::commit();

            return redirect()->route('admin.nasional.ads.index')
                ->with('success', 'Campaign Iklan berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => 'Gagal memperbarui iklan: ' . $e->getMessage()]);
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
