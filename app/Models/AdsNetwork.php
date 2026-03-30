<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsNetwork extends Model
{
    protected $connection = 'mysql_daerah';
    protected $table = 'ads_network';

    protected $guarded = [];
}
