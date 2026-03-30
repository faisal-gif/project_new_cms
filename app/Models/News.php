<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{


    protected $fillable = [
        'is_code',
        'writer_id',
        'title',
        'image_thumbnail',
        'image_caption',
        'description',
        'content',
    ];

    public function writer()
    {
        return $this->belongsTo(Writer::class, 'writer_id');
    }

    public function images()
    {
        return $this->hasOne(NewsImages::class, 'news_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tags::class, 'news_tags', 'news_id', 'tag_id');
    }

    public function newsDaerah()
    {
        // hasOne(Model, foreign_key, local_key)
        return $this->hasOne(NewsDaerah::class, 'is_code', 'is_code');
    }

    public function newsNasional()
    {
        return $this->hasOne(NewsNasional::class, 'is_code', 'is_code');
    }
}
