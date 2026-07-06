<?php

namespace App\Http\Controllers;

use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
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
            'caption'   => 'nullable|string|max:255', // 💡 Menerima payload caption baru
            'watermark' => 'sometimes|boolean',
        ], [
            // Parameter ketiga adalah array custom messages
            'file.required'    => 'File gambar wajib diunggah.',
            'file.max' =>'File Terlalu Besar',
            'name.required'    => 'Nama gambar (Alt Text) wajib diisi.',
            'caption.nullable' => 'Caption keterangan gambar bersifat opsional.'
        ]);

        try {
            $file = $request->file('file');

            // 2. Perbaikan Bug Str::slug (Separator adalah '-', akhiran '-body' disambung)
            $nameImage = Str::slug($request->input('name'), '-') . '-body';

            // Konversi boolean ke string '1' atau '0' untuk instruksi CDN
            $applyWatermark = $request->boolean('watermark') ? '1' : '0';

            // 3. Proses Upload ke CDN
            $imageUrl = $this->cdnService->uploadImage($file, $nameImage, 4, 'raw', $applyWatermark);

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

    public function uploadFromUrl(Request $request)
    {
        // 1. Validasi Input (Disamakan dengan gaya pesan kustom Anda)
        $request->validate([
            'image_url' => 'required|url',
            'name'      => 'required|string|min:3|max:120',
            'caption'   => 'nullable|string|max:255',
            'watermark' => 'sometimes|boolean',
        ], [
            'image_url.required' => 'URL gambar wajib diisi.',
            'image_url.url'      => 'Format URL tidak valid (harus diawali http/https).',
            'name.required'      => 'Nama gambar (Alt Text) wajib diisi.',
            'caption.nullable'   => 'Caption keterangan gambar bersifat opsional.'
        ]);

        $tempPath = null;

        try {
            $url = $request->input('image_url');

            // 2. Unduh Gambar dari URL Eksternal (Timeout 30 detik untuk cegah server hang)
            $response = Http::timeout(120)->get($url);

            if (!$response->successful()) {
                throw new \Exception('Gagal mengunduh gambar dari URL sumber. Status: ' . $response->status());
            }

            // 3. Simpan sementara ke folder /tmp server
            $tempPath = sys_get_temp_dir() . '/' . \Illuminate\Support\Str::random(15) . '.tmp';
            file_put_contents($tempPath, $response->body());

            // 4. Keamanan: Pastikan yang diunduh benar-benar gambar
            $mimeType = mime_content_type($tempPath);
            if (!str_starts_with($mimeType, 'image/')) {
                throw new \Exception('URL tidak berisi file gambar yang valid (Mime: ' . $mimeType . ').');
            }

            // 5. MAGIC TRICK: Ubah file temp menjadi UploadedFile
            // Kita gunakan ".jpg" sebagai fallback nama palsu, CDN nanti akan menyesuaikan berdasarkan MIME aslinya
            $fakeOriginalName = Str::slug($request->input('name')) . '.jpg';
            $file = new UploadedFile(
                $tempPath,          // Path file asli di server
                $fakeOriginalName,  // Nama file samaran
                $mimeType,          // Mime type yang sudah divalidasi
                null,               // Error code
                true                // 💡 PENTING: Set true untuk "test mode" agar lolos validasi is_uploaded_file()
            );

            // 6. Penamaan & Watermark (Sama persis dengan fungsi upload manual Anda)
            $nameImage = Str::slug($request->input('name'), '-') . '-body';
           

            // 7. Proses Upload ke CDN (Memanggil metode yang persis sama)
            $imageUrl = $this->cdnService->uploadImage($file, $nameImage, 4, 'convert', 0);

            if (!$imageUrl) {
                throw new \Exception('CDN Service gagal memproses dan mengembalikan URL gambar hasil unduhan.');
            }

            // 8. Bersihkan file temp agar tidak jadi sampah di RAM/Disk
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            // 9. Return URL dan Data untuk TinyMCE (Format sama persis)
            return response()->json([
                'location' => $imageUrl,
                'name'     => $request->input('name'),
                'caption'  => $request->input('caption'),
            ], 200);

        } catch (\Exception $e) {
            // Pembersihan paksa jika terjadi error di tengah jalan
            if ($tempPath && file_exists($tempPath)) {
                unlink($tempPath);
            }

            Log::error('Upload Image from URL Error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Gagal menarik gambar dari URL: ' . $e->getMessage()
            ], 500);
        }
    }
}
