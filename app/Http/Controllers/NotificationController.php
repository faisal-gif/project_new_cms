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
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        // Notifikasi kegagalan export tidak punya tujuan — tanpa penjagaan ini
        // redirect(null) melempar pengguna ke halaman kosong.
        $url = $notification->data['url'] ?? null;

        if (blank($url)) {
            return back()->with('success', 'Notifikasi sudah dibaca.');
        }

        return redirect($url)->with('success', 'Notifikasi sudah dibaca. Anda dialihkan ke halaman tujuan.');
    }

    public function markAsRead($id)
    {
        // Tandai sudah dibaca
        auth()->user()->notifications()->findOrFail($id)->markAsRead();

        // Kembalikan ke halaman yang sama (Inertia akan otomatis memperbarui prop data)
        return back();
    }
}
