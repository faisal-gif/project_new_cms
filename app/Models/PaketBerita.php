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

    protected $fillable = [
        'name',
        'type',
        'feature',
        'quota',
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
        'quota'       => 'integer',
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
