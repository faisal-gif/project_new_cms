<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Ekoran extends Model
{
    use LogsActivity;

    protected $connection = 'mysql_nasional';
    protected $table = 'ekoran';

    public $timestamps = false;

    protected $fillable = [
        'title',
        'datepub',
        'emagazine_id',
        'status',
        'views',
        'created_by',
        'created',
        'img1',
        'img2',
        'img3',
        'img4',
        'img5',
        'img6',
        'img7',
        'img8',
        'img9',
        'img10',
        'img11',
        'img12',
        'img13',
        'img14',
        'img15',
        'img16',
        'img17',
        'img18',
        'img19',
        'img20',
        'img21',
        'img22'
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Gunakan logOnly() untuk mendefinisikan kolom secara eksplisit
            ->logOnly([
                'title',
                'datepub',
                'status',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Ekoran');
    }
}
