<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NewsNoteController extends Controller
{
    public function store(Request $request, News $news)
    {
        // 1. Validasi Input
        $request->validate([
            'content' => 'required|string|max:1000',
        ], [
            'content.required' => 'Catatan tidak boleh kosong.',
            'content.max' => 'Catatan maksimal 1000 karakter.'
        ]);

        // 2. Simpan Catatan
        $news->notes()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        // 3. Return Back
        // Menggunakan back() sangat ideal untuk Inertia, halaman tidak akan reload
        // namun data props (berita & notes) akan di-refresh secara otomatis di belakang layar.
        return back()->with('success', 'Catatan berhasil ditambahkan.');
    }
}
