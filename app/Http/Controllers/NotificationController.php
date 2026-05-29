<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function clear(Request $request)
    {
        // Menghapus semua notifikasi milik user yang sedang login secara permanen
        $request->user()->notifications()->delete();

        // Jika Anda hanya ingin 'menandai sudah dibaca' tanpa menghapus dari database,
        // gunakan: $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    public function open($id)
    {
        // Cari notifikasi berdasarkan ID milik user yang sedang login
        $notification = auth()->user()->notifications()->findOrFail($id);

        // Tandai sudah dibaca (Otomatis hilang dari kueri unreadNotifications)
        $notification->markAsRead();

        // Alihkan editor langsung ke URL tujuan berita atau unduhan excel
        return redirect($notification->data['url']);
    }

    public function markAsRead($id)
    {
        // Tandai sudah dibaca
        auth()->user()->notifications()->findOrFail($id)->markAsRead();

        // Kembalikan ke halaman yang sama (Inertia akan otomatis memperbarui prop data)
        return back();
    }
}
