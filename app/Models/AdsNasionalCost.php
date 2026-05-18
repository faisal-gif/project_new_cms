<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsNasionalCost extends Model
{
    protected $connection = 'mysql_nasional'; // Sesuaikan nama koneksi di config/database.php
    protected $table = 'ad_cost';
    protected $fillable = ['ads_id', 'cost_end'];

    public $timestamps = false;
}
