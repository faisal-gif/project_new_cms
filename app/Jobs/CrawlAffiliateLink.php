<?php

namespace App\Jobs;

use App\Models\NewsCommerceNasional;
use App\Services\CdnService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CrawlAffiliateLink implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(public int $newsId) {}

    public function handle(CdnService $cdn): void
    {
        $commerce = NewsCommerceNasional::where('news_id', $this->newsId)->first();
        if (!$commerce) {
            return; // baris commerce sudah dihapus, tidak ada yang perlu di-crawl
        }

        // Follow redirect short-link (s.shopee.co.id/...) sampai halaman produk asli.
        // UA link-preview (WhatsApp): Shopee HANYA menyajikan OG meta ke crawler
        // preview seperti ini. UA browser/bot biasa cuma dapat JS shell tanpa OG,
        // UA Facebook malah 403. Terverifikasi 2026-08 dengan link produk asli.
        $response = Http::timeout(30)
            ->withHeaders(['User-Agent' => 'WhatsApp/2.23.20.0'])
            ->get($commerce->affiliate_link);

        $html = $response->body();
        $resolvedUrl = (string) $response->effectiveUri();

        // Instagram (dan sejenisnya) kadang lempar ke login wall saat kena
        // rate-limit/anti-bot. Jangan simpan halaman login sebagai "produk" —
        // throw agar job retry, dan kalau tetap gagal -> status failed (bisa
        // di-crawl ulang manual saat IP sudah tidak diblok).
        if (str_contains($resolvedUrl, '/accounts/login')) {
            throw new \RuntimeException("Diblok login wall (anti-bot) untuk news_id {$this->newsId}.");
        }

        $ogTitle = self::og($html, 'title');
        $ogImage = self::og($html, 'image');
        if ($ogTitle === null && $ogImage === null) {
            throw new \RuntimeException("OG meta tidak ditemukan untuk news_id {$this->newsId} (mungkin diblok anti-bot).");
        }

        // Download og:image ke CDN. Kalau gagal, fallback ke URL asli agar
        // gambar tetap tampil (crawl tidak dianggap gagal karena CDN).
        $productImage = $ogImage;
        if ($ogImage) {
            try {
                $productImage = $cdn->uploadFromUrl($ogImage, 'commerce-' . $this->newsId, 1, 'convert', false);
            } catch (\Throwable $e) {
                Log::warning("Upload CDN gagal untuk news_id {$this->newsId}, pakai URL asli: " . $e->getMessage());
            }
        }

        $commerce->update([
            'resolved_url'        => $resolvedUrl,
            'product_title'       => $ogTitle,
            'product_image'       => $productImage,
            'product_description' => self::og($html, 'description'),
            'crawl_status'        => 'success',
        ]);
    }

    /**
     * Ambil isi <meta property="og:{prop}" content="...">. Toleran urutan
     * atribut (property/content bisa bolak-balik). Null kalau tidak ketemu.
     */
    public static function og(string $html, string $prop): ?string
    {
        $p = preg_quote($prop, '/');
        if (
            preg_match('/<meta[^>]+property=["\']og:' . $p . '["\'][^>]+content=["\']([^"\']*)["\']/i', $html, $m)
            || preg_match('/<meta[^>]+content=["\']([^"\']*)["\'][^>]+property=["\']og:' . $p . '["\']/i', $html, $m)
        ) {
            return html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5);
        }
        return null;
    }

    public function failed(\Throwable $e): void
    {
        Log::error("CrawlAffiliateLink gagal untuk news_id {$this->newsId}: " . $e->getMessage());
        NewsCommerceNasional::where('news_id', $this->newsId)->update(['crawl_status' => 'failed']);
    }
}
