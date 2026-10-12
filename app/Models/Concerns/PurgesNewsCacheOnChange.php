<?php

namespace App\Models\Concerns;

use App\Jobs\PurgeNewsCache;
use Illuminate\Support\Facades\Log;

/**
 * Taksonomi (kanal, fokus, tag) ikut di-cache API Berita pada endpoint /kanal,
 * /list_focus, /cat_detail, /list_tags — dan TTL-nya panjang. Tanpa hook ini, mengganti
 * nama kanal baru terlihat setelah TTL habis.
 *
 * Selalu purge menyeluruh (news_id null): perubahan satu kanal memengaruhi daftar kanal,
 * breadcrumb, sekaligus setiap berita di bawahnya — tidak ada satu id yang mewakili.
 *
 * Dipakai bersama model yang TIDAK punya booted() sendiri. NewsNasional punya logika
 * berbeda (purge tertarget untuk suntingan isi), jadi ia menulis hook-nya sendiri.
 */
trait PurgesNewsCacheOnChange
{
    protected static function bootPurgesNewsCacheOnChange(): void
    {
        $purge = function () {
            try {
                PurgeNewsCache::dispatch();
            } catch (\Throwable $e) {
                // Antrean memakai koneksi default. Kalau bermasalah, jangan sampai
                // menggagalkan penyuntingan kanal — cache basi jauh lebih ringan.
                Log::warning('Dispatch purge cache (taksonomi) gagal: ' . $e->getMessage());
            }
        };

        static::saved($purge);
        static::deleted($purge);
    }
}
