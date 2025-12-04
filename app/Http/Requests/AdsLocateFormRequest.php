<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdsLocateFormRequest extends FormRequest
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
            'type' => 'required|in:d,m,t',
            'status' => 'required|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Judul wajib diisi',
            'type.required' => 'Type wajib dipilih',
            'status.required' => 'Status Wajib dipilih'
        ];
    }
}
