<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class NewsNasionalTags extends Pivot
{
   protected $connection = 'mysql_nasional';
    protected $table = 'news_tags';
    public $timestamps = false;
    protected $fillable = [
        'news_id',
        'tag_id',
    ];

    public function news()
    {
        return $this->belongsTo(NewsNasional::class, 'news_id');
    }
}
