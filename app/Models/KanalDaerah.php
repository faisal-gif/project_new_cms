<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class KanalDaerah extends Model
{
    use LogsActivity;

    protected $connection = 'mysql_daerah';
    protected $table = 'news_cat';

    protected $fillable = ['name', 'slug', 'description', 'keyword', 'status'];

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
            ->useLogName('Kanal Daerah');
    }
}
