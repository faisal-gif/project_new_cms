<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EditorFormRequest extends FormRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Ambil ID user kalau ada (PUT), kalau POST maka null → aman
        $editor = $this->route('editor');
        $editorId = is_object($editor) ? $editor->id : $editor;

        return [
            'name' => 'required|string|max:100',
            'id_ti' => 'nullable|unique:editors,id_ti,' . $editorId,
            'no_whatsapp' => 'nullable|string',
            'status' => 'required|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi',
            'id_ti.unique' => 'Id Pusat sudah pernah dipilih',
            'status.required' => 'Status Wajib dipilih'
        ];
    }
}
