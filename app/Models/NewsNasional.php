<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
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

    /**
     * Link publik berita: catnews_slug + news_id + slug judul.
     * SATU-SATUNYA tempat bentuk URL ini didefinisikan — jangan dibangun ulang di tempat
     * lain, karena judul dan kanal bisa berubah dan salinannya akan langsung basi.
     * Tanpa gerbang status: pemanggil yang menentukan kapan link boleh ditampilkan.
     * Pastikan relasi kanal sudah di-eager-load agar tidak N+1.
     */
    public function getPublicUrlAttribute(): ?string
    {
        if (! $this->kanal?->catnews_slug) {
            return null;
        }

        return 'https://timesindonesia.co.id/'
            . $this->kanal->catnews_slug . '/'
            . $this->news_id . '/'
            . Str::slug($this->news_title);
    }

    public function commerce()
    {
        return $this->hasOne(NewsCommerceNasional::class, 'news_id', 'news_id');
    }


    public function fokus()
    {
        return $this->belongsTo(FokusNasional::class, 'focnews_id');
    }

    public function writer()
    {
        return $this->belongsTo(WriterNasional::class, 'journalist_id', 'id');
    }

    /**
     * Kembaran berita ini di DB Daerah. is_code adalah kunci korelasi lintas-database.
     * Selalu batasi is_code non-kosong saat eager load: baris lama bisa punya is_code ''
     * di kedua sisi dan akan berpasangan secara acak.
     */
    public function newsDaerah()
    {
        return $this->hasOne(NewsDaerah::class, 'is_code', 'is_code');
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
        )->withPivot('sort_order')
            ->orderByPivot('sort_order', 'asc');
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
