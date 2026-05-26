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
}
