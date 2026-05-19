<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    protected $connection = 'mysql_nasional';
    protected $table = 'gallery_img';
    protected $primaryKey = 'gi_id';
    protected $fillable = [
        'gal_id',
        'gi_image',
        'gi_caption',
        'gi_cover',
        'gi_status',
        'created_by',
        'created',
    ];
    public $timestamps = false; // Kita akan set manual kolom 'created' & 'modified'

    public function gallery()
    {
        return $this->belongsTo(Gallery::class, 'gal_id', 'gal_id');
    }
}
