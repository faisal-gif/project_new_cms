<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Afiliator program referral. Tabel dibuat aplikasi publik (kopi.times.co.id); CMS
 * mengelolanya penuh, tapi TIDAK boleh membuat migration untuknya.
 *
 * Hanya status 'active' yang menghasilkan atribusi dan komisi baru.
 */
class Affiliate extends Model
{
    protected $connection = 'mysql_berbayar';
    protected $table = 'affiliates';

    protected $fillable = [
        // Situs pemilik afiliator: 1 = AJP, 4 = Kopi TIMES. Afiliator hanya berkomisi
        // dari pendaftar di situs yang sama, jadi nilainya tidak diubah setelah dibuat.
        'type',
        'user_id',
        'upline_id',
        'code',
        'name',
        'email',
        'phone',
        'payout_method',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'status',
        'approved_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            // Diisi aplikasi publik saat member mengajukan diri; kosong bila dibuat admin.
            'terms_accepted_at' => 'datetime',
        ];
    }

    /** Pengajuan mandiri dari member, bukan dibuat admin. */
    public function isPengajuanMandiri(): bool
    {
        return $this->terms_accepted_at !== null;
    }

    public function scopeSitus($query, $type)
    {
        return $query->where('type', $type);
    }

    /** Kode referral: huruf besar + angka, dipakai di URL publik ?ref= */
    public static function generateCode(int $panjang = 8): string
    {
        do {
            $code = Str::upper(Str::random($panjang));
        } while (static::where('code', $code)->exists());

        return $code;
    }

    /**
     * Apakah $uplineId akan membentuk lingkaran bila dijadikan upline dari $affiliateId.
     * Ditelusuri ke atas; batas kedalaman mencegah loop tak berujung bila data terlanjur rusak.
     */
    public static function wouldLoop(?int $affiliateId, ?int $uplineId, int $maksKedalaman = 50): bool
    {
        if (!$affiliateId || !$uplineId) {
            return false;
        }
        if ($affiliateId === $uplineId) {
            return true;
        }

        $kursor = $uplineId;
        for ($i = 0; $i < $maksKedalaman && $kursor; $i++) {
            $kursor = static::where('id', $kursor)->value('upline_id');
            if ((int) $kursor === $affiliateId) {
                return true;
            }
        }

        return false;
    }

    public function upline()
    {
        return $this->belongsTo(self::class, 'upline_id');
    }

    public function downlines()
    {
        return $this->hasMany(self::class, 'upline_id');
    }

    /** Akun login afiliator di tabel wartawan. Opsional. */
    public function user()
    {
        return $this->belongsTo(WriterBerbayar::class, 'user_id');
    }

    public function referrals()
    {
        return $this->hasMany(AffiliateReferral::class, 'affiliate_id');
    }

    public function commissions()
    {
        return $this->hasMany(AffiliateCommission::class, 'affiliate_id');
    }

    public function payouts()
    {
        return $this->hasMany(AffiliatePayout::class, 'affiliate_id');
    }

    public function getReferralLinkAttribute(): string
    {
        return rtrim(config('services.berbayar.kt_url'), '/') . '/?ref=' . $this->code;
    }
}
