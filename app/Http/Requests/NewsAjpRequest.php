<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsAjpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Validasi Relasi
            'pewarta_id' => ['required', 'exists:mysql_berbayar.wartawan,id'], // Sesuaikan nama tabel Writer Anda

            // Validasi Konten Utama
            'title'      => ['required', 'string', 'max:255'],
            'content'    => ['required', 'string'],

            // Validasi File & Media — thumbnail boleh dari upload file ATAU pilih galeri CDN.
            'image'      => ['required_without:image_url', 'nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'], // Batasi 2MB untuk efisiensi CDN
            'image_url'  => ['nullable', 'url'], // Diisi bila memilih dari galeri CDN
            'image_name' => ['required_without:image_url', 'nullable', 'string', 'max:100'], // Nama file wajib saat upload agar mudah dicari
            'image_watermark' => ['nullable', 'boolean'],
            'caption'    => ['nullable', 'string', 'max:255'],

            // Validasi Data Ekstra (Narasumber & Lokasi)
            'narsum'     => ['nullable', 'string', 'max:255'],
            'profesi'    => ['nullable', 'string', 'max:255'],
            'contact'    => ['nullable', 'string', 'max:20'],
            'city'       => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Pesan kesalahan kustom (UX yang lebih baik untuk Frontend).
     */
    public function messages(): array
    {
        return [
            'pewarta_id.required' => 'Silakan pilih penulis (pewarta) terlebih dahulu.',
            'pewarta_id.exists'   => 'Data penulis tidak ditemukan di sistem.',
            'title.required'      => 'Judul berita wajib diisi.',
            'content.required'    => 'Isi berita tidak boleh kosong.',
            'image.required_without'      => 'Gambar thumbnail wajib diunggah atau dipilih dari galeri CDN.',
            'image.image'         => 'File harus berupa gambar (jpeg, png, jpg, webp).',
            'image.max'           => 'Ukuran gambar maksimal adalah 2MB.',
            'image_name.required_without' => 'Nama file foto wajib diisi saat mengunggah gambar.',
            'image_name.max'      => 'Nama file foto maksimal 100 karakter.',
        ];
    }
}
