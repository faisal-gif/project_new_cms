<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketBerita extends Model
{
    use HasFactory;

    protected $connection = 'mysql_berbayar';
    protected $table = 'news_package';

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    /**
     * Lini produk (situs) pemilik paket. Kolom `type` inilah satu-satunya penanda situs
     * asal sebuah komisi: affiliate_commissions.payment_id -> payments.package_id -> type.
     *
     * Hanya 1 dan 4 yang benar-benar terpakai di data saat ini; 2 dan 3 ada di enum tapi
     * belum dipakai, jadi labelnya netral sampai ada nama resminya.
     */
    public const SITUS = [
        '1' => 'AJP',
        '2' => 'Lini 2',
        '3' => 'Lini 3',
        '4' => 'Kopi TIMES',
    ];

    public static function labelSitus(?string $type): string
    {
        // Paket lama (5 baris) type-nya kosong dan tidak punya pembayaran lunas.
        return self::SITUS[$type] ?? ($type === null || $type === '' ? 'Tanpa Situs' : "Lini {$type}");
    }

    /** Opsi dropdown filter situs, dipakai daftar komisi dan laporan. */
    public static function opsiSitus(): array
    {
        return collect(self::SITUS)->map(fn($label, $key) => ['value' => $key, 'label' => $label])->values()->all();
    }

    protected $fillable = [
        'name',
        'type',
        'feature',
        'quota',
        'feed_instagram',
        'ekoran',
        'wa_channel',
        'price',
        'period',
        'jenis_periode',
        'popular',
        'promo',
        'level',
        'badge',
        'flash_sale',
        'kategori_produk',
        'status',
        'created_by',
        'modified_by',
    ];

    /**
     * Casting atribut agar Laravel otomatis mem-parsing tipe data dengan benar 
     * sebelum dikirim sebagai JSON/Inertia props ke komponen React.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quota'          => 'integer',
        'feed_instagram' => 'integer',
        'ekoran'         => 'integer',
        'wa_channel'     => 'integer',
        'price'       => 'integer',
        'period'      => 'integer',
        'popular'     => 'boolean', // tinyint(4) -> true/false
        'promo'       => 'boolean', // tinyint(4) -> true/false
        'level'       => 'integer', // asumsikan ini level tier (1,2,3)
        'flash_sale'  => 'boolean', // tinyint(1) -> true/false
        'status'      => 'boolean', // tinyint(1) -> true/false
    ];

    public function itemsLainnya()
    {
        return $this->hasMany(ItemsLainnya::class, 'news_package_id');
    }
}
