<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KanalFormRequest extends FormRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Ambil ID user kalau ada (PUT), kalau POST maka null → aman
        $kanal = $this->route('kanal');
        $kanalId = is_object($kanal) ? $kanal->id : $kanal;

        return [
            'name' => 'required|string|max:100',
            'slug' => 'required|unique:news_cat,slug,' . $kanalId . '|string',
            'keyword' => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'status' => 'required|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Judul wajib diisi',
            'slug.unique' => 'Slug sudah didaftarkan',
            'keyword.required' => 'Keyword wajib diisi',
            'keyword.max' => 'Keyword maksimal 255 karakter',
            'description.required' => 'Deskripsi Wajib dipilih',
            'description.max' => 'Deskripsi maksimal 500 karakter',
            'status.required' => 'Status Wajib dipilih'
        ];
    }
}
