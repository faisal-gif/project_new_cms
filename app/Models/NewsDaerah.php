<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsDaerah extends Model
{

    protected $connection = 'mysql_daerah';
    protected $table = 'news';
    protected $fillable = [
        'datepub',
        'title',
        'title_regional',
        'subtitle',
        'description',
        'content',
        'youtube',
        'caption',
        'tag',
        'keyword_tool',
        'image',
        'locus',
        'writer_id',
        'editor_note',
        'writer_id',
        'editor_id',
        'cat_id',
        'fokus_id',
        'is_headline',
        'is_editorial',
        'is_adv',
        'is_code ',
        'views',
        'status'
    ];

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

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
