<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

/**
 * Export yang gagal harus tetap bersuara.
 *
 * Tanpa ini, job yang mati di tengah rantai tidak meninggalkan jejak apa pun bagi
 * pengguna: tombol bilang "sedang diproses", lalu lonceng diam selamanya dan tidak
 * ada cara membedakannya dari antrean yang memang lambat.
 */
class ExportFailedNotification extends Notification
{
    use Queueable;

    public function __construct(protected string $fileName, protected string $alasan = '') {}

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    private function isi(): array
    {
        return [
            'title'       => 'Export Excel Gagal',
            'message'     => 'Laporan "' . $this->fileName . '" gagal dibuat'
                . ($this->alasan !== '' ? ': ' . $this->alasan : '') . '. Silakan coba lagi.',
            'url'         => null,
            'is_download' => false,
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
