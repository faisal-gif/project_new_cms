<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsNasionalImportFormRequest extends FormRequest
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
        return [
            'is_code'         => 'required|string',
            'status'          => 'nullable|string',
            'editor'          => 'required', 
            'writer'          => 'required', 
            'title'           => 'required|string|max:255',
            'description'     => 'required|string|max:255',
            'tag'             => 'nullable|array',
            'is_content'      => 'required|string',
            // Gunakan in:0,1 atau boolean karena dari React kita mengirim 0 atau 1
            'is_headline'     => 'nullable|in:0,1,true,false',
            'image_thumbnail' => 'required|url',
            'image_caption'   => 'required|string|max:255',
            'datepub'         => 'required|date',
            'locus'           => 'nullable|string|max:255',
            'focus'           => 'nullable',
            'kanal'           => 'required',
         
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'editor.required'          => 'Editor wajib dipilih.',
            'writer.required'          => 'Penulis wajib dipilih.',
            'title.required'           => 'Judul berita wajib diisi.',
            'title.max'                => 'Judul berita tidak boleh lebih dari 255 karakter.',
            'description.required'     => 'Deskripsi berita wajib diisi.',
            'description.max'          => 'Deskripsi tidak boleh lebih dari 255 karakter.',
            'is_content.required'      => 'Konten atau isi berita wajib diisi.',
            'datepub.required'         => 'Tanggal publish wajib ditentukan.',
            'datepub.date'             => 'Format tanggal publish tidak valid.',
            'kanal.required'           => 'Kanal berita wajib dipilih.',
            'image_thumbnail.required' => 'Gambar thumbnail wajib diunggah.',
            'image_thumbnail.url'      => 'Gambar thumbnail harus berupa URL yang valid.',
            'image_caption.max'        => 'Caption gambar tidak boleh lebih dari 255 karakter.',
            'tag.array'                => 'Format tag tidak valid.',
        ];
    }
}
