<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

/**
 * Berita AJP / Kopi TIMES berstatus Pending (status = 0) yang baru masuk dan
 * menunggu disunting redaksi.
 *
 * Dipicu dari perintah terjadwal, bukan dari controller: 1.871 dari 1.890 baris
 * pending ditulis aplikasi publik langsung ke mysql_berbayar (created_by NULL),
 * jadi CMS tidak pernah tahu lewat jalur HTTP-nya sendiri.
 */
class BeritaBerbayarMasukNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected string $situs,
        protected int $newsId,
        protected string $judul,
        protected string $pewarta,
        protected ?string $url = null,
    ) {}

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    private function isi(): array
    {
        return [
            'title'       => 'Berita ' . $this->situs . ' Perlu Disunting',
            'message'     => $this->pewarta . ' mengirim: ' . $this->judul,
            'url'         => $this->url,
            'is_download' => false,
            'situs'       => $this->situs,
            'news_id'     => $this->newsId,
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
