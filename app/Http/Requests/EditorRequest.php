<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EditorRequest extends FormRequest
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
        // Mengambil instance model Editor dari Route parameters jika ini adalah proses Update (PUT/PATCH).
        // Asumsi nama parameter di route Anda adalah 'editor', cth: Route::put('/editors/{editor}', ...)
        $editor = $this->route('editors');
        $editorId = $editor ? $editor->id : null;

        // Aturan dasar yang berlaku untuk Create dan Update
        $rules = [
            'name'        => ['required', 'string', 'max:255'],
            'status'      => ['required', 'in:0,1'],
            // Validasi krusial untuk fitur pilihan opsional (Cross-DB & Unique Ignore)
            'id_nasional' => [
                'nullable',
                'exists:mysql_nasional.journalist,id',
                Rule::unique('editors', 'id_nasional')->ignore($editorId)
            ],
            'id_daerah'   => [
                'nullable',
                'exists:mysql_daerah.editors,id',
                Rule::unique('editors', 'id_daerah')->ignore($editorId)
            ],
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama editor wajib diisi.',
            'name.string' => 'Nama editor harus berupa teks.',
            'name.max' => 'Nama editor tidak boleh lebih dari 255 karakter.',
            'status.required' => 'Status editor wajib diisi.',
            'status.in' => 'Status editor harus bernilai 0 (non-aktif) atau 1 (aktif).',
            'id_nasional.exists' => 'Editor nasional yang dipilih tidak valid.',
            'id_nasional.unique' => 'Editor nasional yang dipilih sudah terdaftar sebagai editor lain.',
            'id_daerah.exists' => 'Editor daerah yang dipilih tidak valid.',
            'id_daerah.unique' => 'Editor daerah yang dipilih sudah terdaftar sebagai editor lain.',
        ];
    }
}
