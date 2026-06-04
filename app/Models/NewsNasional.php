<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class NewsNasional extends Model
{

    use LogsActivity;

    // App\Models\NewsNasional.php
    protected $connection = 'mysql_nasional'; // Sesuaikan nama koneksi di config/database.php
    protected $table = 'news';
    protected $primaryKey = 'news_id';
    protected $fillable = [
        'catnews_id',
        'editor_id',
        'news_datepub',
        'news_headline',
        'news_title',
        'news_subtitle',
        'news_caption',
        'news_image_new',
        'news_description',
        'news_content',
        'news_tags',
        'focnews_id',
        'news_view',
        'news_status',
        'news_writer',
        'journalist_id',
        'is_hoaks',
        'news_city',
        'is_code'
    ];

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

    public function viewData()
    {
        return $this->hasOne(
            NewsViewNasional::class,
            'news_id', // Foreign key di tabel news_views
            'news_id'  // Local key di tabel news
        );
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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'is_code',
                'news_datepub',
                'news_title',
                'news_status',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('News Nasional');
    }
}
