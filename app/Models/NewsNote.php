<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsNote extends Model
{
    protected $fillable = [
        'news_id',
        'user_id',
        'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function news()
    {
        return $this->belongsTo(News::class);
    }
}
