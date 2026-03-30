<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EditorDaerah extends Model
{
    protected $connection = 'mysql_daerah';
    protected $table = 'editors';
    
    protected $fillable = ['name','user_id','id_ti','status','no_whatsapp'];
}
