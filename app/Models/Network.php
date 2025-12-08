<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Network extends Model
{
    protected $table = 'network';

    protected $fillable = ['name', 'domain', 'slug', 'title', 'tagline', 'description', 'keyword', 'logo', 'logo_m', 'img_socmed', 'analytics', 'gverify', 'fb', 'tw', 'ig', 'yt', 'gp', 'is_main', 'is_web', 'status'];

    public function adsDaerah()
    {
        return $this->belongsToMany(AdsDaerah::class, 'ads_network', 'net_id', 'ads_id');
    }
}
