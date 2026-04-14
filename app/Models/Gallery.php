<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{

    protected $connection = 'mysql_nasional';
    protected $table = 'gallery';
    protected $primaryKey = 'gal_id';
    public $timestamps = false; // Kita akan set manual kolom 'created' & 'modified'

    protected $guarded = [];

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
