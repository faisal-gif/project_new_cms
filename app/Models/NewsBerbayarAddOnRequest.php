<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsBerbayarAddOnRequest extends Model
{
    
  // Menggunakan koneksi database spesifik
    protected $connection = 'mysql_berbayar';

    // Nama tabel di database
    protected $table = 'news_addon_requests';

    // Mendaftarkan kolom-kolom yang diizinkan untuk diisi secara massal (Mass Assignment)
    protected $fillable = [
        'news_id',
        'wartawan_id',
        'jenis_request',
        'status',
        'keterangan_admin',
        'url_hasil'
    ];

    /**
     * Relasi balik ke tabel Berita (News)
     */
    public function news()
    {
        return $this->belongsTo(NewsBerbayar::class, 'news_id');
    }

    /**
     * Relasi balik ke tabel Wartawan / User (Pewarta)
     */
    public function wartawan()
    {
        return $this->belongsTo(WriterBerbayar::class, 'wartawan_id');
    }

}
