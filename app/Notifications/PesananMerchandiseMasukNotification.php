<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

/**
 * Pesanan merchandise baru di merchandise_shipments (mysql_berbayar).
 *
 * Sama seperti berita berbayar, barisnya ditulis aplikasi publik — controller
 * merchandise di CMS hanya membaca dan mengubah status pengiriman.
 */
class PesananMerchandiseMasukNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected string $situs,
        protected int $shipmentId,
        protected string $item,
        protected string $pemesan,
        protected ?string $url = null,
    ) {}

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    private function isi(): array
    {
        return [
            'title'       => 'Pesanan Merchandise ' . $this->situs,
            'message'     => $this->pemesan . ' memesan: ' . $this->item,
            'url'         => $this->url,
            'is_download' => false,
            'situs'       => $this->situs,
            'shipment_id' => $this->shipmentId,
        ];
    }

    public function toArray($notifiable)
    {
        return $this->isi();
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->isi());
    }
}
