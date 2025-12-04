<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Editor extends Model
{
    protected $table = 'editors';
    
    protected $fillable = ['name','user_id','id_ti','status','no_whatsapp'];
}
