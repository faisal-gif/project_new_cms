<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengumumanWebBerbayar extends Model
{

    use HasFactory;

    protected $connection = 'mysql_berbayar';
    protected $table = 'pengumuman';
    protected $fillable = [
        'title',
        'content',
        'kategori',
        'type',
        'start_date',
        'end_date',
        'is_active',
        'created_by'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];
}
