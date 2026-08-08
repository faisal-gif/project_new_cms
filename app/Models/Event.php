<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    // Tabel dibuat & dibagi aplikasi publik (timesindo_ajp) — jangan buat migration.
    protected $connection = 'mysql_berbayar';
    protected $table = 'events';

    // Hanya category = public_event yang membuka form publik /kirim-berita/{slug}.
    const CATEGORIES = ['event', 'public_event', 'lomba'];

    protected $fillable = [
        'name',
        'slug',
        'category',
        'description',
        'enabled',
        'starts_at',
        'ends_at',
        'quota',
    ];

    protected $casts = [
        'enabled'   => 'boolean',
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'quota'     => 'integer',
    ];

    // Kiriman publik tersimpan di news dengan event_id menunjuk ke sini.
    public function submissions(): HasMany
    {
        return $this->hasMany(NewsBerbayar::class, 'event_id');
    }
}
