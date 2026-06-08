<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class News extends Model
{

    use LogsActivity;

    protected $fillable = [
        'is_code',
        'writer_id',
        'distribution_status',
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

    public function notes()
    {
        return $this->hasMany(NewsNote::class, 'news_id', 'id')->latest();
    }

    protected static $recordEvents = ['updated', 'deleted'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'is_code',
                'distribution_status',
                'title',
            ])
            ->logOnlyDirty()         // Hanya catat jika datanya benar-benar berubah
            ->dontSubmitEmptyLogs()  // Jangan buat log jika tidak ada perubahan
            ->useLogName('News Master'); // Samakan dengan nama log di Controller
    }
}
