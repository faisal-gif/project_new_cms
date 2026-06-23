<?php

namespace App\Http\Requests;

use App\Models\Editor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EditorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Pastikan Anda menambahkan logic otorisasi yang sesuai dengan ACL Anda jika diperlukan.
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // 1. Ambil parameter route dengan nama singular (standar Laravel).
        $routeParameter = $this->route('editor');

        // 2. Ambil ID dengan aman. Mendukung Route Model Binding (Object) maupun parameter murni (String/Int).
        $editorId = $routeParameter instanceof Editor 
            ? $routeParameter->id 
            : $routeParameter;

        return [
            'name'   => ['required', 'string', 'max:255'],
            'status' => ['required', 'in:0,1'],
            
            // Validasi Cross-DB & Unique Ignore
            'id_nasional' => [
                'nullable',
                'exists:mysql_nasional.journalist,id',
                // Pastikan kolom database yang dicek benar 'id_nasional', ubah jika memang menggunakan 'id_ti'
                Rule::unique('editors', 'id_ti')->ignore($editorId)
            ],
            
            'id_daerah' => [
                'nullable',
                'exists:mysql_daerah.editors,id',
                Rule::unique('editors', 'id_daerah')->ignore($editorId)
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama editor wajib diisi.',
            'name.string' => 'Nama editor harus berupa teks.',
            'name.max' => 'Nama editor tidak boleh lebih dari 255 karakter.',
            'status.required' => 'Status editor wajib diisi.',
            'status.in' => 'Status editor harus bernilai 0 (non-aktif) atau 1 (aktif).',
            'id_nasional.exists' => 'Editor nasional yang dipilih tidak valid atau tidak ditemukan di sistem.',
            'id_nasional.unique' => 'Editor nasional ini sudah terhubung dengan entitas editor lain.',
            'id_daerah.exists' => 'Editor daerah yang dipilih tidak valid atau tidak ditemukan di sistem.',
            'id_daerah.unique' => 'Editor daerah ini sudah terhubung dengan entitas editor lain.',
        ];
    }
}