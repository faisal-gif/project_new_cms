<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FokusNasionalFormRequest extends FormRequest
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
        // 1. Validasi dasar yang selalu sama untuk Create maupun Update
        $rules = [
            'name'        => 'required|string|max:100',
            'keyword'     => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'required|integer|in:0,1',
        ];

        // 2. Logika Dinamis untuk Validasi Gambar
        $imageFields = ['img_desktop_list', 'img_desktop_news', 'img_mobile'];

        foreach ($imageFields as $field) {
            if ($this->isMethod('POST')) {
                // Mode CREATE: Gambar wajib ada dan harus berupa file valid
                $rules[$field] = 'required|image|mimes:jpeg,png,jpg,webp|max:2048';
            } else {
                // Mode UPDATE (PUT / PATCH)
                if ($this->hasFile($field)) {
                    // Jika user mengunggah gambar baru, validasi dengan ketat
                    $rules[$field] = 'image|mimes:jpeg,png,jpg,webp|max:2048';
                } else {
                    // Jika tidak ada file baru (berupa string URL lama dari frontend atau null)
                    $rules[$field] = 'nullable|string';
                }
            }
        }

        return $rules;
    }

    /**
     * Custom messages untuk memberikan UX yang lebih baik saat error.
     */
    public function messages(): array
    {
        return [
            'name.required'             => 'Judul wajib diisi.',
            'name.max'                  => 'Judul maksimal 100 karakter.',
            'keyword.required'          => 'Keyword wajib diisi.',
            'status.required'           => 'Status publikasi wajib dipilih.',
            'status.in'                 => 'Pilihan status tidak valid.',
            
            // Pesan Error Gambar (Required untuk POST)
            'img_desktop_list.required' => 'Gambar Desktop List wajib diunggah.',
            'img_desktop_news.required' => 'Gambar Desktop News wajib diunggah.',
            'img_mobile.required'       => 'Gambar Mobile wajib diunggah.',

            // Pesan Error Gambar (Format/Ukuran)
            'img_desktop_list.image'    => 'File Desktop List harus berupa gambar.',
            'img_desktop_list.mimes'    => 'Format gambar Desktop List harus jpeg, png, jpg, atau webp.',
            'img_desktop_list.max'      => 'Ukuran gambar Desktop List tidak boleh lebih dari 2MB.',
            
            'img_desktop_news.image'    => 'File Desktop News harus berupa gambar.',
            'img_desktop_news.mimes'    => 'Format gambar Desktop News harus jpeg, png, jpg, atau webp.',
            'img_desktop_news.max'      => 'Ukuran gambar Desktop News tidak boleh lebih dari 2MB.',
            
            'img_mobile.image'          => 'File Mobile harus berupa gambar.',
            'img_mobile.mimes'          => 'Format gambar Mobile harus jpeg, png, jpg, atau webp.',
            'img_mobile.max'            => 'Ukuran gambar Mobile tidak boleh lebih dari 2MB.',
        ];
    }
}