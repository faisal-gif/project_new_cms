<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsFormRequest extends FormRequest
{
    /**
     * Tentukan apakah user memiliki izin untuk melakukan request ini.
     */
    public function authorize(): bool
    {
        // Ubah ke true jika sudah ada sistem auth, 
        // atau sesuaikan dengan logic permission kamu
        return true;
    }

    /**
     * Aturan validasi yang berlaku untuk request ini.
     */
    public function rules(): array
    {
        return [
            'writer'        => 'required|exists:writers,id', // Asumsi table users atau table writers
            'judul'         => 'required|string|max:255',
            'description'   => 'required|string|max:255',
            'tag'           => 'required|array|min:1',
            'tag.*'         => 'string',
            'content'       => 'required|string',

            // Validasi Gambar
            'image_thumbnail'       => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB
            'image_watermark'       => 'required|boolean',
            'image_caption' => 'required|string|max:255',
        ];
    }

    /**
     * Pesan kustom untuk error validasi (Opsional).
     */
    public function messages(): array
    {
        return [
            'writer.required'    => 'Penulis harus dipilih.',
            'judul.required'     => 'Judul berita tidak boleh kosong.',
            'image_1.required'   => 'Gambar utama (Image 1) wajib diunggah.',
            'image_1.image'      => 'File harus berupa gambar.',
            'tag.required'       => 'Minimal masukkan satu tag.',
            'image_caption.required' => 'Caption gambar harus diisi.',
        ];
    }
}
