<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ExportReadyNotification extends Notification
{
    use Queueable;

    protected $fileName;

    public function __construct($fileName)
    {
        $this->fileName = $fileName;
    }

   public function via($notifiable)
    {
        // 2. Tambahkan 'broadcast' ke dalam array
        return ['database', 'broadcast']; 
    }

    public function toArray($notifiable)
    {
        return [
            'title'   => 'Laporan Excel Selesai',
            'message' => 'Laporan data berita yang Anda minta sudah siap.',
            'url'     => '/storage/exports/' . $this->fileName,
            
            'is_download' => true // <-- INI KUNCI PEMBEDANYA
        ];
    }

    // 3. Tambahkan fungsi ini untuk format pengiriman Real-Time
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title'   => 'Laporan Excel Selesai',
            'message' => 'Laporan data berita yang Anda minta sudah siap.',
            'url'     => '/storage/exports/' . $this->fileName,
            'is_download' => true // <-- INI KUNCI PEMBEDANYA
        ]);
    }
}