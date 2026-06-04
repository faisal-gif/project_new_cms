<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class FokusNasional extends Model
{
    use LogsActivity;

    protected $connection = 'mysql_nasional';
    protected $table = 'news_focus';
    protected $primaryKey = 'focnews_id';
    protected $fillable = [
        'focnews_title',
        'focnews_description',
        'focnews_keyword',
        'focnews_image_body',
        'focnews_image_news',
        'focnews_image_mobile',
        'status',
        'created_by',
    ];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'focnews_title',
                'status',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Fokus Nasional');
    }
}
