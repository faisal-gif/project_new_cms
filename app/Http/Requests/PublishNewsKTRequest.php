<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublishNewsKTRequest extends FormRequest
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
            'is_code'         => 'required|string',
            'status'          => 'required',
            'editor'          => 'required',
            'title'           => 'required|string|max:255',
            'kanal'           => 'required',
            'description'     => 'required|string|max:255',
            'tag'             => 'nullable|array',
            'is_content'      => 'required|string',
            // Thumbnail opsional: kosong berarti pakai gambar bawaan dari berita KT.
            // Tiga jalur — upload file, pilih galeri CDN (URL final), atau tempel URL sumber.
            'image_thumbnail'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_thumbnail_url'      => 'nullable|url',
            'image_thumbnail_from_url' => 'nullable|url',
            'image_watermark' => 'nullable|boolean',
            'image_caption'   => 'required|string|max:255',
            'datepub'         => 'required|date',
            'locus'           => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'editor.required'          => 'Editor wajib dipilih.',
            'writer.required'          => 'Penulis wajib dipilih.',
            'title.required'           => 'Judul berita wajib diisi.',
            'title.max'                => 'Judul berita tidak boleh lebih dari 255 karakter.',
            'description.required'     => 'Deskripsi berita wajib diisi.',
            'description.max'          => 'Deskripsi tidak boleh lebih dari 255 karakter.',
            'is_content.required'      => 'Konten atau isi berita wajib diisi.',
            'datepub.required'         => 'Tanggal publish wajib ditentukan.',
            'datepub.date'             => 'Format tanggal publish tidak valid.',
            'kanal.required'           => 'Kanal berita wajib dipilih.',
            'image_thumbnail.required' => 'Gambar thumbnail wajib diunggah.',
            'image_thumbnail_url.url'      => 'Gambar dari galeri CDN harus berupa URL yang valid.',
            'image_thumbnail_from_url.url' => 'URL gambar tidak valid (harus diawali http/https).',
            'image_thumbnail.image' => 'File yang diunggah harus berupa gambar.',
            'image_thumbnail.mimes' => 'Format gambar harus jpeg, png, jpg, atau webp.',
            'image_thumbnail.max'   => 'Ukuran gambar maksimal adalah 2MB.',
            'image_caption.max'        => 'Caption gambar tidak boleh lebih dari 255 karakter.',
            'tag.array'                => 'Format tag tidak valid.',
        ];
    }
}
