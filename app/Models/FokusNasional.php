<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FokusNasional extends Model
{
    protected $connection = 'mysql_nasional';
    protected $table = 'news_focus';
    protected $primaryKey = 'focnews_id';
    protected $fillable = [
        'focnews_title',
        'focnews_description',
        'focnews_keyword',
        'focnews_image_body',
        'focnews_image_news',
        'focnews_image_mobile',
        'created_by',
    ];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
}
