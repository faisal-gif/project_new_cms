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
        $rules = [
            'title'         => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'is_content'    => ['required', 'string'],
            'writer'        => ['required', 'exists:mysql_daerah.writers,id'],
            'editor'        => ['required', 'exists:mysql_daerah.editors,id'],
            'kanal'         => ['required', 'exists:mysql_daerah.news_cat,id'],
            'focus'         => ['nullable', 'exists:mysql_daerah.news_fokus,id'],
            'locus'         => ['required', 'string', 'max:255'],
            'tag'           => ['nullable', 'array'],
            'tag.*'         => ['string', 'max:100'],
            'network'       => ['nullable', 'array'],
            'network.*'     => ['integer'],
            'status'        => ['required', 'in:0,1,2,3'],
            'pin'           => ['nullable', 'boolean'],
            'is_headline'   => ['nullable', 'boolean'],
            'is_editorial'  => ['nullable', 'boolean'],
            'is_adv'        => ['nullable', 'boolean'],
            'keyword_tool'  => ['nullable', 'string', 'max:255'],
            'datepub'       => ['required', 'date'],
            'image_watermark' => ['nullable', 'boolean'],
            'image_caption'   => ['required', 'string', 'max:255'],
        ];

        // Cek jika request adalah create (POST), gambar wajib. Jika update (PUT/PATCH), gambar opsional.
        if ($this->isMethod('post')) {
            $rules['image_thumbnail'] = ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'];
        } else {
            $rules['image_thumbnail'] = ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'writer.required'     => 'Penulis wajib dipilih.',
            'editor.required'     => 'Editor wajib dipilih.',
            'kanal.required'      => 'Kanal wajib dipilih.',
            'focus.nullable'      => 'Fokus berita bersifat opsional.',
            'locus.required'      => 'Locus wajib diisi.',
            'datepub.required'    => 'Tanggal publikasi wajib diisi.',
            'title.required'      => 'Judul berita wajib diisi.',
            'is_content.required' => 'Isi konten berita wajib diisi.',
            'writer.required'     => 'Penulis wajib dipilih.',
            'writer.exists'       => 'Penulis yang dipilih tidak valid di database daerah.',
            'editor.exists'       => 'Editor yang dipilih tidak valid.',
            'kanal.exists'        => 'Kanal yang dipilih tidak ditemukan.',
            'focus.exists'        => 'Fokus berita yang dipilih tidak ditemukan.',
            'status.required'     => 'Status berita wajib ditentukan.',
            'image.required'      => 'Gambar wajib diunggah.',
            'image.image'         => 'File yang diunggah harus berupa gambar.',
            'image.mimes'         => 'Format gambar tidak valid. Harus berupa JPEG, PNG, JPG, GIF, atau SVG.',
            'image.max'           => 'Ukuran gambar tidak boleh lebih dari 2MB.',
        ];
    }
}
