<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class FokusDaerah extends Model
{
    use LogsActivity;

    protected $connection = 'mysql_daerah';
    protected $table = 'news_fokus';

    protected $fillable = ['name', 'description', 'keyword', 'img_desktop_list', 'img_desktop_news', 'img_mobile', 'status'];

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
            ->useLogName('Fokus Daerah');
    }
}
