<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewGalleryNotification extends Notification
{
    use Queueable;

    protected $galleryId;
    protected $galleryTitle;
    protected $pewarta;

    public function __construct($galleryId, $galleryTitle, $pewarta)
    {
        $this->galleryId = $galleryId;
        $this->galleryTitle = $galleryTitle;
        $this->pewarta = $pewarta;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable)
    {
        return [
            'title'       => 'Galeri Baru Masuk!',
            'message'     => ($this->pewarta ? "{$this->pewarta} membuat galeri: " : 'Galeri baru: ') . $this->galleryTitle,
            'url'         => route('admin.nasional.fotografi.edit', $this->galleryId),
            'is_download' => false,
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
