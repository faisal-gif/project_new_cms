<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class EditorController extends Controller
{
    public function upload(Request $request)
    {
        // 1. Validasi input dari frontend
        $request->validate([
            'file' => 'required|image|max:8192', // Sesuaikan batas maksimal dari frontend (contoh 8MB)
            'name' => 'required|string|min:3|max:120',
            'watermark' => 'sometimes|boolean',
            'category_id' => 'sometimes|integer' // Jika ingin menerima kategori dari frontend
        ]);

        $file = $request->file('file');

        // Konversi boolean ke string '1' atau '0' untuk dikirim via form-data
        $applyWatermark = $request->boolean('watermark') ? '1' : '0';

        // 2. Tembak langsung ke API CDN beserta payload sesuai gambar Anda
        $response = Http::withHeaders(
            ['x-api-key' => 'QgwJShcyArAEGqLXKZ3xzcu4']
        )->attach(
            'file', // Key 'file' sesuai di gambar Postman
            file_get_contents($file->getPathname()),
            $file->getClientOriginalName()
        )->post('https://cdn.tin.co.id/api/v1/images/upload', [
            'name'          => $request->input('name'),
            'category_id'   => $request->input('category_id'),
            'process_type'  => 'convert',   // Sesuai gambar
            'add_watermark' => $applyWatermark, // '1' atau '0'
        ]);

        // 3. Handle jika gagal
        if (!$response->successful()) {
            return response()->json([
                'message' => 'Upload gagal ke CDN',
                'error_detail' => $response->json() ?? $response->body()
            ], $response->status());
        }

        $data = $response->json();

        // 4. Return URL untuk TinyMCE
        // ⚠️ PENTING: Sesuaikan key ['data']['url'] di bawah ini dengan struktur JSON asli dari CDN Anda
        $imageUrl = $data['data']['url'] ?? $data['url'] ?? null;
        $imageName = $data['data']['name'] ?? $data['name'] ?? $file->getClientOriginalName();

        return response()->json([
            'location' => $imageUrl,
            'name'     => $imageName
        ]);
    }
}
