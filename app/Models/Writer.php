<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Writer extends Model
{
    //
    protected $table = 'writers';


    public function network(): BelongsTo
    {
        return $this->belongsTo(Network::class);
    }
}
