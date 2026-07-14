<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentsNewsBerbayar extends Model
{
    use HasFactory;
    protected $connection = 'mysql_berbayar';


    protected $table = 'payments';

    // Sesuaikan koneksi jika tabel payments berada di database yang sama 
    // dengan news_package dan wartawan. Jika default, hapus baris ini.
    // protected $connection = 'mysql_berbayar'; 

    protected $fillable = [
        'user_id',
        'package_id',
        'type',
        'merchant_ref',
        'reference',
        'method',
        'amount',
        'status',
        'checkout_url',
        'paid_at',
        'expired_at',
    ];

    protected $casts = [
        'amount'     => 'integer',
        'type'       => 'integer',
        'paid_at'    => 'datetime',
        'expired_at' => 'datetime',
    ];

    /**
     * Relasi ke model WriterBerbayar (User)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(WriterBerbayar::class, 'user_id');
    }

    /**
     * Relasi ke model PaketBerita (Package)
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(PaketBerita::class, 'package_id');
    }
}
