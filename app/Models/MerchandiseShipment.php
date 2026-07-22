<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchandiseShipment extends Model
{
    protected $connection = 'mysql_berbayar';
    protected $table = 'merchandise_shipments';
    protected $fillable = [
        'user_id',
        'payment_id',
        'item_name',
        'shipping_address',
        'status',
        'tracking_number'
    ];

    public function member()
    {
        return $this->belongsTo(WriterBerbayar::class, 'user_id'); // Atau menyesuaikan nama model Wartawan-mu
    }

    public function payment()
    {
        return $this->belongsTo(PaymentsNewsBerbayar::class, 'payment_id');
    }
}
