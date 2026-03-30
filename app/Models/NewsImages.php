<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsImages extends Model
{
    protected $fillable = [
        'news_id',
        'writer_id',
        'image_url',
        'image_url_2',
        'image_url_3',
        'caption',
    ];

    public function news()
    {
        return $this->belongsTo(News::class, 'news_id');
    }
}
