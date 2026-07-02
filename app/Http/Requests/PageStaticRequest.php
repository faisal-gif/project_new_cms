<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PageStaticRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'keyword' => 'required|array',
            'keyword.*' => 'string|max:50',
            'isi' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama halaman wajib diisi.',
            'name.string' => 'Nama halaman harus berupa teks.',
            'name.max' => 'Nama halaman tidak boleh lebih dari 255 karakter.',
            'description.required' => 'Deskripsi halaman wajib diisi.',
            'description.string' => 'Deskripsi halaman harus berupa teks.',
            'description.max' => 'Deskripsi halaman tidak boleh lebih dari 255 karakter.',
            'keyword.required' => 'Tag wajib diisi.',
            'keyword.array' => 'Tag harus berupa array.',
            'keyword.*.string' => 'Setiap tag harus berupa teks.',
            'keyword.*.max' => 'Setiap tag tidak boleh lebih dari 50 karakter.',
            'isi.required' => 'Isi halaman wajib diisi.',
            'isi.string' => 'Isi halaman harus berupa teks.',
        ];
    }
}