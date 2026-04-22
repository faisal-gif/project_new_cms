<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsViewNasional extends Model
{
    // gunakan connection yang sama.
    protected $connection = 'mysql_nasional'; 
    protected $table = 'news_views';
    protected $primaryKey = 'id';
    protected $guarded = [];

    // MATIKAN TIMESTAMPS: 
    // Berdasarkan struktur DESCRIBE Anda, tabel ini tidak punya created_at/updated_at.
    // Jika tidak dimatikan, Laravel akan melempar error saat melakukan insert/update.
    public $timestamps = false;
}
