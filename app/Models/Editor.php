<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Editor extends Model
{
    protected $table = 'editors';

    protected $fillable = ['name', 'user_id', 'id_ti', 'id_daerah', 'status'];

    public function daerah()
    {
        return $this->belongsTo(EditorDaerah::class, 'id_daerah');
    }

    public function nasional()
    {
        return $this->belongsTo(EditorNasional::class, 'id_ti', 'editor_id');
    }
}
