<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Affiliate;
use App\Models\PaketBerita;
use Illuminate\Http\Request;

/**
 * Pelingkupan layar afiliasi per situs (AJP / Kopi TIMES).
 *
 * Nilainya SELALU diambil dari route default (`->defaults('situs', ...)`), tidak pernah
 * dari query string. Kalau dibaca dari ?situs=, permission per situs tidak mengikat
 * apa-apa — pemegang izin AJP tinggal mengetik ?situs=4 untuk melihat Kopi TIMES.
 *
 * Tabelnya satu untuk semua situs, tapi tiap baris afiliasi membawa kolom `type`
 * (1 = AJP, 4 = Kopi TIMES) yang diisi aplikasi publik. Afiliator terikat satu situs,
 * komisi hanya lahir dari pendaftar di situs yang sama, dan satu batch pencairan hanya
 * boleh memuat komisi dari satu situs.
 */
trait ScopesAffiliateSite
{
    /** Slug situs dari NAMA route (admin.ajp.* / admin.kopi-times.*), bukan dari input. */
    protected function slugSitus(Request $request): string
    {
        return str_starts_with((string) $request->route()?->getName(), 'admin.ajp.') ? 'ajp' : 'kopi-times';
    }

    /** Nilai news_package.type untuk situs aktif. */
    protected function situs(Request $request): string
    {
        return $this->slugSitus($request) === 'ajp' ? '1' : '4';
    }

    protected function labelSitus(Request $request): string
    {
        return PaketBerita::labelSitus($this->situs($request));
    }

    /**
     * Basis link referral situs aktif, mis. "https://ajp.times.co.id/?ref=".
     *
     * WAJIB ikut situs aktif. Sebelum 2026-10-20 ketiga layar afiliasi memakai URL
     * Kopi TIMES untuk kedua situs, sehingga tombol salin di layar AJP membagikan
     * link ke domain yang salah — referralnya tercatat tapi komisinya nol, karena
     * kode hanya berlaku di situs afiliatornya sendiri.
     */
    protected function basisReferral(Request $request): string
    {
        return Affiliate::basisReferral($this->situs($request));
    }

    /** Prefix nama route situs aktif, mis. "ajp." — dipakai untuk redirect & tautan. */
    protected function prefixSitus(Request $request): string
    {
        return $this->slugSitus($request) . '.';
    }

    /** Batasi query ke situs aktif lewat kolom `type`. Berlaku untuk komisi, afiliator, dan pencairan. */
    protected function batasiKeSitus($query, Request $request)
    {
        return $query->where('type', $this->situs($request));
    }

    /** Nama lama, dipertahankan supaya pemanggil yang sudah ada tidak perlu diubah. */
    protected function batasiKomisiKeSitus($query, Request $request)
    {
        return $this->batasiKeSitus($query, $request);
    }

    /**
     * Apakah satu baris (komisi, afiliator, atau pencairan) memang milik situs aktif.
     * Dipakai sebelum aksi ubah — tanpa ini pemegang izin satu situs bisa mengubah
     * data situs lain hanya dengan menebak id-nya.
     */
    protected function milikSitus($baris, Request $request): bool
    {
        return (string) ($baris->type ?? '') === $this->situs($request);
    }

    /** Nama lama untuk baris komisi. */
    protected function komisiMilikSitus($komisi, Request $request): bool
    {
        return $this->milikSitus($komisi, $request);
    }
}
