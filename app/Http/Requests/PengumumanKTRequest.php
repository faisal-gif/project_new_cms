<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PengumumanKTRequest extends FormRequest
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
        return [
            'title'      => 'required|string|max:255',
            'content'    => 'required|string',
            'kategori'   => 'required|in:urgent,info',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'is_active'  => 'boolean',
        ];
    }

   public function messages(): array
    {
        return [
            'title.required'          => 'Judul pengumuman wajib diisi.',
            'title.string'            => 'Judul pengumuman harus berupa teks.',
            'title.max'               => 'Judul pengumuman maksimal terdiri dari 255 karakter.',
            'content.required'        => 'Isi pengumuman wajib diisi.',
            'content.string'          => 'Isi pengumuman harus berupa teks.',
            'kategori.required'       => 'Kategori pengumuman wajib dipilih.',
            'kategori.in'             => 'Kategori yang dipilih tidak valid (pilih: urgent atau info).',
            'start_date.date'         => 'Format waktu mulai tayang tidak valid.',
            'end_date.date'           => 'Format waktu selesai tayang tidak valid.',
            'end_date.after_or_equal' => 'Waktu selesai tayang tidak boleh lebih cepat dari waktu mulai tayang.',
            'is_active.boolean'       => 'Status aktif harus berupa boolean (benar/salah).',
        ];
    }
}
