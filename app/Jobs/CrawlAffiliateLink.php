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

        // Hybrid: coba direct dulu (bagus & gratis untuk Shopee dsb), kalau
        // diblok/kosong baru fallback ke layanan link-preview (Instagram, yang
        // memblok IP datacenter server).
        [$title, $image, $description, $resolvedUrl] = $this->fetchDirect($commerce->affiliate_link)
            ?? $this->fetchViaProxy($commerce->affiliate_link);

        if ($title === null && $image === null) {
            throw new \RuntimeException("Metadata tidak ditemukan untuk news_id {$this->newsId} (diblok anti-bot, direct & proxy gagal).");
        }

        // Download image ke CDN. Kalau gagal, fallback ke URL asli agar gambar
        // tetap tampil (crawl tidak dianggap gagal hanya karena CDN).
        $productImage = $image;
        if ($image) {
            try {
                $productImage = $cdn->uploadFromUrl($image, 'commerce-' . $this->newsId, 1, 'convert', false);
            } catch (\Throwable $e) {
                Log::warning("Upload CDN gagal untuk news_id {$this->newsId}, pakai URL asli: " . $e->getMessage());
            }
        }

        $commerce->update([
            'resolved_url'        => $resolvedUrl,
            'product_title'       => $title,
            'product_image'       => $productImage,
            'product_description' => $description,
            'crawl_status'        => 'success',
        ]);
    }

    /**
     * Ambil OG meta langsung dari sumber. UA WhatsApp (link-preview): Shopee &
     * banyak situs HANYA kasih OG meta ke crawler preview ini; UA browser cuma
     * dapat JS shell. Return null kalau diblok (login wall) atau OG kosong —
     * pemanggil lalu coba proxy.
     *
     * @return array{0:?string,1:?string,2:?string,3:string}|null
     */
    private function fetchDirect(string $url): ?array
    {
        try {
            $r = Http::timeout(30)->withHeaders(['User-Agent' => 'WhatsApp/2.23.20.0'])->get($url);
            $resolved = (string) $r->effectiveUri();
            if (str_contains($resolved, '/accounts/login')) {
                return null; // login wall -> biar fallback ke proxy
            }
            $html = $r->body();
            $title = self::og($html, 'title');
            $image = self::og($html, 'image');
            if ($title === null && $image === null) {
                return null;
            }
            return [$title, $image, self::og($html, 'description'), $resolved];
        } catch (\Throwable $e) {
            Log::warning("Direct crawl gagal untuk news_id {$this->newsId}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Fallback lewat layanan link-preview (Microlink) yang fetch dari
     * infrastruktur mereka, sehingga lolos blok IP datacenter (mis. Instagram).
     *
     * @return array{0:?string,1:?string,2:?string,3:string}
     */
    private function fetchViaProxy(string $url): array
    {
        try {
            $r = Http::timeout(45)->get('https://api.microlink.io', ['url' => $url]);
            $j = $r->json();
            if (($j['status'] ?? null) === 'success') {
                $d = $j['data'] ?? [];
                return [$d['title'] ?? null, $d['image']['url'] ?? null, $d['description'] ?? null, $d['url'] ?? $url];
            }
            Log::warning("Proxy preview gagal untuk news_id {$this->newsId}: " . $r->body());
        } catch (\Throwable $e) {
            Log::warning("Proxy preview error untuk news_id {$this->newsId}: " . $e->getMessage());
        }
        return [null, null, null, $url];
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
