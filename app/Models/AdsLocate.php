<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsLocate extends Model
{
    protected $connection = 'mysql_daerah';
    protected $table = 'ads_locate';
    protected $fillable = ['name', 'type', 'image', 'status'];
}
