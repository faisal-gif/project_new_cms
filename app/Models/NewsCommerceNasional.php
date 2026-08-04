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
        'resolved_url',
        'product_title',
        'product_image',
        'product_description',
        'crawl_status',
    ];

    public function news()
    {
        return $this->belongsTo(NewsNasional::class, 'news_id', 'news_id');
    }
}
