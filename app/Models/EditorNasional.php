<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EditorNasional extends Model
{
    protected $connection = 'mysql_nasional';
    protected $table = 'editor';

    protected $fillable = ['editor_name', 'editor_alias', 'editor_image', 'editor_description', 'status', 'created_by'];

    const CREATED_AT = 'created';
    const UPDATED_AT = 'modified';
}
