<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentsNewsBerbayar extends Model
{
    use HasFactory;

    protected $connection = 'mysql_berbayar';

    protected $table = 'payments';

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

    /**
     * Komisi afiliasi yang terbit dari pembayaran ini. Maksimal tiga baris
     * (tier1, tier2, internal) — dijamin unique(payment_id, role) di database,
     * jadi join per pembayaran selalu kena index.
     *
     * Nominalnya ditulis aplikasi publik, CMS tidak pernah mengubahnya.
     */
    public function commissions(): HasMany
    {
        return $this->hasMany(AffiliateCommission::class, 'payment_id');
    }

    /**
     * Komisi yang benar-benar keluar dari kantor. Baris `rejected` dan `reversed`
     * dibatalkan sebelum uangnya berpindah, jadi tidak ikut dihitung.
     */
    public const STATUS_KOMISI_KELUAR = ['rejected', 'reversed'];

    /**
     * Omzet yang benar-benar MASUK pada satu rentang.
     *
     * Ini satu-satunya definisi omzet kotor di CMS — dipakai laporan transaksi,
     * laporan afiliasi, dan dashboard. Dasarnya `paid_at` (saat uang diterima),
     * bukan `created_at` (saat invoice dibuat): invoice yang dibuat akhir bulan
     * dan dibayar awal bulan berikutnya adalah pemasukan bulan pembayaran.
     *
     * Jangan pakai untuk DAFTAR transaksi — daftar memuat `pending` dan `expired`
     * yang `paid_at`-nya NULL, dan di sana `created_at` memang sumbu yang benar.
     */
    public function scopeLunasPada($query, $awal, $akhir)
    {
        return $query->where('status', 'paid')->whereBetween('paid_at', [$awal, $akhir]);
    }

    /**
     * Situs dibaca dari kolom `payments.type` sendiri, bukan hasil join ke
     * `news_package.type`. Sudah diverifikasi 0 beda dari 1.784 baris, dan cara ini
     * tidak ikut membuang pembayaran yang paketnya sudah hilang.
     */
    public function scopeSitus($query, $type)
    {
        return $query->where('type', (int) $type);
    }
}
