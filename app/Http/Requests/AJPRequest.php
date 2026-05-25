<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AJPRequest extends FormRequest
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
            'publisher' => 'required',
            'id' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'publisher.required' => 'Publisher wajib di pilih',
            'id.required' => 'ID wajib diisi',
        ];
    }
}
