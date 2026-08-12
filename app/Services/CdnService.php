<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class CdnService
{
    protected string $baseUrl;
    protected string $apiKey;

    // ULID gambar terakhir yang berhasil di-upload pada request ini. Dipakai untuk
    // menghapus gambar yatim di CDN bila penyimpanan berita gagal (rollback).
    protected ?string $lastUploadedId = null;

    public function __construct()
    {
        // Mengambil kredensial dari config
        $this->baseUrl = config('services.tin_cdn.url');
        $this->apiKey = config('services.tin_cdn.api_key');
    }

    /**
     * ULID gambar terakhir yang berhasil di-upload. Tangkap tepat setelah upload,
     * simpan ke variabel lokal, lalu pakai untuk delete() jika transaksi DB gagal.
     */
    public function getLastUploadedId(): ?string
    {
        return $this->lastUploadedId;
    }

    /**
     * Hapus gambar dari CDN berdasarkan ULID. Sengaja TIDAK melempar exception
     * supaya aman dipanggil di dalam blok catch (kompensasi rollback) tanpa
     * menutupi error aslinya. Mengembalikan true bila terhapus.
     */
    public function delete(?string $id): bool
    {
        if (!$id) {
            return false;
        }

        try {
            $response = Http::timeout(30)
                ->withHeaders(['x-api-key' => $this->apiKey])
                ->delete("{$this->baseUrl}/images/{$id}");

            if ($response->failed()) {
                Log::warning('CDN Delete gagal', ['id' => $id, 'status' => $response->status(), 'body' => $response->body()]);
                return false;
            }

            return true;
        } catch (Exception $e) {
            Log::warning('CDN Delete exception', ['id' => $id, 'error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Upload gambar ke CDN dengan parameter yang bisa dikustomisasi.
     *
     * @param UploadedFile $file File yang diunggah dari request
     * @param string $fileNameToCDN Nama file tujuan
     * @param int $categoryId Kategori gambar (default: 6)
     * @param string $processType Tipe pemrosesan (default: 'convert')
     * @param bool $addWatermark Tambahkan watermark (default: false)
     * @return string URL gambar dari CDN
     * @throws Exception
     */
    public function uploadImage(
        UploadedFile $file,
        string $fileNameToCDN,
        int $categoryId = 6,
        string $processType = 'convert',
        bool $addWatermark = false
    ): string {
        return $this->push(
            file_get_contents($file->getPathname()),
            $file->getClientOriginalName(),
            $fileNameToCDN,
            $categoryId,
            $processType,
            $addWatermark
        );
    }

    /**
     * Download gambar dari URL remote lalu unggah ke CDN.
     * Dipakai untuk gambar hasil crawl (mis. og:image produk affiliate).
     *
     * @return string URL gambar dari CDN
     * @throws Exception
     */
    public function uploadFromUrl(
        string $imageUrl,
        string $fileNameToCDN,
        int $categoryId = 6,
        string $processType = 'convert',
        bool $addWatermark = false
    ): string {
        $download = Http::timeout(60)->get($imageUrl);
        if ($download->failed()) {
            throw new Exception('Gagal mengunduh gambar dari URL sumber.');
        }

        // Ekstensi dari content-type; default jpg (CDN meng-convert ulang).
        $ext = match ($download->header('Content-Type')) {
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
            default      => 'jpg',
        };

        return $this->push($download->body(), $fileNameToCDN . '.' . $ext, $fileNameToCDN, $categoryId, $processType, $addWatermark);
    }

    /**
     * Kirim byte gambar ke CDN dan kembalikan URL-nya.
     *
     * @throws Exception
     */
    private function push(
        string $contents,
        string $originalName,
        string $fileNameToCDN,
        int $categoryId,
        string $processType,
        bool $addWatermark
    ): string {
        $response = Http::timeout(120)
            ->withHeaders([
                'x-api-key' => $this->apiKey
            ])
            ->attach('file', $contents, $originalName)
            ->post("{$this->baseUrl}/images/upload", [
                'name'          => $fileNameToCDN,
                'category_id'   => $categoryId,
                'process_type'  => $processType,
                'add_watermark' => $addWatermark ? '1' : '0',
            ]);

        if ($response->failed()) {
            // Log detail error ke file log Laravel (storage/logs/laravel.log) 
            // agar memudahkan debugging tanpa mengekspos detail ke user.
            Log::error('CDN Upload API Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            throw new Exception('Gagal mengunggah gambar ke peladen CDN.');
        }

        $responseData = $response->json();
        $cdnImageUrl = $responseData['data']['url'] ?? $responseData['url'] ?? null;
        $this->lastUploadedId = $responseData['data']['id'] ?? $responseData['id'] ?? null;

        if (!$cdnImageUrl) {
            Log::error('CDN Response Invalid', ['response' => $responseData]);
            throw new Exception('Format respons CDN tidak valid atau URL tidak ditemukan.');
        }

        return $cdnImageUrl;
    }
}
