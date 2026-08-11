<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserFormRequest extends FormRequest
{


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {

        // Ambil ID user kalau ada (PUT), kalau POST maka null → aman
        $user = $this->route('user');
        $userId = is_object($user) ? $user->id : $user;

        return [
            'full_name' => 'required|string|max:100',
            'username' => 'required|unique:users,username,' . $userId . '|string',
            'email' => 'required|unique:users,email,' . $userId . '|email',
            'password' => $this->isMethod('POST')
                ? 'required|string|min:8'
                : 'nullable|string|min:8',
            'roles' => 'required|array', 
            'roles.*' => 'exists:roles,name',
            'status' => 'required|in:0,1',
            'id_writer' => 'nullable|exists:writers,id|unique:users,id_writer,' . $userId,
            'id_editor' => 'nullable|exists:editors,id|unique:users,id_editor,' . $userId,
            'id_fotografer' => 'nullable|exists:writers,id|unique:users,id_fotografer,' . $userId,

            // Data editor (opsional, dikelola bila manage_editor true).
            'manage_editor'      => 'boolean',
            'editor_name'        => 'nullable|required_if:manage_editor,true,1|string|max:255',
            'editor_description' => 'nullable|string',
            'editor_no_whatsapp' => 'nullable|string|max:20',
            'editor_image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'create_nasional'    => 'boolean',
            'create_daerah'      => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama Lengkap wajib diisi',
            'username.required' => 'Username wajib diisi',
            'username.unique' => 'Username sudah didaftarkan',
            'email.required' => 'Email wajib diisi',
            'password.required' => 'Password wajib diisi',
            'email.unique' => 'Email sudah didaftarkan',
            'role.required' => 'Role Wajib dipilih',
            'status.required' => 'Status Wajib dipilih',
            'id_writer.exists' => 'Writer yang dipilih tidak valid',
            'id_writer.unique' => 'Writer yang dipilih sudah terdaftar sebagai user lain',
            'id_editor.exists' => 'Editor yang dipilih tidak valid',
            'id_editor.unique' => 'Editor yang dipilih sudah terdaftar sebagai user lain',
            'id_fotografer.exists' => 'Fotografer yang dipilih tidak valid',
            'id_fotografer.unique' => 'Fotografer yang dipilih sudah terdaftar sebagai user lain',
        ];
    }
}
