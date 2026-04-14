<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GalleryRequest extends FormRequest
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
            'categoryId'    => ['required', 'integer'],
            'subtitle'      => ['nullable', 'string', 'max:255'],
            'description'   => ['nullable', 'string', 'max:255'],
            'content'       => ['nullable', 'string'],
            'city'          => ['nullable', 'string', 'max:255'],
            'fotografer'    => ['required'],
            'fotografer_id' => ['required'], // Hilangkan dulu validasi exists jika database berbeda koneksi/skema
            'editor'        => ['required'],
            'status'        => ['required', 'in:0,1,2,3,4'],
            'datepub'       => ['required', 'date'],
        ];

        // 1. Logika untuk UPDATE (Method PUT/PATCH)
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['deleted_images']                  = ['nullable', 'array'];

            // Tambahkan ini agar tidak di-strip oleh Laravel
            $rules['existing_images_meta']            = ['nullable', 'array'];
            $rules['existing_images_meta.*.id']       = ['required_with:existing_images_meta', 'integer'];
            $rules['existing_images_meta.*.caption']  = ['nullable', 'string', 'max:255'];
            $rules['existing_images_meta.*.is_cover'] = ['nullable', 'boolean']; // <-- Wajib ada

            $rules['new_images']                      = ['nullable', 'array'];
            $rules['new_images.*.file']               = ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'];
            $rules['new_images.*.caption']            = ['nullable', 'string', 'max:255'];
            $rules['new_images.*.is_cover']           = ['nullable', 'boolean']; // <-- Wajib ada
        }
        // 2. Logika untuk CREATE (Method POST)
        else {
            $rules['gallery_images']               = ['required', 'array', 'min:1'];
            $rules['gallery_images.*.file']        = ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'];
            $rules['gallery_images.*.caption']     = ['nullable', 'string', 'max:255'];
            $rules['gallery_images.*.is_cover']    = ['required', 'boolean'];
        }

        return $rules;
    }

    /**
     * Kustomisasi pesan error agar lebih ramah pengguna (User Friendly)
     */
    public function messages(): array
    {
        return [
            'title.required'        => 'Judul galeri wajib diisi.',
            'categoryId.required'   => 'Kategori wajib dipilih.',
            'status.required'       => 'Status publikasi wajib ditentukan.',
            'fotografer.required'   => 'Fotografer wajib diisi.',
            'editor.required'       => 'Editor wajib diisi.',
            'datepub.required'      => 'Tanggal publikasi wajib diisi.',

            // Pesan saat Create
            'gallery_images.required' => 'Anda harus melampirkan setidaknya satu gambar.',
            'gallery_images.min'      => 'Minimal harus ada 1 gambar dalam galeri.',
            'gallery_images.*.file.required' => 'File gambar tidak boleh kosong.',
            'gallery_images.*.file.image'    => 'File yang diunggah harus berupa gambar.',
            'gallery_images.*.file.mimes'    => 'Format gambar harus berupa jpeg, png, jpg, atau webp.',
            'gallery_images.*.file.max'      => 'Ukuran gambar melebihi batas 5MB.',

            // Pesan saat Update (new_images)
            'new_images.*.file.required'     => 'File gambar baru tidak boleh kosong.',
            'new_images.*.file.image'        => 'File yang diunggah harus berupa gambar.',
            'new_images.*.file.mimes'        => 'Format gambar baru harus berupa jpeg, png, jpg, atau webp.',
            'new_images.*.file.max'          => 'Ukuran gambar baru melebihi batas 5MB.',
        ];
    }
}
