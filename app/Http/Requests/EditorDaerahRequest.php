<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EditorDaerahRequest extends FormRequest
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
        // 1. Aturan dasar yang berlaku untuk Create maupun Update
        $rules = [
            'name'              => ['required', 'string', 'max:255'],
            'id_ti'             => ['nullable', 'integer'], // Sesuai dengan maxLength={255} di React
            'no_whatsapp'       => ['nullable', 'string', 'max:13'],
            'status'            => ['required', 'in:0,1'], // Hanya menerima 0 (Inactive) atau 1 (Active)
        ];

     
        return $rules;
    }

    /**
     * Kustomisasi pesan error agar lebih ramah pengguna (Opsional)
     */
    public function messages(): array
    {
        return [
            'name.required'      => 'Nama Editor wajib diisi.',
            'status.required'    => 'Status wajib dipilih.',

        ];
    }
}
