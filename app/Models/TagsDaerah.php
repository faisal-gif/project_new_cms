<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TagsDaerah extends Model
{
    protected $connection = 'mysql_daerah';
    protected $table = 'tags';
    protected $fillable = [
        'name',
    ];
    public $timestamps = false;
    // Langsung hubungkan ke News, tanpa lewat NewsTags secara manual
    public function news()
    {
        return $this->belongsToMany(NewsDaerah::class, 'news_tags', 'tag_id', 'news_id');
    }
}
