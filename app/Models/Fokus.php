<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fokus extends Model
{
    protected $table = 'news_fokus';
    
    protected $fillable = ['name', 'description', 'keyword', 'img_desktop_list', 'img_desktop_news', 'img_mobile', 'status'];
}
