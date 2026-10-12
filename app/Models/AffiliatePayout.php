<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Batch pencairan komisi. Satu batch hanya untuk SATU afiliator, dan amount-nya wajib
 * sama dengan jumlah amount seluruh komisi yang payout_id-nya menunjuk batch ini.
 * Kedua invariant itu tidak dipaksakan database — CMS yang menjaganya.
 *
 * Data rekening disalin dari affiliates saat batch dibuat, supaya jadi bukti rekening
 * pada saat itu meski data afiliator berubah kemudian.
 */
class AffiliatePayout extends Model
{
    protected $connection = 'mysql_berbayar';
    protected $table = 'affiliate_payouts';

    protected $fillable = [
        'affiliate_id',
        'period_start',
        'period_end',
        'amount',
        'method',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'reference',
        'proof_path',
        'status',
        'paid_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'paid_at' => 'datetime',
            'amount' => 'integer',
        ];
    }

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class, 'affiliate_id');
    }

    public function commissions()
    {
        return $this->hasMany(AffiliateCommission::class, 'payout_id');
    }
}
