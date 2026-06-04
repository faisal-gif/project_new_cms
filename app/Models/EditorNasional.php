<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class EditorNasional extends Model
{
    use LogsActivity;
    
    protected $connection = 'mysql_nasional';
    protected $table = 'editor';
    protected $primaryKey = 'editor_id';

    protected $fillable = ['editor_name', 'editor_alias', 'editor_image', 'editor_description', 'status', 'created_by'];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'editor_name',
                'status',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Editor Nasional');
    }
}
