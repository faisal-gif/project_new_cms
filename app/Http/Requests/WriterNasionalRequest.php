<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WriterNasionalRequest extends FormRequest
{
  /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Pastikan mengembalikan true agar request diizinkan
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
            'name'      => ['required', 'string', 'max:255'],
            'region'    => ['required', 'string', 'max:255'],
            'bio'       => ['nullable', 'string', 'max:255'], // Sesuai dengan maxLength={255} di React
            'date_join' => ['required', 'date'],
            'type'      => ['required', 'in:1,2'],
            'status'    => ['required', 'in:0,1'], // Hanya menerima 0 (Inactive) atau 1 (Active)
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
            'name.required'      => 'Nama penulis wajib diisi.',
            'region.required'    => 'Wilayah wajib diisi.',
            'date_join.required' => 'Tanggal bergabung wajib ditentukan.',
            'status.required'    => 'Status wajib dipilih.',
            
            'image.required'     => 'Foto penulis wajib diunggah.',
            'image.image'        => 'File harus berupa gambar.',
            'image.mimes'        => 'Format gambar harus JPG, JPEG, PNG, atau WEBP.',
            'image.max'          => 'Ukuran gambar tidak boleh lebih dari 2MB.',
        ];
    }
}
