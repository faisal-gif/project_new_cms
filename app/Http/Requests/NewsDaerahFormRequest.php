<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsDaerahFormRequest extends FormRequest
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
            // Data Dasar
            'is_code'       => ['nullable', 'string', 'max:50'],
            'title'         => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'is_content'    => ['required', 'string'],

            // Relasi Dropdown (Menggunakan exists dengan koneksi mysql_daerah)
            'writer'        => ['required', 'integer', 'exists:mysql_daerah.writers,id'],
            'editor'        => ['required', 'integer', 'exists:mysql_daerah.editors,id'],
            'kanal'         => ['required', 'integer', 'exists:mysql_daerah.news_cat,id'],
            'focus'         => ['required', 'integer', 'exists:mysql_daerah.news_fokus,id'],
            'locus'         => ['nullable', 'string', 'max:255'], // Asumsi locus masih input string biasa

            // Multiple Select (Arrays)
            'tag'           => ['nullable', 'array'],
            'tag.*'         => ['string', 'max:100'],

            'network'       => ['nullable', 'array'],
            'network.*'     => ['integer'], // Nanti bisa ditambah exists jika ada tabel networks

            // Status & Flags
            'status'        => ['required', 'in:0,1,2,3'],
            'pin'           => ['nullable', 'boolean'],
            'is_headline'   => ['nullable', 'boolean'],
            'is_editorial'  => ['nullable', 'boolean'],
            'is_adv'        => ['nullable', 'boolean'],

            // SEO & Publishing
            'keyword_tool'  => ['nullable', 'string', 'max:255'],
            'datepub'       => ['nullable', 'date'],

            // Gambar
            'image_1'       => ['nullable', 'string'],
            'image_2'       => ['nullable', 'string'],
            'image_3'       => ['nullable', 'string'],
            'image_caption' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'      => 'Judul berita wajib diisi.',
            'is_content.required' => 'Isi konten berita wajib diisi.',
            'writer.required'     => 'Penulis wajib dipilih.',
            'writer.exists'       => 'Penulis yang dipilih tidak valid di database daerah.',
            'editor.exists'       => 'Editor yang dipilih tidak valid.',
            'kanal.exists'        => 'Kanal yang dipilih tidak ditemukan.',
            'focus.exists'        => 'Fokus berita yang dipilih tidak ditemukan.',
            'status.required'     => 'Status berita wajib ditentukan.',
            'image_1.image'       => 'File pertama harus berupa gambar.',
            'image_1.max'         => 'Ukuran gambar pertama maksimal 2MB.',
        ];
    }
}
