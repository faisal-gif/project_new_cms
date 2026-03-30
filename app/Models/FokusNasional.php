<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FokusNasional extends Model
{
    protected $connection = 'mysql_nasional';
    protected $table = 'news_focus';
    protected $primaryKey = 'focnews_id';
    protected $guarded = [];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
}
