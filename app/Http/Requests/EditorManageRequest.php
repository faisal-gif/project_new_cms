<?php

namespace App\Http\Requests;

use App\Models\Editor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EditorManageRequest extends FormRequest
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
        $param = $this->route('editor');
        $editorId = $param instanceof Editor ? $param->id : $param;

        $createUser = $this->boolean('create_user');

        return [
            'name'        => ['required', 'string', 'max:255'],
            'status'      => ['required', 'in:0,1'],

            // --- Akun user ---
            // Mode taut existing (create_user = false): pilih user yang belum tertaut.
            'user_id'     => ['nullable', 'exists:users,id', Rule::unique('editors', 'user_id')->ignore($editorId)],
            // Mode buat baru (create_user = true): field akun wajib.
            'create_user' => ['boolean'],
            'full_name'   => [Rule::requiredIf($createUser), 'nullable', 'string', 'max:100'],
            'username'    => [Rule::requiredIf($createUser), 'nullable', 'string', 'unique:users,username'],
            'email'       => [Rule::requiredIf($createUser), 'nullable', 'email', 'unique:users,email'],
            'password'    => [Rule::requiredIf($createUser), 'nullable', 'string', 'min:8'],
            'roles'       => [Rule::requiredIf($createUser), 'nullable', 'array'],
            'roles.*'     => ['exists:roles,name'],

            // --- Field nasional ---
            'nasional_id' => ['nullable', 'exists:mysql_nasional.editor,editor_id', Rule::unique('editors', 'id_ti')->ignore($editorId)],
            'description' => ['nullable', 'string'],
            'image'       => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'create_nasional' => ['boolean'],

            // --- Field daerah ---
            'daerah_id'   => ['nullable', 'exists:mysql_daerah.editors,id', Rule::unique('editors', 'id_daerah')->ignore($editorId)],
            'no_whatsapp' => ['nullable', 'string', 'max:20'],
            'create_daerah'   => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'    => 'Nama editor wajib diisi.',
            'status.required'  => 'Status wajib dipilih.',
            'status.in'        => 'Status harus 0 (non-aktif) atau 1 (aktif).',
            'user_id.exists'   => 'User yang dipilih tidak valid.',
            'user_id.unique'   => 'User ini sudah tertaut ke editor lain.',
            'image.image'      => 'File harus berupa gambar.',
            'image.max'        => 'Ukuran gambar tidak boleh lebih dari 2MB.',
        ];
    }
}
