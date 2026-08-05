<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsCommerceNasional extends Model
{
    /** catnews_id kanal "News Commerce" — satu sumber kebenaran untuk seluruh fitur. */
    public const KANAL_ID = 35;

    protected $connection = 'mysql_nasional';
    protected $table = 'news_commerce';

    protected $fillable = [
        'news_id',
        'affiliate_link',
        'platform',
        'resolved_url',
        'product_title',
        'product_image',
        'product_description',
        'crawl_status',
    ];

    protected static function booted(): void
    {
        // Auto-set platform dari host affiliate_link setiap kali disimpan.
        static::saving(function (self $commerce) {
            $commerce->platform = self::detectPlatform($commerce->affiliate_link);
        });
    }

    /** Deteksi platform dari host URL. Null kalau URL kosong/invalid. */
    public static function detectPlatform(?string $url): ?string
    {
        $host = strtolower(parse_url((string) $url, PHP_URL_HOST) ?? '');
        if ($host === '') {
            return null;
        }

        $map = [
            'shopee'    => 'Shopee',
            'tokopedia' => 'Tokopedia',
            'lazada'    => 'Lazada',
            'blibli'    => 'Blibli',
            'tiktok'    => 'TikTok',
            'instagram' => 'Instagram',
            'facebook'  => 'Facebook',
        ];
        foreach ($map as $needle => $label) {
            if (str_contains($host, $needle)) {
                return $label;
            }
        }

        // Fallback: nama domain tanpa www / TLD (mis. "example.com" -> "Example").
        return ucfirst(explode('.', preg_replace('/^www\./', '', $host))[0]);
    }

    public function news()
    {
        return $this->belongsTo(NewsNasional::class, 'news_id', 'news_id');
    }
}
