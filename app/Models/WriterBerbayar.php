<?php

namespace App\Models;

use App\Enum\WriterBerbayarType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class WriterBerbayar extends Model
{
    protected $connection = 'mysql_berbayar';
    protected $table = 'wartawan';
    protected $fillable = [
        'nama',
        'city',
        'prov',
        'address',
        'contact',
        'email',
        'password',
        'package_id',
        'dateexp',
        'quota_news',
        'feed_instagram',
        'ekoran',
        'wa_channel',
        'type',
        'kategori',
        'instansi',
        'status',
    ];


    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'dateexp' => 'date',
            'password' => 'hashed',
            'type' => WriterBerbayarType::class,
        ];
    }

    protected $appends = [
        'type_label',
        'is_active_subscriber'
    ];

    protected function typeLabel(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->type?->label() ?? 'Unknown',
        );
    }

    protected function isActiveSubscriber(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->dateexp && Carbon::parse($this->dateexp)->isFuture(),
        );
    }
}
