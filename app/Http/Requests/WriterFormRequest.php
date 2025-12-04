<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WriterFormRequest extends FormRequest
{
   
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {


        $writer = $this->route('writer');
        $writerId = is_object($writer) ? $writer->id : $writer;

        return [
            'name' => 'required|string|max:100',
            'no_whatsapp' => 'required|string',
            'email' => 'required|unique:writers,email,' . $writerId . '|email',
            'password' =>  $this->isMethod('POST')
                ? 'required|string|min:8'
                : 'nullable|string|min:8',
            'network_id' => 'required|',
            'date_exp' => 'required|date',
            'status' => 'required|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama Lengkap wajib diisi',
            'no_whatsapp' => 'No Whatsapp Wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.unique' => 'Email sudah didaftarkan',
            'network_id.required' => 'Wilayah wajib dipilih',
            'password.required' => 'Password wajib diisi',
            'date_exp.required' => 'Tanggal Kadaluarsa wajib diisi',
            'status.required' => 'Status Wajib dipilih'
        ];
    }
}
