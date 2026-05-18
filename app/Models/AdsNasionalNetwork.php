<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsNasionalNetwork extends Model
{
    protected $connection = 'mysql_nasional'; // Sesuaikan nama koneksi di config/database.php
    protected $table = 'ad_network';
    protected $fillable = ['ads_id','net_id'];

    public $timestamps = false;
}
