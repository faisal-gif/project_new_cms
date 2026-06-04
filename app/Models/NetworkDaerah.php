<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class NetworkDaerah extends Model
{
    use LogsActivity;


    protected $connection = 'mysql_daerah';
    protected $table = 'network';

    protected $fillable = ['name', 'domain', 'slug', 'title', 'tagline', 'description', 'keyword', 'logo', 'logo_m', 'img_socmed', 'analytics', 'gverify', 'fb', 'tw', 'ig', 'yt', 'gp', 'is_main', 'is_web', 'status'];

    public function adsDaerah()
    {
        return $this->belongsToMany(AdsDaerah::class, 'ads_network', 'net_id', 'ads_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'name',
                'status',
                'domain',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Network Daerah');
    }
}
