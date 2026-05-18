<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsNasionalLocateMaster extends Model
{
    protected $connection = 'mysql_nasional'; // Sesuaikan nama koneksi di config/database.php
    protected $table='ad_locate_master';

    public $timestamps = false;
}
