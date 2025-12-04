<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Writer extends Model
{
    //
    protected $table = 'writers';

    protected $fillable = ['name', 'email', 'password', 'no_whatsapp', 'date_exp', 'network_id', 'status'];


    public function network(): BelongsTo
    {
        return $this->belongsTo(Network::class);
    }
}
