<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class EkoranRequest extends FormRequest
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
     */
    public function rules(): array
    {
        // 1. Aturan Dasar (Berlaku untuk Create & Update)
        $rules = [
            'title'         => ['required', 'string', 'max:255'],
            'datepub'       => ['required', 'date'],
            'emagazine_id'  => ['nullable', 'string', 'max:255'],
            'status'        => ['required', 'in:0,1'],
            'regular_pages' => ['required', 'array', 'min:4', 'max:20'],
            'spesial_pages' => ['nullable', 'array', 'max:2'],
        ];

        // 2. Deteksi Mode Update yang lebih akurat
        // Mengecek apakah request adalah PUT/PATCH hasil spoofing, atau memiliki properti _method
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch') || $this->has('_method');

        if (!$isUpdate) {
            // MODE CREATE: Semua item di dalam array WAJIB berupa file gambar
            $rules['regular_pages.*'] = ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5120'];
            $rules['spesial_pages.*'] = ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:5120'];
        } else {
            // MODE UPDATE: Item bisa berupa File gambar ATAU String (URL lama/null)
            $rules['regular_pages.*'] = $this->mixedArrayValidation();
            $rules['spesial_pages.*'] = $this->mixedArrayValidation();
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul eKoran wajib diisi.',
            'datepub.required' => 'Tanggal terbit wajib diisi.',
            'status.required' => 'Status wajib diisi.',
            'regular_pages.required' => 'Halaman reguler wajib diisi.',
            'regular_pages.min' => 'Edisi eKoran wajib memiliki minimal 4 halaman.',
            'regular_pages.*.mimes' => 'Halaman reguler harus berupa file gambar (jpeg, png, jpg).',
            'regular_pages.*.max' => 'Ukuran gambar maksimal 5MB.',
            'spesial_pages.max' => 'Jumlah halaman iklan/promo tidak boleh lebih dari 2.',
            'spesial_pages.*.mimes' => 'Halaman iklan/promo harus berupa file gambar (jpeg, png, jpg).',
        ];
    }

    /**
     * Helper: Validasi campuran untuk menangani String (URL dari DB), UploadedFile (Gambar Baru), 
     * atau "null" (Quirk dari JS FormData)
     */
    private function mixedArrayValidation()
    {
        return function ($attribute, $value, $fail) {
            // Bypass validasi jika value kosong atau berupa string "null" bawaan JS FormData
            if (empty($value) || $value === 'null') {
                return;
            }

            // Tolak jika bentuknya bukan string (URL) dan bukan instance file fisik
            if (!is_string($value) && !($value instanceof UploadedFile)) {
                $fail("Format data pada halaman ini tidak valid.");
                return;
            }

            // Eksekusi validasi standar khusus JIKA data berupa file gambar baru
            if ($value instanceof UploadedFile) {
                $validator = Validator::make(
                    [$attribute => $value],
                    [$attribute => 'image|mimes:jpeg,png,jpg|max:5120']
                );
                
                if ($validator->fails()) {
                    $fail($validator->errors()->first($attribute));
                }
            }
        };
    }
}