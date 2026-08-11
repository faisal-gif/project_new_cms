<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WriterManageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $writer = $this->route('writer');
        $writerId = is_object($writer) ? $writer->id : $writer;

        return [
            // Master
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'max:255', Rule::unique('writers', 'email')->ignore($writerId)],
            'password'    => [$this->isMethod('post') ? 'required' : 'nullable', 'string', 'min:8'],
            'no_whatsapp' => ['required', 'string', 'max:20'],
            'date_exp'    => ['required', 'date'],
            'network_id'  => ['required', 'exists:mysql_daerah.network,id'],
            'status'      => ['required', 'in:0,1'],

            // Nasional (journalist)
            'bio'    => ['nullable', 'string'],
            'region' => ['nullable', 'string', 'max:255'],
            'image'  => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'create_nasional' => ['boolean'],

            // Daerah (writers) = salinan master
            'create_daerah' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'       => 'Nama penulis wajib diisi.',
            'email.required'      => 'Email wajib diisi.',
            'email.unique'        => 'Email sudah dipakai penulis lain.',
            'password.required'   => 'Password wajib diisi saat menambah penulis.',
            'no_whatsapp.required' => 'No. WhatsApp wajib diisi.',
            'date_exp.required'   => 'Masa berlaku wajib diisi.',
            'network_id.required' => 'Network wajib dipilih.',
            'status.required'     => 'Status wajib dipilih.',
            'image.image'         => 'File harus berupa gambar.',
        ];
    }
}
