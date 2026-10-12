<?php

namespace App\Http\Controllers\Concerns;

use App\Models\PaketBerita;
use Illuminate\Http\Request;

/**
 * Pelingkupan layar afiliasi per situs (AJP / Kopi TIMES).
 *
 * Nilainya SELALU diambil dari route default (`->defaults('situs', ...)`), tidak pernah
 * dari query string. Kalau dibaca dari ?situs=, permission per situs tidak mengikat
 * apa-apa — pemegang izin AJP tinggal mengetik ?situs=4 untuk melihat Kopi TIMES.
 *
 * Tabelnya satu untuk semua situs; asal situs sebuah komisi ditelusuri lewat
 * affiliate_commissions.payment_id -> payments.package_id -> news_package.type.
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

    /** Prefix nama route situs aktif, mis. "ajp." — dipakai untuk redirect & tautan. */
    protected function prefixSitus(Request $request): string
    {
        return $this->slugSitus($request) . '.';
    }

    /** Batasi query komisi ke situs aktif, lewat rantai payment -> package. */
    protected function batasiKomisiKeSitus($query, Request $request)
    {
        $situs = $this->situs($request);

        return $query->whereHas('payment.package', fn($p) => $p->where('type', $situs));
    }

    /**
     * Apakah satu baris komisi memang milik situs aktif. Dipakai sebelum aksi
     * setujui/tolak/balikkan/tetapkan — tanpa ini pemegang izin satu situs bisa
     * mengubah komisi situs lain hanya dengan menebak id-nya.
     */
    protected function komisiMilikSitus($komisi, Request $request): bool
    {
        return (string) ($komisi->payment?->package?->type ?? '') === $this->situs($request);
    }
}
