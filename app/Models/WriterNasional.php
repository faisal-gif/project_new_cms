<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WriterNasional extends Model
{
    protected $connection = 'mysql_nasional';
    protected $table = 'journalist';
    
    protected $fillable = ['slug','name','image','region','bio','datejoin','type','status','created_by'];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
}
