<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsNasionalFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Ubah menjadi true agar request ini diizinkan lewat
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'status'          => 'required',
            'editor'          => 'required',
            'writer_id'       => 'nullable',
            'writer'          => 'nullable',
            'title'           => 'required|string|max:255',
            'description'     => 'required|string|max:255',
            'tag'             => 'nullable|array',
            'is_content'      => 'required|string',
            'is_headline'     => 'nullable|in:0,1,true,false',
            'image_watermark' => 'nullable|boolean',
            'image_caption'   => 'nullable|string|max:255',
            'datepub'         => 'required|date',
            'locus'           => 'nullable|string|max:255',
            'focus'           => 'nullable',
            'kanal'           => 'required',
            'affiliate_link'  => 'nullable|url',
            // Diisi bila memilih foto dari galeri CDN (alternatif upload file).
            'image_thumbnail_url' => 'nullable|url',
            // Nama file wajib saat mengunggah file (agar mudah dicari di galeri CDN).
            'image_name' => 'required_with:image_thumbnail|nullable|string|max:100',
        ];

        // Create (POST): wajib ada gambar — boleh dari file ATAU dari galeri CDN.
        // Update (PUT/PATCH): opsional (pertahankan gambar lama bila kosong).
        if ($this->isMethod('post')) {
            $rules['image_thumbnail'] = 'required_without:image_thumbnail_url|nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048';
        } else {
            $rules['image_thumbnail'] = 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048';
        }

        return $rules;
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
            'affiliate_link.url'         => 'Link affiliate harus berupa URL yang valid.',
            'image_thumbnail.required_without' => 'Gambar thumbnail wajib diunggah atau dipilih dari galeri CDN.',
            'image_thumbnail.image'    => 'File yang diunggah harus berupa gambar.',
            'image_thumbnail_url.url'  => 'Foto galeri yang dipilih tidak valid.',
            'image_name.required_with' => 'Nama file foto wajib diisi saat mengunggah gambar.',
            'image_name.max'           => 'Nama file foto maksimal 100 karakter.',
            'image_thumbnail.mimes'    => 'Format gambar tidak valid. Harus berupa JPEG, PNG, JPG, GIF, atau SVG.',
            'image_thumbnail.max'      => 'Ukuran gambar tidak boleh lebih dari 2MB.',
            'image_caption.max'        => 'Caption gambar tidak boleh lebih dari 255 karakter.',
            'tag.array'                => 'Format tag tidak valid.',

        ];
    }
}
