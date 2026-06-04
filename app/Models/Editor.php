<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Editor extends Model
{
    use LogsActivity;

    protected $table = 'editors';

    protected $fillable = ['name', 'user_id', 'id_ti', 'id_daerah', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function daerah()
    {
        return $this->belongsTo(EditorDaerah::class, 'id_daerah');
    }

    public function nasional()
    {
        return $this->belongsTo(EditorNasional::class, 'id_ti', 'editor_id');
    }

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
            ->useLogName('Editor Master');
    }
}
