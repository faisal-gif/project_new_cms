<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsNasionalLocate extends Model
{
    protected $connection = 'mysql_nasional'; // Sesuaikan nama koneksi di config/database.php
    protected $table = 'ad_locate';
    protected $fillable = ['ads_id','locate_id','is_views','is_clicks'];

    public $timestamps = false;
}
