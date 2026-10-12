<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Atribusi member ke perekrutnya. HANYA BACA dari sisi CMS — baris ini ditulis
 * aplikasi publik saat member mendaftar, dan satu member selamanya milik satu perekrut.
 *
 * $guarded = semua kolom: mass assignment sengaja dimatikan supaya tidak ada jalur
 * tak sengaja yang menulis ke tabel ini dari CMS.
 */
class AffiliateReferral extends Model
{
    protected $connection = 'mysql_berbayar';
    protected $table = 'affiliate_referrals';

    protected $guarded = ['*'];

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class, 'affiliate_id');
    }

    /** Member yang direkrut. */
    public function user()
    {
        return $this->belongsTo(WriterBerbayar::class, 'user_id');
    }
}
