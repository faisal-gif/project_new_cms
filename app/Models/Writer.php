<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Writer extends Model
{
    protected $fillable = ['id', 'name', 'email', 'password', 'no_whatsapp', 'date_exp', 'network_id', 'id_nasional', 'id_daerah', 'status', 'editor_id'];


    protected $hidden = [
        'password',
    ];

    // Casts untuk memastikan tipe data yang benar saat dikirim ke React
    protected $casts = [
        'password' => 'hashed', // Tersedia di Laravel 10+
    ];

    // Relasi dengan nasional
    public function nasional()
    {
        return $this->belongsTo(WriterNasional::class, 'id_nasional', 'id');
    }

    // Relasi dengan daerah
    public function daerah()
    {
        return $this->belongsTo(WriterDaerah::class, 'id_daerah', 'id');
    }
}
