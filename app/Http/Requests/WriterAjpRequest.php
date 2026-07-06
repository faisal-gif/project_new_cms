<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WriterAjpRequest extends FormRequest
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
        $writerRoute = $this->route('writer');
        $writerId = is_object($writerRoute) ? $writerRoute->id : $writerRoute;

        $isCreate = empty($writerId);
        $requiresPackage = $isCreate || $this->boolean('is_update_package');

        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => [
                'required',
                'email',
                Rule::unique('mysql_berbayar.wartawan', 'email')->ignore($writerId)
            ],
            'password'   => [$isCreate ? 'required' : 'nullable', 'string', 'min:8'],
            
            'phone'      => ['nullable', 'string', 'max:20'],
            'instansi'   => ['nullable', 'string', 'max:255'],
            'provinsi'   => ['nullable', 'string', 'max:100'],
            'kota'       => ['nullable', 'string', 'max:100'],
            'alamat'     => ['nullable', 'string', 'max:500'],
            'status'     => ['required', 'boolean'],

            'is_update_package' => ['sometimes', 'boolean'],
            'is_accumulate'     => ['sometimes', 'boolean'],

            'paket_berita' => [
                $requiresPackage ? 'required' : 'nullable', 
                Rule::exists('mysql_berbayar.news_package', 'id')
            ],
            'quota_news' => [
                $requiresPackage ? 'required' : 'nullable', 
                'integer', 
                'min:0'
            ],
            'date_exp' => [
                $requiresPackage ? 'required' : 'nullable', 
                'date'
            ],
        ];
    }

    /**
     * Dapatkan pesan kesalahan kustom untuk aturan validasi yang ditentukan.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Pesan untuk Profil & Akun
            'name.required'     => 'Nama lengkap wajib diisi.',
            'name.max'          => 'Nama lengkap maksimal 255 karakter.',
            'email.required'    => 'Alamat email wajib diisi.',
            'email.email'       => 'Format alamat email tidak valid.',
            'email.unique'      => 'Email ini sudah terdaftar di sistem. Silakan gunakan email lain.',
            'password.required' => 'Password wajib diisi untuk pendaftaran penulis baru.',
            'password.min'      => 'Password harus terdiri dari minimal :min karakter.',
            'status.required'   => 'Status aktif/non-aktif wajib dipilih.',

            // Pesan untuk Informasi Detail
            'phone.max'         => 'Nomor telepon maksimal 20 karakter.',
            
            // Pesan untuk Paket Berita
            'paket_berita.required' => 'Silakan pilih paket berita terlebih dahulu.',
            'paket_berita.exists'   => 'Paket berita yang Anda pilih tidak valid atau tidak ditemukan.',
            
            'quota_news.required'   => 'Kuota berita wajib diisi karena Anda memilih untuk memperbarui paket.',
            'quota_news.integer'    => 'Kuota berita harus berupa angka bulat.',
            'quota_news.min'        => 'Kuota berita tidak boleh kurang dari 0.',
            
            'date_exp.required'     => 'Tanggal kadaluarsa wajib diisi karena Anda memilih untuk memperbarui paket.',
            'date_exp.date'         => 'Format tanggal kadaluarsa tidak valid.',
        ];
    }
}