<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EditorNasionalRequest extends FormRequest
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
        // 1. Aturan dasar yang berlaku untuk Create maupun Update
        $rules = [
            'name'              => ['required', 'string', 'max:255'],
            'description'       => ['nullable', 'string', 'max:255'], // Sesuai dengan maxLength={255} di React
            'status'            => ['required', 'in:0,1'], // Hanya menerima 0 (Inactive) atau 1 (Active)
        ];

        // 2. Logika khusus untuk validasi Gambar (Image)
        if ($this->isMethod('post')) {
            // Saat CREATE: Gambar biasanya wajib diunggah
            $rules['image'] = ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'];
        } else {
            // Saat UPDATE (PUT/PATCH): Gambar opsional. Jika tidak diunggah, pakai gambar lama
            $rules['image'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'];
        }

        return $rules;
    }

    /**
     * Kustomisasi pesan error agar lebih ramah pengguna (Opsional)
     */
    public function messages(): array
    {
        return [
            'name.required'      => 'Nama Editor wajib diisi.',
            'description.required'    => 'Deskripsi Editor wajib diisi.',
            'status.required'    => 'Status wajib dipilih.',

            'image.required'     => 'Foto editor wajib diunggah.',
            'image.image'        => 'File harus berupa gambar.',
            'image.mimes'        => 'Format gambar harus JPG, JPEG, PNG, atau WEBP.',
            'image.max'          => 'Ukuran gambar tidak boleh lebih dari 2MB.',
        ];
    }
}
