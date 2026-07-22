<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemsLainnya extends Model
{
    use HasFactory;

    protected $connection = 'mysql_berbayar';
    protected $table = 'items_lainnya';

    protected $fillable = [
        'news_package_id',
        'nama_item',
        'type',
        'qty',
    ];

    
}
