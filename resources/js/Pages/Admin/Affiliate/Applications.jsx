import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { CheckCircle2, Inbox, UserCheck, XCircle } from 'lucide-react'
import React, { useState } from 'react'

export default function Applications({ applications, situsLabel, routePrefix = '' }) {
    const situsSlug = routePrefix.replace('.', '')
    const { auth } = usePage().props
    const izin = auth.permissions || []
    const bolehUbah = izin.includes(`edit afiliasi ${situsSlug}`)

    // Penanda yang DIUBAH admin per baris. Kunci yang belum ada berarti admin belum
    // menyentuhnya, jadi nilai tersimpan yang dipakai; false berarti admin sengaja
    // mematikannya. Dua hal itu harus dibedakan, kalau tidak penanda yang sudah
    // menyala tidak akan pernah bisa dimatikan dari layar ini.
    const [berhak, setBerhak] = useState({})
    const [proses, setProses] = useState(null)

    const berhakTerpilih = (a) => (a.id in berhak ? berhak[a.id] : !!a.tier2_eligible)

    const setujui = (a) => {
        if (!confirm(`Setujui pengajuan ${a.name}?`)) return
        setProses(a.id)
        router.post(
            route(`admin.${routePrefix}affiliate.applications.approve`, a.id),
            { tier2_eligible: berhakTerpilih(a) },
            { preserveScroll: true, onFinish: () => setProses(null) },
        )
    }

    const tolak = (a) => {
        const alasan = prompt(`Alasan menolak pengajuan ${a.name}:`)
        if (!alasan) return
        setProses(a.id)
        router.patch(
            route(`admin.${routePrefix}affiliate.applications.reject`, a.id),
            { note: alasan },
            { preserveScroll: true, onFinish: () => setProses(null) },
        )
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Pengajuan Afiliator ${situsLabel}`} />

            <Breadcrumbs
                items={[
                    { label: 'Afiliasi', href: route(`admin.${routePrefix}affiliate.index`) },
                    { label: 'Pengajuan' },
                ]}
            />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold">Pengajuan Afiliator — {situsLabel}</h1>
                    <p className="text-sm text-muted-foreground">
                        Pengajuan berstatus <strong>pending</strong>, baik yang dikirim member lewat aplikasi publik
                        maupun yang dibuat admin. Centang akun yang <strong>boleh menerima komisi 5%</strong> dari
                        jaringannya — itu satu-satunya hal soal tingkat kedua yang Anda tentukan di sini. Siapa
                        upline seseorang diturunkan sistem dari akun yang mengundangnya, dan hanya terbentuk bila
                        akun pengundang itu dicentang.
                    </p>
                </div>
                <Link href={route(`admin.${routePrefix}affiliate.index`)}>
                    <Button variant="outline">Semua afiliator</Button>
                </Link>
            </div>

            {applications.data.length === 0 ? (
                <Card className="py-16 text-center">
                    <Inbox className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">Belum ada pengajuan yang menunggu peninjauan.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {applications.data.map((a) => (
                        <Card key={a.id} className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold">{a.name}</h2>
                                        <Badge variant="secondary">{a.code}</Badge>
                                        {a.mandiri ? (
                                            <Badge className="bg-blue-200 text-blue-900">Pengajuan mandiri</Badge>
                                        ) : (
                                            <Badge variant="outline">Dibuat admin</Badge>
                                        )}
                                        {a.member && (
                                            <Badge className={a.member.aktif ? 'bg-green-200 text-green-900' : 'bg-orange-200 text-orange-900'}>
                                                {a.member.aktif ? 'Member aktif' : 'Member tidak aktif'}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {a.email || 'tanpa email'}
                                        {a.phone ? ` • ${a.phone}` : ''} • diajukan {formatDate(a.created_at)}
                                        {a.terms_accepted_at ? ` • menyetujui S&K ${formatDate(a.terms_accepted_at)}` : ''}
                                    </p>
                                </div>
                            </div>

                            {a.applicant_note && (
                                <div className="mt-4 rounded-lg bg-base-200/60 p-3">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground">Audiens yang akan dijangkau</p>
                                    <p className="mt-1 whitespace-pre-line text-sm">{a.applicant_note}</p>
                                </div>
                            )}

                            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                                <div>
                                    <dt className="text-xs uppercase text-muted-foreground">Metode</dt>
                                    <dd>{a.payout_method === 'ewallet' ? 'E-Wallet' : 'Transfer Bank'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase text-muted-foreground">Rekening</dt>
                                    <dd>{a.bank_name || '—'} {a.bank_account_number || ''}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase text-muted-foreground">Atas nama</dt>
                                    <dd>{a.bank_account_name || '—'}</dd>
                                </div>
                            </dl>

                            {bolehUbah && (
                                <div className="mt-5 flex flex-wrap items-end gap-3 border-t pt-4">
                                    <div className="min-w-64 flex-1">
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <input
                                                type="checkbox"
                                                className="checkbox mt-0.5"
                                                checked={berhakTerpilih(a)}
                                                onChange={(e) => setBerhak((s) => ({ ...s, [a.id]: e.target.checked }))}
                                            />
                                            <span>
                                                <span className="text-sm font-semibold">
                                                    Boleh menerima komisi 5% dari jaringannya
                                                </span>
                                                <span className="mt-1 block text-xs text-muted-foreground">
                                                    Dicentang: member yang nanti mendaftar lewat link orang ini dan
                                                    disetujui jadi afiliator akan menjadi jaringannya, dan orang ini
                                                    memperoleh 5% dari pendaftar yang mereka bawa. Komisi 20% dari
                                                    pendaftar langsungnya tetap berjalan, dicentang atau tidak.
                                                </span>
                                                {a.upline && (
                                                    <span className="mt-1 block text-xs text-muted-foreground">
                                                        Upline orang ini: <strong>{a.upline.name}</strong> ({a.upline.code})
                                                        — diturunkan dari akun yang mengundangnya.
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => setujui(a)} disabled={proses === a.id}>
                                            <CheckCircle2 className="mr-1 h-4 w-4" /> Setujui
                                        </Button>
                                        <Button variant="destructive" onClick={() => tolak(a)} disabled={proses === a.id}>
                                            <XCircle className="mr-1 h-4 w-4" /> Tolak
                                        </Button>
                                        <Link href={route(`admin.${routePrefix}affiliate.edit`, a.id)}>
                                            <Button variant="outline">
                                                <UserCheck className="mr-1 h-4 w-4" /> Ubah data
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}

                    <PaginationDaisy data={applications} />
                </div>
            )}
        </AuthenticatedLayout>
    )
}
