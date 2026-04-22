<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsDaerah extends Model
{

    protected $connection = 'mysql_daerah';
    protected $table = 'news';
    protected $guarded = [];

    public function kanal()
    {
        return $this->belongsTo(KanalDaerah::class, 'cat_id');
    }

    public function fokus()
    {
        return $this->belongsTo(FokusDaerah::class, 'fokus_id');
    }

    // Relasi dengan model Writer
    public function writer()
    {
        return $this->belongsTo(WriterDaerah::class, 'writer_id');
    }

    // Relasi dengan Editor (jika diperlukan)
    public function editor()
    {
        return $this->belongsTo(EditorDaerah::class, 'editor_id');
    }
    public function networks()
    {
        return $this->belongsToMany(NetworkDaerah::class, 'news_network', 'news_id', 'net_id');
    }

    public function images()
    {
        return $this->hasOne(NewsDaerahImages::class, 'news_id');
    }

    public function tags()
    {
        return $this->belongsToMany(TagsDaerah::class, 'news_tags', 'news_id', 'tag_id');
    }
}
