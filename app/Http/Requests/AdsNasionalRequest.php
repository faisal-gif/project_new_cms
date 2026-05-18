<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdsNasionalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Deteksi apakah ini request untuk Update (PUT/PATCH) atau Create (POST)
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'title'     => ['required', 'string', 'max:100'],
            'datestart' => ['required', 'date'],
            'dateend'   => ['required', 'date', 'after_or_equal:datestart'],
            'url'       => ['required', 'url', 'max:255'],
            'cpc'       => ['required', 'numeric', 'min:0'],
            'cost'      => ['required', 'numeric', 'min:0'],
            'status'    => ['required', 'in:0,1'],
            
            // Validasi Format Tampilan (Payload baru dari UI)
            'd_format'  => ['nullable', 'string', 'in:banner,box'],
            'm_format'  => ['nullable', 'string', 'in:banner,box'],

            // Validasi Gambar Dinamis: 
            // - Wajib saat Create JIKA lokasinya dipilih
            // - Opsional/Nullable saat Update (karena bisa menggunakan gambar lama)
            'd_img'     => [
                $isUpdate ? 'nullable' : 'required_with:locate_desktop', 
                'image', 
                'mimes:jpeg,png,jpg,webp', 
                'max:2048'
            ],
            'm_img'     => [
                $isUpdate ? 'nullable' : 'required_with:locate_mobile', 
                'image', 
                'mimes:jpeg,png,jpg,webp', 
                'max:2048'
            ],

            // Validasi Lokasi: Setidaknya salah satu platform harus dipilih
            'locate_desktop'   => ['array', 'nullable', 'required_without:locate_mobile'],
            'locate_desktop.*' => ['integer'],
            
            'locate_mobile'    => ['array', 'nullable', 'required_without:locate_desktop'],
            'locate_mobile.*'  => ['integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'locate_desktop.required_without' => 'Pilih setidaknya satu lokasi tayang untuk Desktop atau Mobile.',
            'locate_mobile.required_without'  => 'Pilih setidaknya satu lokasi tayang untuk Desktop atau Mobile.',
            'd_img.required_with'             => 'Gambar Desktop wajib diunggah untuk kampanye baru jika lokasi Desktop dipilih.',
            'm_img.required_with'             => 'Gambar Mobile wajib diunggah untuk kampanye baru jika lokasi Mobile dipilih.',
            'dateend.after_or_equal'          => 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.',
        ];
    }
}