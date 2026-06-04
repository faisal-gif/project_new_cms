<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class WriterDaerah extends Model
{

    use LogsActivity;

    protected $connection = 'mysql_daerah';
    protected $table = 'writers';

    protected $fillable = ['name', 'email', 'password', 'no_whatsapp', 'date_exp', 'network_id', 'status'];

    protected $hidden = [
        'password',
    ];

    // Casts untuk memastikan tipe data yang benar saat dikirim ke React
    protected $casts = [
        'password' => 'hashed', // Tersedia di Laravel 10+
    ];


    public function network(): BelongsTo
    {
        return $this->belongsTo(NetworkDaerah::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'name',
                'email',
                'no_whatsapp',
                'status',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Writer Daerah');
    }
}
