<?php

namespace App\Http\Requests;

use App\Models\Affiliate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AffiliateFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Pada update, baris ini sendiri dikecualikan dari aturan unik.
        $id = $this->route('affiliate');
        $koneksi = 'mysql_berbayar.';

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique($koneksi . 'affiliates', 'email')->ignore($id)],
            'phone' => ['nullable', 'string', 'max:30'],
            // code di-generate otomatis, tapi tetap divalidasi: URL publik bergantung padanya.
            'code' => ['required', 'string', 'regex:/^[A-Z0-9]{3,32}$/', Rule::unique($koneksi . 'affiliates', 'code')->ignore($id)],
            'upline_id' => ['nullable', 'integer', Rule::exists($koneksi . 'affiliates', 'id')],
            'user_id' => ['nullable', 'integer', Rule::exists($koneksi . 'wartawan', 'id'), Rule::unique($koneksi . 'affiliates', 'user_id')->ignore($id)],
            'payout_method' => ['required', Rule::in(['bank', 'ewallet'])],
            'bank_name' => ['nullable', 'string', 'max:60'],
            'bank_account_number' => ['nullable', 'string', 'max:40'],
            'bank_account_name' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::in(['pending', 'active', 'suspended', 'inactive'])],
            'note' => ['nullable', 'string'],
        ];
    }

    /**
     * Rantai upline tidak boleh membentuk lingkaran. Tidak bisa diungkapkan sebagai rule
     * biasa karena perlu menelusuri rantainya, jadi diperiksa setelah aturan dasar lolos.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $id = (int) $this->route('affiliate');
            $upline = $this->input('upline_id');

            if ($upline && Affiliate::wouldLoop($id, (int) $upline)) {
                $validator->errors()->add(
                    'upline_id',
                    $id && (int) $upline === $id
                        ? 'Afiliator tidak boleh menjadi upline dirinya sendiri.'
                        : 'Upline ini membentuk lingkaran pada rantai afiliasi.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama afiliator wajib diisi.',
            'name.max' => 'Nama tidak boleh lebih dari 255 karakter.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah dipakai afiliator lain.',
            'code.required' => 'Kode referral wajib diisi.',
            'code.regex' => 'Kode hanya boleh huruf besar dan angka, 3–32 karakter.',
            'code.unique' => 'Kode referral ini sudah dipakai.',
            'upline_id.exists' => 'Upline yang dipilih tidak ditemukan.',
            'user_id.exists' => 'Akun member yang dipilih tidak ditemukan.',
            'user_id.unique' => 'Akun member ini sudah tertaut ke afiliator lain.',
            'payout_method.required' => 'Metode pencairan wajib dipilih.',
            'payout_method.in' => 'Metode pencairan harus bank atau ewallet.',
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status tidak valid.',
        ];
    }
}
