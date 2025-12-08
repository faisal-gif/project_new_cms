<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdsDaerahFormRequest extends FormRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:100',
            'type' => 'required|in:d,m,t',
            'location' => 'required|',
            'datestart' => 'required|date',
            'dateend' => 'required|date',
            'image' => 'required|string',
            'url' => 'required|string',
            'cpc' => 'required|integer',
            'cost' => 'required|integer',
            'status' => 'required|in:0,1',
            'network' => 'required|array'
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul wajib diisi',
            'type.required' => 'Type wajib dipilih',
            'location.required' => 'Location wajib dipilih',
            'datestart.required' => 'Date Start wajib dipilih',
            'dateend.required' => 'Date End wajib dipilih',
            'image.required' => 'image wajib dipilih',
            'url.required' => 'Url wajib dipilih',
            'cpc.required' => 'CPC wajib dipilih',
            'cost.required' => 'Cost wajib dipilih',
            'status.required' => 'Status Wajib dipilih',
            'network.required' => 'Lokasi Publish Wajib diisi'
        ];
    }
}
