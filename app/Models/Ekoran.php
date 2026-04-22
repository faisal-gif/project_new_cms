<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ekoran extends Model
{
      protected $connection = 'mysql_nasional';
   // Arahkan ke nama tabel jika tidak plural standar
    protected $table = 'ekoran'; 

    // Nonaktifkan default timestamps (created_at & updated_at)
    public $timestamps = false; 

    // Lindungi ID dari mass assignment, sisanya bisa diisi
    protected $guarded = ['id'];
}
