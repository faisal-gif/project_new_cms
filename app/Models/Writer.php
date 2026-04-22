<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Writer extends Model
{
    protected $fillable = ['id', 'name', 'email', 'password', 'no_whatsapp', 'date_exp', 'network_id', 'id_nasional', 'id_daerah', 'status', 'editor_id'];
}
