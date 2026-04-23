<?php

namespace App\Http\Controllers;

use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TextEditorController extends Controller
{
     public function __construct(
        protected CdnService $cdnService
    ) {}

    public function upload(Request $request)
    {
        // 1. Validasi input dari frontend
        $request->validate([
            'file' => 'required|image|max:8192', // Sesuaikan batas maksimal dari frontend (contoh 8MB)
            'name' => 'required|string|min:3|max:120',
            'watermark' => 'sometimes|boolean',
        ]);

        $file = $request->file('file');
        $nameImage = Str::slug($request->input('name'),'-Body');

        // Konversi boolean ke string '1' atau '0' untuk dikirim via form-data
        $applyWatermark = $request->boolean('watermark') ? '1' : '0';

        // 4. Return URL untuk TinyMCE
        $imageUrl = $this->cdnService->uploadImage($file, $nameImage, 4, 'convert', $applyWatermark) ?? null;;
        $imageName = $request->name;

        return response()->json([
            'location' => $imageUrl,
            'name'     => $imageName
        ]);
    }
}
