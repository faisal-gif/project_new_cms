<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class WriterNasional extends Model
{
    use LogsActivity;

    protected $connection = 'mysql_nasional';
    protected $table = 'journalist';

    protected $fillable = ['slug', 'name', 'image', 'region', 'bio', 'datejoin', 'type', 'status', 'created_by'];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'name',
                'status'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Writer Nasional');
    }
}
