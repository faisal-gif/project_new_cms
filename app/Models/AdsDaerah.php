<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdsDaerah extends Model
{
    protected $table = 'ads';

    protected $guarded = [];


    public function ads_locate(): BelongsTo
    {
        return $this->belongsTo(AdsLocate::class, 'locate_id', 'id');
    }

    public function networks()
    {
        return $this->belongsToMany(Network::class, 'ads_network', 'ads_id', 'net_id');
    }
}
