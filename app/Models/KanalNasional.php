<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class KanalNasional extends Model
{
    use LogsActivity;

    protected $connection = 'mysql_nasional';
    protected $table = 'news_category';
    protected $primaryKey = 'catnews_id';


    protected $fillable = [
        'catnews_order',
        'catnews_title',
        'catnews_slug',
        'catnews_description',
        'catnews_keyword',
        'catnews_status',
    ];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'catnews_title',
                'catnews_status',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Kanal Nasional');
    }
}
