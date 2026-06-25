<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Gallery extends Model
{

    use LogsActivity;

    protected $connection = 'mysql_nasional';
    protected $table = 'gallery';
    protected $primaryKey = 'gal_id';
  

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


    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
    // Relasi ke tabel gambar
    public function images()
    {
        return $this->hasMany(GalleryImage::class, 'gal_id', 'gal_id');
    }

    public function kanal()
    {
        return $this->belongsTo(GalleryCategory::class, 'gal_catid', 'id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'gal_title',
                'gal_description',
                'gal_status',
                'gal_datepub',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Gallery');
    }
}
