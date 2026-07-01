<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageStatic extends Model
{
    protected $connection = 'mysql_nasional';
    protected $table = 'page';
    protected $primaryKey = 'page_id';

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    protected $fillable = [
        'page_name',
        'page_desk',
        'page_slug',
        'page_keyword',
        'page_isi',
    ];
}
