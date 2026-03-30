<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NetworkFormRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
   public function rules(): array
{
    $network = $this->route('network');
    $networkId = is_object($network) ? $network->id : $network;

    return [
        'name' => ['required', 'string', 'max:100'],

        'domain' => [
            'required',
            'string',
            Rule::unique('mysql_daerah.network', 'domain')->ignore($networkId),
        ],

        'title' => ['required', 'string'],
        'tagline' => ['required', 'string'],
        'keyword' => ['required', 'string'],
        'description' => ['required', 'string'],
        'analytics' => ['required', 'string'],
        'gverify' => ['required', 'string'],
        'fb' => ['required', 'string'],
        'tw' => ['required', 'string'],
        'ig' => ['required', 'string'],
        'yt' => ['required', 'string'],
        'gp' => ['required', 'string'],
        'logo' => ['required', 'url'],
        'logo_m' => ['required', 'url'],
        'img_socmed' => ['required', 'url'],
        'is_main' => ['required', Rule::in([0, 1])],
        'status' => ['required', Rule::in([0, 1])],
        'is_web' => ['required', Rule::in([0, 1])],
    ];
}

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi',
            'domain.required' => 'Domain wajib diisi',
            'domain.unique' => 'Domain sudah didaftarkan',
            'title.required' => 'Judul wajib diisi',
            'tagline.required' => 'Tagline wajib diisi',
            'keyword.required' => 'Keyword wajib diisi',
            'description.required' => 'Deskripsi wajib diisi',
            'analytics.required' => 'Analytics Id wajib diisi',
            'gverify.required' => 'Google Vertifcation wajib diisi',
            'fb.required' => 'Facebook Url wajib diisi',
            'tw.required' => 'Twitter Username wajib diisi',
            'ig.required' => 'Instagram Url wajib diisi',
            'yt.required' => 'Youtube Url wajib diisi',
            'gp.required' => 'GooglePlus Url wajib diisi',
            'is_main.required' => 'Main Web Wajib dipilih',
            'status.required' => 'Status Wajib dipilih',
            'is_web.required' => 'Status Web Wajib dipilih',
            'logo.required' => 'Logo Untuk desktop Wajib diisi',
            'logo_m.required' => 'Logo Untuk mobile Wajib diisi',
            'img_socmed.required' => 'Image Untuk mobile Wajib diisi',
           ];
    }
}
