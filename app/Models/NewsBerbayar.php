<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsBerbayar extends Model
{
    use HasFactory;

    protected $connection = 'mysql_berbayar';

    protected $table = 'news';

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';

    protected $fillable = [
        'is_code',
        'pewarta_id',
        'datetime',
        'title',
        'content',
        'image',
        'caption',
        'url',
        'headline',
        'upload_to',
        'city',
        'narsum',
        'profesi',
        'contact',
        'image2',
        'image3',
        'gmap_url',
        'type',
        'status',
        'created_by',
        'modified_by',
    ];

    protected function casts(): array
    {
        return [
            'datetime'   => 'datetime',
            'headline'   => 'boolean',
            'type'       => 'integer',
            'status'     => 'integer',
            'pewarta_id' => 'integer',

        ];
    }

    public function writer(): BelongsTo
    {
        return $this->belongsTo(WriterBerbayar::class, 'pewarta_id');
    }

    public function newsNasional()
    {
        return $this->hasOne(NewsNasional::class, 'is_code', 'is_code');
    }
}
