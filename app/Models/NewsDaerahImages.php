<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsDaerahImages extends Model
{

    protected $connection = 'mysql_daerah';
    protected $table = 'news_images';

    protected $fillable = [
        'news_id',
        'writer_id',
        'image_url',
        'image_url_2',
        'image_url_3',
        'caption',
    ];
}
