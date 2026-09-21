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
            // in: bukan string — form ini tidak punya file input sama sekali, jadi Inertia
            // selalu mengirim JSON dan nilai radio tidak ikut jadi string.
            'status'          => 'required|in:1,2',
            'editor'          => 'required',
            'writer'          => 'required',
            'writer_id'       => 'required|exists:mysql_nasional.journalist,id',
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
            'affiliate_link'  => 'nullable|url',

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
            'is_code.required'         => 'Kode berita (is_code) tidak terkirim. Muat ulang halaman import.',
            'status.required'          => 'Status publish wajib dipilih.',
            'status.in'                => 'Status publish harus Publish atau Review.',
            'editor.required'          => 'Editor wajib dipilih.',
            'writer.required'          => 'Nama penulis wajib diisi.',
            // writer_id lahir dari pemetaan penulis lintas-DB (writers.id_daerah -> id_nasional).
            // Saat pemetaan meleset, field ini yang gagal — pesannya harus menjelaskan itu.
            'writer_id.required'       => 'Penulis wajib dipilih. Penulis asal belum terhubung ke data Nasional, silakan pilih manual.',
            'writer_id.exists'         => 'Penulis yang dipilih tidak terdaftar di database Nasional.',
            'title.required'           => 'Judul berita wajib diisi.',
            'title.max'                => 'Judul berita tidak boleh lebih dari 255 karakter.',
            'description.required'     => 'Deskripsi berita wajib diisi.',
            'description.max'          => 'Deskripsi tidak boleh lebih dari 255 karakter.',
            'is_content.required'      => 'Konten atau isi berita wajib diisi.',
            'is_headline.in'           => 'Nilai headline tidak valid.',
            'datepub.required'         => 'Tanggal publish wajib ditentukan.',
            'datepub.date'             => 'Format tanggal publish tidak valid.',
            'kanal.required'           => 'Kanal berita wajib dipilih.',
            'locus.max'                => 'Locus tidak boleh lebih dari 255 karakter.',
            'affiliate_link.url'       => 'Link affiliate harus berupa URL yang valid.',
            'image_thumbnail.required' => 'Gambar thumbnail wajib dipilih dari galeri CDN.',
            'image_thumbnail.url'      => 'Gambar thumbnail harus berupa URL yang valid.',
            'image_caption.required'   => 'Caption gambar wajib diisi.',
            'image_caption.max'        => 'Caption gambar tidak boleh lebih dari 255 karakter.',
            'tag.array'                => 'Format tag tidak valid.',
        ];
    }
}
