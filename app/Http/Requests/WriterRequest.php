<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WriterRequest extends FormRequest
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
        // Mengambil instance model Writer dari Route parameters jika ini adalah proses Update (PUT/PATCH).
        // Asumsi nama parameter di route Anda adalah 'writer', cth: Route::put('/writers/{writer}', ...)
        $writer = $this->route('writers');
        $writerId = $writer ? $writer->id : null;

        // Aturan dasar yang berlaku untuk Create dan Update
        $rules = [
            'name'        => ['required', 'string', 'max:255'],
            'email'       => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('writers', 'email')->ignore($writerId)
            ],
            'no_whatsapp' => ['required', 'string', 'max:20'],
            'date_exp'    => ['required', 'date'],
            'network_id'  => ['required', 'exists:mysql_daerah.network,id'],
            'status'      => ['required', 'in:0,1'],

            // Validasi krusial untuk fitur pilihan opsional (Cross-DB & Unique Ignore)
            'id_nasional' => [
                'nullable', 
                'exists:mysql_nasional.journalist,id', 
                Rule::unique('writers', 'id_nasional')->ignore($writerId)
            ],
            'id_daerah'   => [
                'nullable', 
                'exists:mysql_daerah.writers,id', 
                Rule::unique('writers', 'id_daerah')->ignore($writerId)
            ],
        ];

        // Aturan dinamis khusus untuk Password
        if ($this->isMethod('post')) {
            // Jika Create (POST), password wajib diisi
            $rules['password'] = ['required', 'string', 'min:8'];
        } else {
            // Jika Update (PUT/PATCH), password opsional
            $rules['password'] = ['nullable', 'string', 'min:8'];
        }

        return $rules;
    }

    /**
     * Custom messages untuk UX yang lebih baik (Opsional)
     */
    public function messages(): array
    {
        return [
            'status.in'          => 'Status harus berupa 0 (Pending) atau 1 (Publish).',
            'status.required'    => 'Status penulis wajib diisi.',
            'date_exp.required'  => 'Tanggal kadaluarsa wajib diisi.',
            'email.unique'       => 'Email ini sudah terdaftar. Silakan gunakan email lain.',
            'password.required'  => 'Password wajib diisi untuk penulis baru.',
            'password.min'       => 'Password minimal harus 8 karakter.',
            'id_nasional.exists' => 'Akun nasional yang dipilih tidak valid atau sudah dihapus.',
            'id_daerah.exists'   => 'Akun daerah yang dipilih tidak valid atau sudah dihapus.',
            'id_nasional.unique' => 'Akun nasional ini sudah terhubung dengan penulis lain.',
            'id_daerah.unique'   => 'Akun daerah ini sudah terhubung dengan penulis lain.',
        ];
    }
}