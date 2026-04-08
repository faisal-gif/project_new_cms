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
            'status'          => 'nullable',
            'editor'          => 'required',
            'writer_id'       => 'required',
            'writer'          => 'required',
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
        ];

        // Jika request adalah create (POST), gambar wajib. Jika update (PUT/PATCH), gambar opsional.
        if ($this->isMethod('post')) {
            $rules['image_thumbnail'] = 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048';
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
            'image_thumbnail.required' => 'Gambar thumbnail wajib diunggah.',
            'image_thumbnail.image'    => 'File yang diunggah harus berupa gambar.',
            'image_thumbnail.mimes'    => 'Format gambar tidak valid. Harus berupa JPEG, PNG, JPG, GIF, atau SVG.',
            'image_thumbnail.max'      => 'Ukuran gambar tidak boleh lebih dari 2MB.',
            'image_caption.max'        => 'Caption gambar tidak boleh lebih dari 255 karakter.',
            'tag.array'                => 'Format tag tidak valid.',

        ];
    }
}
