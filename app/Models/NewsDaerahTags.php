<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class NewsDaerahTags extends Pivot
{
    protected $connection = 'mysql_daerah';
    protected $table = 'news_tags';
    public $timestamps = false;
    protected $fillable = [
        'news_id',
        'tag_id',
    ];

    public function news()
    {
        return $this->belongsTo(NewsDaerah::class, 'news_id');
    }
}
