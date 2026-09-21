<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsKTRequest extends FormRequest
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
        // Request ini melayani DUA form yang isinya berbeda jauh:
        //   POST (Create.jsx -> store)  : admin menginput berita titipan pewarta.
        //   PUT  (Edit.jsx  -> update)  : redaksi melengkapi & menyunting sebelum publish.
        // Sebelumnya keduanya dipaksa memakai satu set aturan milik Edit, sehingga Create
        // selalu ditolak (editor_id/description/tags wajib padahal tak pernah dikirim) dan
        // pewarta_id tidak ikut validated() padahal store() membacanya.
        if ($this->isMethod('post')) {
            return [
                'pewarta_id'      => 'required|integer',
                'title'           => 'required|string|max:255',
                'content'         => 'required|string',
                'image'           => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
                'image_watermark' => 'sometimes|boolean',
                'caption'         => 'nullable|string',
                'city'            => 'required|string',
                'narsum'          => 'nullable|string|max:255',
                'profesi'         => 'nullable|string|max:255',
                'contact'         => 'nullable|string|max:50',
            ];
        }

        // 'type' dan 'status' sengaja TIDAK divalidasi: store()/update() menentukannya sendiri,
        // dan membiarkannya lolos berarti request buatan tangan bisa mengubah keduanya.
        // Tiga field image_* di bawah BUKAN kolom tabel — update() menerjemahkannya jadi
        // kolom 'image' lalu membuangnya sebelum mass-assign.
        return [
            'is_code'     => 'sometimes|string',
            'editor_id'   => 'required|integer',
            'datepub'     => 'sometimes',
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'description' => 'required|string',
            'tags'        => 'required|array', // InputTag mengirim array of string
            'caption'     => 'nullable|string',
            'headline'    => 'sometimes|boolean',
            'city'        => 'required|string',
            'image_thumbnail'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_thumbnail_url'      => 'nullable|url',
            'image_thumbnail_from_url' => 'nullable|url',
            'image_watermark'          => 'sometimes|boolean',
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
            'pewarta_id.required'   => 'Penulis wajib dipilih.',
            'pewarta_id.integer'    => 'Penulis yang dipilih tidak valid.',
            'editor_id.required'    => 'Editor wajib dipilih.',
            'editor_id.integer'     => 'Editor yang dipilih tidak valid.',
            'title.required'        => 'Judul berita wajib diisi.',
            'title.max'             => 'Judul berita tidak boleh lebih dari 255 karakter.',
            'content.required'      => 'Konten atau isi berita wajib diisi.',
            'description.required'  => 'Deskripsi berita wajib diisi.',
            'tags.required'         => 'Tag wajib diisi minimal satu.',
            'tags.array'            => 'Format tag tidak valid.',
            'city.required'         => 'Kota (locus) wajib diisi.',
            'caption.string'        => 'Caption gambar tidak valid.',
            'headline.boolean'      => 'Nilai headline tidak valid.',
            'image.image'           => 'File yang diunggah harus berupa gambar.',
            'image.mimes'           => 'Format gambar harus jpeg, png, jpg, atau webp.',
            'image.max'             => 'Ukuran gambar tidak boleh lebih dari 2MB.',
            'image_thumbnail.image'  => 'File yang diunggah harus berupa gambar.',
            'image_thumbnail.mimes'  => 'Format gambar harus jpeg, png, jpg, atau webp.',
            'image_thumbnail.max'    => 'Ukuran gambar tidak boleh lebih dari 2MB.',
            'image_thumbnail_url.url'      => 'Gambar dari galeri CDN harus berupa URL yang valid.',
            'image_thumbnail_from_url.url' => 'URL gambar tidak valid (harus diawali http/https).',
            'image_watermark.boolean' => 'Nilai watermark tidak valid.',
            'narsum.max'            => 'Nama narasumber maksimal 255 karakter.',
            'profesi.max'           => 'Profesi narasumber maksimal 255 karakter.',
            'contact.max'           => 'Kontak narasumber maksimal 50 karakter.',
        ];
    }
}
