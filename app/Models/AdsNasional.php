<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsNasional extends Model
{
    protected $connection = 'mysql_nasional'; // Sesuaikan nama koneksi di config/database.php
    protected $table = 'ad_list';

    protected $fillable = ['unique_id', 'datestart', 'dateend', 'title', 'd_img', 'm_img', 'url_txt', 'url', 'cost', 'cpc', 'is_status'];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    public function locates()
    {
        // Parameter: (Nama Model Relasi, Foreign Key di tabel relasi, Local Key)
        return $this->hasMany(AdsNasionalLocate::class, 'ads_id', 'id');
    }
}
