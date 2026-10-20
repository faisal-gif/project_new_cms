import { Badge } from '@/Components/ui/badge'
import { TableCell, TableHead } from '@/Components/ui/table'
import { formatRupiah } from '@/Utils/formatter'
import { ChevronDown, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'

/**
 * Rincian potongan afiliasi untuk SATU pembayaran.
 *
 * Dipakai daftar transaksi Kopi TIMES dan AJP — satu komponen, bukan dua salinan.
 * Hanya dirender bila prop `bolehLihatAfiliasi` dari backend bernilai true; kalau
 * false, backend tidak mengirim relasi `commissions` sama sekali.
 *
 * Pos staff IT punya izin sendiri (`view komisi staff it {situs}`). Tanpa izin itu
 * barisnya tidak dikirim backend, dan kolom Komisi Keluar + Net Kantor ikut
 * disembunyikan — keduanya memuat angka staff IT secara implisit.
 *
 * Kantor menyimpan sisanya: net = amount - komisi yang benar-benar keluar.
 * Baris `rejected`/`reversed` dibatalkan sebelum uangnya berpindah, jadi tidak
 * ikut dihitung — daftar statusnya datang dari backend supaya definisinya satu.
 */

const LABEL_POS = {
    tier1: 'Tier 1 · perekrut',
    tier2: 'Tier 2 · upline',
    internal: 'Staff IT',
}

const DIBATALKAN = ['rejected', 'reversed']

function badgeStatus(status) {
    switch (status) {
        case 'paid':
            return <Badge className="bg-green-300 text-green-800">paid</Badge>
        case 'approved':
            return <Badge className="bg-emerald-200 text-emerald-900">approved</Badge>
        case 'accrued':
            return <Badge className="bg-amber-200 text-amber-900">accrued</Badge>
        case 'unassigned':
            return <Badge className="bg-orange-200 text-orange-900">unassigned</Badge>
        case 'rejected':
        case 'reversed':
            return <Badge variant="secondary" className="line-through">{status}</Badge>
        default:
            return <Badge variant="secondary">{status || '—'}</Badge>
    }
}

/** Hitung sekali, dipakai kolom ringkas maupun panel rincian. */
export function hitungAfiliasi(payment, statusDibatalkan = DIBATALKAN) {
    const rows = payment.commissions || []
    const berlaku = rows.filter((c) => !statusDibatalkan.includes(c.status))
    const keluar = berlaku.reduce((n, c) => n + Number(c.amount || 0), 0)

    // Perekrut = asal baris komisi. source_affiliate_id terisi juga pada baris tier2
    // yang tertahan, jadi baris mana pun yang punya sourceAffiliate sudah cukup.
    // Null berarti penjualan tanpa kode referral — hanya pos internal yang terbit.
    const sumber = rows.find((c) => c.source_affiliate)?.source_affiliate ?? null

    return {
        rows,
        adaKomisi: rows.length > 0,
        keluar,
        net: Number(payment.amount || 0) - keluar,
        sumber,
    }
}

/** Header ketiga kolom, supaya kedua halaman tidak menuliskannya dua kali. */
export function HeaderRincianAfiliasi({ bolehLihatStaffIt = false }) {
    return (
        <>
            <TableHead>Perekrut</TableHead>
            {bolehLihatStaffIt && (
                <>
                    <TableHead className="text-right">Komisi Keluar</TableHead>
                    <TableHead className="text-right">Net Kantor</TableHead>
                </>
            )}
        </>
    )
}

export default function RincianAfiliasi({ payment, statusDibatalkan = DIBATALKAN, bolehLihatStaffIt = false }) {
    const [terbuka, setTerbuka] = useState(false)
    const { rows, adaKomisi, keluar, net, sumber } = hitungAfiliasi(payment, statusDibatalkan)

    // Tanpa komisi tampilkan '—', bukan nol: transaksi tanpa perekrut dan transaksi
    // yang belum lunas berbeda artinya dari potongan senilai nol.
    if (!adaKomisi) {
        const kosong = <span className="text-xs text-muted-foreground">—</span>

        return (
            <>
                <TableCell>{kosong}</TableCell>
                {bolehLihatStaffIt && (
                    <>
                        <TableCell className="text-right">{kosong}</TableCell>
                        <TableCell className="text-right">{kosong}</TableCell>
                    </>
                )}
            </>
        )
    }

    return (
        <>
            <TableCell className="text-xs">
                {sumber ? (
                    <>
                        <span className="font-mono tracking-wider">{sumber.code}</span>
                        <div className="text-[11px] text-muted-foreground">{sumber.name}</div>
                    </>
                ) : (
                    <span className="text-muted-foreground" title="Penjualan tanpa kode referral">—</span>
                )}
            </TableCell>

            {!bolehLihatStaffIt ? null : (
            <TableCell className="whitespace-normal text-right align-top text-xs">
                <button
                    type="button"
                    onClick={() => setTerbuka((v) => !v)}
                    className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline"
                    aria-expanded={terbuka}
                >
                    {terbuka ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    {formatRupiah(keluar)}
                </button>

                {terbuka && (
                    <div className="mt-2 w-60 space-y-1.5 rounded-md bg-base-200/60 p-2 text-left">
                        {rows.map((c) => {
                            const dibatalkan = statusDibatalkan.includes(c.status)

                            return (
                                <div key={c.id} className={dibatalkan ? 'opacity-50' : ''}>
                                    <div className="flex items-center justify-between gap-2 text-[11px]">
                                        <span>{LABEL_POS[c.role] ?? c.role}</span>
                                        <span className="font-medium">{formatRupiah(c.amount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                        <span className="truncate">
                                            {c.role === 'internal'
                                                ? 'Staff IT'
                                                : c.affiliate
                                                    ? c.affiliate.name
                                                    : 'belum ada penerima'}
                                        </span>
                                        {badgeStatus(c.status)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </TableCell>

            )}

            {bolehLihatStaffIt && (
                <TableCell className="text-right align-top text-xs font-semibold text-emerald-700">
                    {formatRupiah(net)}
                </TableCell>
            )}
        </>
    )
}
