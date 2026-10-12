<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Ledger komisi. Nominalnya ditulis SEKALI oleh aplikasi publik di dalam transaksi
 * pembayaran — CMS tidak boleh menyisipkan baris maupun mengubah amount/base_amount/
 * rate_bps/available_at. Koreksi dilakukan lewat status 'reversed', bukan dengan mengedit
 * nominal.
 *
 * $fillable sengaja dibatasi hanya pada kolom yang boleh disentuh CMS.
 */
class AffiliateCommission extends Model
{
    protected $connection = 'mysql_berbayar';
    protected $table = 'affiliate_commissions';

    protected $fillable = [
        'affiliate_id',   // hanya untuk menetapkan penerima baris 'unassigned'
        'status',
        'status_note',
        'payout_id',
        'approved_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'available_at' => 'datetime',
            'approved_at' => 'datetime',
            'paid_at' => 'datetime',
            'base_amount' => 'integer',
            'rate_bps' => 'integer',
            'amount' => 'integer',
        ];
    }

    /** Masa tahan 7 hari sudah terwujud sebagai available_at; jangan dihitung ulang. */
    public function getIsReleasableAttribute(): bool
    {
        return $this->available_at !== null && $this->available_at->lte(now());
    }

    /**
     * Situs asal komisi. Tidak ada kolomnya di tabel ini — ditelusuri lewat paket yang
     * dibeli: payment_id -> payments.package_id -> news_package.type. Pastikan relasi
     * payment.package sudah di-eager-load, kalau tidak akan N+1.
     */
    public function getSitusAttribute(): string
    {
        return PaketBerita::labelSitus($this->payment?->package?->type);
    }

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class, 'affiliate_id');
    }

    /** Perekrut langsung asal baris ini — dipakai menelusuri baris tier2 yang tertahan. */
    public function sourceAffiliate()
    {
        return $this->belongsTo(Affiliate::class, 'source_affiliate_id');
    }

    public function payout()
    {
        return $this->belongsTo(AffiliatePayout::class, 'payout_id');
    }

    /** Member yang membayar. */
    public function user()
    {
        return $this->belongsTo(WriterBerbayar::class, 'user_id');
    }

    /** Pembayaran sumber; dari sini nama paket & nomor referensi diambil. */
    public function payment()
    {
        return $this->belongsTo(PaymentsNewsBerbayar::class, 'payment_id');
    }

    public function scopeSiapCair($query)
    {
        return $query->where('status', 'approved')->whereNull('payout_id');
    }
}
