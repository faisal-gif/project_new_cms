<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{

    protected $connection = 'mysql_nasional';
    protected $table = 'gallery';
    protected $primaryKey = 'gal_id';
    public $timestamps = false; // Kita akan set manual kolom 'created' & 'modified'

    protected $fillable = [
        'gal_catid',
        'gal_title',
        'gal_subtitle',
        'gal_description',
        'gal_content',
        'gal_city',
        'gal_pewarta',
        'fotografer_id',
        'editor_id',
        'gal_status',
        'gal_datepub',
        'created_by',
        'created',
        'gal_view',
    ];

    // Relasi ke tabel gambar
    public function images()
    {
        return $this->hasMany(GalleryImage::class, 'gal_id', 'gal_id');
    }

    public function kanal()
    {
        return $this->belongsTo(GalleryCategory::class, 'gal_catid', 'id');
    }
}
