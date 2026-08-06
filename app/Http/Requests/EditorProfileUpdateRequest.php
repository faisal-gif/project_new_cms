<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EditorProfileUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'alias'       => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'no_whatsapp' => 'nullable|string|max:20',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'    => 'Nama editor wajib diisi.',
            'name.max'         => 'Nama tidak boleh lebih dari 255 karakter.',
            'image.image'      => 'File harus berupa gambar.',
            'image.mimes'      => 'Format gambar harus JPEG, PNG, JPG, GIF, atau SVG.',
            'image.max'        => 'Ukuran gambar tidak boleh lebih dari 2MB.',
            'no_whatsapp.max'  => 'Nomor WhatsApp tidak boleh lebih dari 20 karakter.',
        ];
    }
}
