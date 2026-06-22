<?php

namespace App\Http\Controllers;

use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TextEditorController extends Controller
{
    public function __construct(
        protected CdnService $cdnService
    ) {}

    public function upload(Request $request)
    {
        $request->validate([
            'file'      => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
            'name'      => 'required|string|min:3|max:120',
            'caption'   => 'required|string|max:255', // 💡 Menerima payload caption baru
            'watermark' => 'sometimes|boolean',
        ]);

        try {
            $file = $request->file('file');

            // 2. Perbaikan Bug Str::slug (Separator adalah '-', akhiran '-body' disambung)
            $nameImage = Str::slug($request->input('name'), '-') . '-body';

            // Konversi boolean ke string '1' atau '0' untuk instruksi CDN
            $applyWatermark = $request->boolean('watermark') ? '1' : '0';

            // 3. Proses Upload ke CDN
            $imageUrl = $this->cdnService->uploadImage($file, $nameImage, 4, 'convert', $applyWatermark);

            // Validasi proteksi jika CDN gagal merespons atau mengembalikan null
            if (!$imageUrl) {
                throw new \Exception('CDN Service gagal memproses dan mengembalikan URL gambar.');
            }

            // 4. Return URL dan Data untuk TinyMCE / Modal React
            return response()->json([
                'location' => $imageUrl,
                'name'     => $request->input('name'),
                'caption'  => $request->input('caption'), // Opsional dikembalikan jika UI membutuhkannya
            ], 200);
        } catch (\Exception $e) {
            // 5. Pencatatan Log Server (Sangat penting untuk tracing bug di Production)
            Log::error('Upload Image Editor Error: ' . $e->getMessage());

            // Kembalikan HTTP Status 500 (Internal Server Error)
            // Agar blok `!res.ok` di frontend (React) bisa menangkap dan menampilkan pesan errornya
            return response()->json([
                'message' => 'Gagal mengunggah gambar sistem: ' . $e->getMessage()
            ], 500);
        }
    }
}
