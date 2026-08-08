<?php

namespace App\Http\Requests;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EventKTRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Wajib window waktu hanya saat event diaktifkan.
        $enabled = $this->boolean('enabled');

        return [
            'name'        => 'required|string|max:255',
            'category'    => ['required', Rule::in(Event::CATEGORIES)],
            'description' => 'nullable|string',
            'quota'       => 'required|integer|min:0',
            'enabled'     => 'boolean',
            'starts_at'   => [$enabled ? 'required' : 'nullable', 'date'],
            'ends_at'     => [$enabled ? 'required' : 'nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Nama event wajib diisi.',
            'name.max'             => 'Nama event maksimal 255 karakter.',
            'category.required'    => 'Jenis event wajib dipilih.',
            'category.in'          => 'Jenis event tidak valid (pilih: event, public_event, atau lomba).',
            'quota.required'       => 'Kuota wajib diisi.',
            'quota.integer'        => 'Kuota harus berupa angka.',
            'quota.min'            => 'Kuota tidak boleh negatif.',
            'starts_at.required'   => 'Waktu mulai wajib diisi saat event diaktifkan.',
            'ends_at.required'     => 'Waktu selesai wajib diisi saat event diaktifkan.',
            'ends_at.after_or_equal' => 'Waktu selesai tidak boleh lebih awal dari waktu mulai.',
        ];
    }
}
