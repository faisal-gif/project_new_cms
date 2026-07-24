<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaketAjpRequest extends FormRequest
{

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
        $paketRoute = $this->route('paket');

        $paketId = is_object($paketRoute) ? $paketRoute->id : $paketRoute;

        return [
            'name'            => [
                'required',
                'string',
                'max:255',
                Rule::unique('mysql_berbayar.news_package', 'name')->ignore($paketId)
            ],
            'feature'         => ['nullable', 'string'],
            'kategori_produk' => ['required', 'string', Rule::in(['paket', 'satuan'])],

            // Null = paket kuota manual (diisi admin saat assign ke penulis)
            'quota'           => ['nullable', 'integer', 'min:0'],
            'feed_instagram'  => ['nullable', 'integer', 'min:0'],
            'ekoran'          => ['nullable', 'integer', 'min:0'],
            'wa_channel'      => ['nullable', 'integer', 'min:0'],
            'price'           => ['required', 'integer', 'min:0'],
            'period'          => ['required', 'integer', 'min:1'],
            'jenis_periode'   => ['required', 'string', Rule::in(['hari', 'minggu', 'bulan', 'tahun'])],
            'level'           => ['required', 'integer', 'min:0'],

            'badge'           => ['required', 'string', Rule::in(['kuning', 'oren', 'hijau', 'biru'])],
            'popular'         => ['required', 'boolean'],
            'promo'           => ['required', 'boolean'],
            'flash_sale'      => ['required', 'boolean'],
            'status'          => ['required', 'boolean'],

            'items_lainnya'             => ['nullable', 'array'],
            'items_lainnya.*.id'        => [
                'nullable',
                Rule::exists('mysql_berbayar.items_lainnya', 'id')->where('news_package_id', $paketId)
            ],
            'items_lainnya.*.nama_item' => ['required', 'string', 'max:255'],
            'items_lainnya.*.type'      => ['required', 'string',  Rule::in(['merchandise', 'digital_service'])],
            'items_lainnya.*.qty'       => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name'                      => 'nama paket',
            'feature'                   => 'fitur paket',
            'kategori_produk'           => 'kategori produk',
            'quota'                     => 'kuota berita',
            'feed_instagram'            => 'feed instagram',
            'ekoran'                    => 'e-koran',
            'wa_channel'                => 'wa channel',
            'price'                     => 'harga',
            'period'                    => 'masa aktif',
            'jenis_periode'             => 'jenis periode',
            'level'                     => 'level',
            'badge'                     => 'warna badge',
            'popular'                   => 'label populer',
            'promo'                     => 'label promo',
            'flash_sale'                => 'label flash sale',
            'items_lainnya.*.nama_item' => 'nama item',
            'items_lainnya.*.type'      => 'tipe item',
            'items_lainnya.*.qty'       => 'qty item',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Nama paket wajib di isi.',
            'name.unique'          => 'Nama paket sudah digunakan, gunakan nama lain.',
            'name.max'             => 'Nama paket maksimal 255 karakter.',

            'kategori_produk.required'      => 'Kategori Produk wajib di isi',

            'price.required'       => 'Harga wajib di isi.',
            'price.integer'        => 'Harga harus berupa angka.',
            'price.min'            => 'Harga tidak boleh kurang dari 0.',

            'quota.integer'        => 'Kuota harus berupa angka.',
            'quota.min'            => 'Kuota tidak boleh kurang dari 0.',

            'period.required'      => 'Masa aktif wajib di isi.',
            'period.integer'       => 'Masa aktif harus berupa angka.',
            'period.min'           => 'Masa aktif minimal 1.',

            'jenis_periode.required' => 'Jenis periode wajib dipilih.',
            'jenis_periode.in'     => 'Jenis periode harus salah satu dari: hari, minggu, bulan, tahun.',

            'level.required'       => 'Level wajib di isi.',
            'level.integer'        => 'Level harus berupa angka.',

            'badge.required'       => 'Warna badge wajib dipilih.',
            'badge.in'             => 'Warna badge harus salah satu dari: kuning, oren, hijau, biru.',

            'status.required'      => 'Status wajib dipilih.',

            'items_lainnya.array'          => 'Format items lainnya tidak valid.',
            'items_lainnya.*.id.exists'    => 'Item tidak valid atau bukan milik paket ini.',
            'items_lainnya.*.nama_item.required' => 'Nama item wajib di isi.',
            'items_lainnya.*.type.required' => 'Type Wajib di isi',
            'items_lainnya.*.qty.required' => 'Qty item wajib di isi.',
            'items_lainnya.*.qty.min'      => 'Qty item minimal 1.',
        ];
    }
}
