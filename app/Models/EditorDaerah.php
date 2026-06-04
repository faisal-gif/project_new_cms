<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class EditorDaerah extends Model
{
    use LogsActivity;

    protected $connection = 'mysql_daerah';
    protected $table = 'editors';


    protected $fillable = ['name', 'user_id', 'id_ti', 'status', 'no_whatsapp'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'name',
                'status',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Editor Daerah');
    }
}
