<?php

namespace App\Http\Controllers;

use App\Services\CdnService;
use Illuminate\Http\Request;

class CdnLibraryController extends Controller
{
    public function __construct(
        protected CdnService $cdnService
    ) {}

    /**
     * Proxy daftar gambar galeri CDN untuk fitur "pilih foto".
     * Dipanggil dari browser tanpa membocorkan X-API-KEY (dikirim server-side).
     */
    public function images(Request $request)
    {
        return response()->json(
            $this->cdnService->listImages($request->only(['search', 'category_slug', 'page', 'per_page']))
        );
    }

    /**
     * Proxy daftar kategori CDN untuk dropdown filter picker.
     */
    public function categories()
    {
        return response()->json(['data' => $this->cdnService->listCategories()]);
    }
}
