<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NetworkFormRequest extends FormRequest
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
        $network = $this->route('network');
        $networkId = is_object($network) ? $network->id : $network;

        // 1. Aturan Statis untuk Data Teks & Relasional
        $rules = [
            'name'        => ['required', 'string', 'max:100'],
            'domain'      => [
                'required',
                'string',
                'max:255',
                Rule::unique('mysql_daerah.network', 'domain')->ignore($networkId),
            ],
            'title'       => ['required', 'string', 'max:255'],
            'tagline'     => ['required', 'string', 'max:255'],
            'keyword'     => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:500'],
            
            // Opsional: Sosial Media & Analytics diubah menjadi nullable agar lebih fleksibel
            'analytics'   => ['nullable', 'string', 'max:255'],
            'gverify'     => ['nullable', 'string', 'max:255'],
            'fb'          => ['nullable', 'string', 'max:255'],
            'tw'          => ['nullable', 'string', 'max:255'],
            'ig'          => ['nullable', 'string', 'max:255'],
            'yt'          => ['nullable', 'string', 'max:255'],
            'gp'          => ['nullable', 'string', 'max:255'],
            
            // Konfigurasi Web
            'is_main'     => ['required', Rule::in([0, 1])],
            'status'      => ['required', Rule::in([0, 1])],
            'is_web'      => ['required', Rule::in([0, 1])],
        ];

        // 2. Validasi Dinamis untuk Aset Gambar
        $imageFields = ['logo', 'logo_m', 'img_socmed'];

        foreach ($imageFields as $field) {
            if ($this->isMethod('POST')) {
                // Mode CREATE: Wajib diisi dan harus berupa file gambar
                $rules[$field] = ['required', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'];
            } else {
                // Mode UPDATE (PUT / PATCH)
                if ($this->hasFile($field)) {
                    // Jika user mengganti gambar
                    $rules[$field] = ['image', 'mimes:jpeg,png,jpg,webp,svg', 'max:2048'];
                } else {
                    // Jika user tidak mengganti gambar (nilai dari frontend berupa string URL)
                    $rules[$field] = ['nullable', 'string'];
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
            'name.required'             => 'Nama wajib diisi.',
            'domain.required'           => 'Domain wajib diisi.',
            'domain.unique'             => 'Domain ini sudah didaftarkan pada network lain.',
            'title.required'            => 'Judul wajib diisi.',
            'tagline.required'          => 'Tagline wajib diisi.',
            'keyword.required'          => 'Keyword wajib diisi.',
            'description.required'      => 'Deskripsi wajib diisi.',
            
            'is_main.required'          => 'Status Main Web wajib dipilih.',
            'is_main.in'                => 'Pilihan Main Web tidak valid.',
            'status.required'           => 'Status wajib dipilih.',
            'status.in'                 => 'Pilihan Status tidak valid.',
            'is_web.required'           => 'Status Web wajib dipilih.',
            'is_web.in'                 => 'Pilihan Status Web tidak valid.',
            
            // Pesan validasi khusus gambar
            'logo.required'             => 'Logo untuk desktop wajib diunggah.',
            'logo.image'                => 'Format file Logo Desktop tidak valid.',
            'logo_m.required'           => 'Logo untuk mobile wajib diunggah.',
            'logo_m.image'              => 'Format file Logo Mobile tidak valid.',
            'img_socmed.required'       => 'Image Open Graph (Sosmed) wajib diunggah.',
            'img_socmed.image'          => 'Format file Image Sosmed tidak valid.',
        ];
    }
}