<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Bersihkan cache API Berita (api.tin.co.id) setelah berita nasional berubah.
 *
 * Spesifikasi GET /v1/cache/purge:
 *   header : x-api-key
 *   query  : token   (wajib, PURGE_TOKEN — rahasia, hanya CMS)
 *            news_id (opsional; TANPA ini = purge semua)
 *   200 Purged · 403 Token salah/absen
 *
 * $newsId null berarti purge menyeluruh — dipakai saat artikel baru terbit atau saat
 * status/kanal berubah, karena daftar (all_news, sitemap, dll) ikut basi. Untuk suntingan
 * yang hanya mengubah isi, cukup purge detail satu artikel.
 *
 * afterCommit: dipicu dari model event NewsNasional yang sering berada di dalam transaksi
 * mysql_nasional. Tanpa ini, purge bisa jalan sebelum barisnya ter-commit — atau setelah
 * transaksi di-rollback.
 */
class PurgeNewsCache implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(public ?int $newsId = null)
    {
        // Diset di sini, bukan sebagai properti: trait Queueable sudah mendeklarasikan
        // $afterCommit tanpa nilai default, dan redeklarasi apa pun ditolak PHP.
        $this->afterCommit = true;
    }

    public function handle(): void
    {
        $token = config('services.tin_api.purge_token');
        $baseUrl = config('services.tin_api.url');

        // Belum dikonfigurasi: diamkan saja, jangan bikin job gagal berulang kali.
        if (blank($token) || blank($baseUrl)) {
            Log::warning('Purge cache dilewati: TIN_API_PURGE_TOKEN / TIN_API_URL belum diisi.');
            return;
        }

        $response = Http::timeout(15)
            ->withHeaders(['x-api-key' => config('services.tin_api.api_key')])
            ->get(rtrim($baseUrl, '/') . '/cache/purge', array_filter([
                'token' => $token,
                'news_id' => $this->newsId,
            ], fn($v) => $v !== null));

        if ($response->failed()) {
            // 403 = token salah/absen. Tidak ada gunanya diulang, jadi jangan lempar exception.
            if ($response->status() === 403) {
                Log::error('Purge cache ditolak (403): token salah atau absen.');
                return;
            }

            // Selain itu boleh gagal supaya queue mengulang sesuai $tries.
            throw new \RuntimeException(
                'Purge cache gagal (HTTP ' . $response->status() . '): ' . $response->body()
            );
        }

        Log::info('Purge cache berhasil.', ['news_id' => $this->newsId ?? 'semua']);
    }
}
