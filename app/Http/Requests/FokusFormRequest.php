<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FokusFormRequest extends FormRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'keyword' => 'required|string',
            'description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Judul wajib diisi',
            'keyword.required' => 'Keyword wajib diisi',
        ];
    }
}
