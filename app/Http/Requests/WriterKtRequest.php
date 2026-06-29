<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WriterKtRequest extends FormRequest
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
        $writerRoute = $this->route('writer');

        $writerId = is_object($writerRoute) ? $writerRoute->id : $writerRoute;

        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => [
                'required',
                'email',
                Rule::unique('mysql_berbayar.wartawan', 'email')->ignore($writerId)
            ],
            'password'   => [$writerId ? 'nullable' : 'required', 'string', 'min:8'],

            'paket_berita' => ['required', Rule::exists('mysql_berbayar.news_package', 'id')],

            'phone'    => ['nullable', 'string', 'max:20'],
            'instansi'   => ['nullable', 'string', 'max:255'],
            'kategori' => ['required'],
            'provinsi'       => ['nullable', 'string', 'max:100'],
            'kota'       => ['nullable', 'string', 'max:100'],
            'alamat'    => ['nullable', 'string', 'max:500'],
            'status'     => ['required', 'boolean'],
            'quota_news' => ['required', 'integer', 'min:0'],
            'date_exp'    => ['required', 'date'],
        ];
    }
}
