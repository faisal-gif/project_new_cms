<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryCategory extends Model
{
     protected $connection = 'mysql_nasional';
     protected $table = 'gallery_cat';
     protected $primaryKey = 'id';
}
