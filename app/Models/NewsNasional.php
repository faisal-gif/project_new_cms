<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsNasional extends Model
{
    // App\Models\NewsNasional.php
    protected $connection = 'mysql_nasional'; // Sesuaikan nama koneksi di config/database.php
    protected $table = 'news';
    protected $primaryKey = 'news_id';
    protected $guarded = [];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    public function kanal()
    {
        return $this->belongsTo(KanalNasional::class, 'catnews_id');
    }

    public function fokus()
    {
        return $this->belongsTo(FokusNasional::class, 'focnews_id');
    }

    public function writer()
    {
        return $this->belongsTo(WriterNasional::class, 'journalist_id', 'id');
    }

    public function tags()
    {
      return $this->belongsToMany(
            TagsNasional::class, 
            'news_tags',         
            'news_id',           
            'tag_id',            
            'news_id',           
            'id'                 
        );
    }
}
