<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kanal extends Model
{
    protected $table = 'news_cat';
    
    protected $fillable = ['name', 'slug', 'description', 'keyword', 'status'];
}
