<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class History extends Model
{
    protected $fillable = ['user_id', 'action', 'tipe', 'target'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
