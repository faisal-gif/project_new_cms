import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime, formatRupiah } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { AlertTriangle, Check, Clock } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select'

const STATUS = [
    { value: '', label: 'Semua Status' },
    { value: 'accrued', label: 'Accrued — menunggu' },
    { value: 'unassigned', label: 'Unassigned — tanpa penerima' },
    { value: 'approved', label: 'Approved — siap cair' },
    { value: 'paid', label: 'Paid' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'reversed', label: 'Reversed' },
]

const ROLE = [
    { value: '', label: 'Semua Pos' },
    { value: 'tier1', label: 'Tier 1 — perekrut (20%)' },
    { value: 'tier2', label: 'Tier 2 — upline (5%)' },
    { value: 'internal', label: 'Staff IT (10% + Rp 1.000)' },
]

function statusBadge(s) {
    const peta = {
        accrued: ['bg-slate-200 text-slate-800', 'Accrued'],
        unassigned: ['bg-orange-300 text-orange-900', 'Unassigned'],
        approved: ['bg-blue-300 text-blue-900', 'Approved'],
        paid: ['bg-green-300 text-green-800', 'Paid'],
        rejected: ['bg-red-300 text-red-800', 'Rejected'],
        reversed: ['bg-purple-300 text-purple-900', 'Reversed'],
    }
    const [cls, label] = peta[s] || ['', s]
    return <Badge className={cls}>{label}</Badge>
}

function roleBadge(r) {
    const peta = { tier1: 'Tier 1', tier2: 'Tier 2', internal: 'Staff IT' }
    return <Badge variant="outline">{peta[r] || r}</Badge>
}

export default function Index({ commissions, filters, affiliates, situsLabel, ringkasan, routePrefix = '' }) {
    // Permission bersufiks situs; slug-nya diturunkan dari prefix route.
    const situsSlug = routePrefix.replace('.', '')

    const { auth } = usePage().props
    const punya = (p) => (auth.permissions || []).includes(p)
    const bolehUbah = punya(`edit komisi afiliasi ${situsSlug}`)

    const [f, setF] = useState({
        affiliate_id: filters.affiliate_id || '',
        status: filters.status || '',
        role: filters.role || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    })
    const [pilih, setPilih] = useState([])
    const [alasan, setAlasan] = useState({})
    const pertama = useRef(true)

    useEffect(() => {
        if (pertama.current) { pertama.current = false; return }
        const t = setTimeout(() => {
            router.get(route(`admin.${routePrefix}affiliate-commission.index`), f, { preserveState: true, replace: true })
        }, 400)
        return () => clearTimeout(t)
    }, [f])

    // Hanya baris yang benar-benar boleh disetujui yang bisa dicentang.
    const bisaSetujui = (c) => c.status === 'accrued' && c.affiliate_id && new Date(c.available_at) <= new Date()

    const toggle = (id) => setPilih((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
    const toggleSemua = () => {
        const kandidat = commissions.data.filter(bisaSetujui).map((c) => c.id)
        setPilih(pilih.length === kandidat.length ? [] : kandidat)
    }

    const setujui = () => {
        if (!pilih.length) return
        router.post(route(`admin.${routePrefix}affiliate-commission.approve`), { ids: pilih }, {
            preserveScroll: true,
            onSuccess: () => setPilih([]),
        })
    }

    const kirimAlasan = (c, aksi) => {
        const note = (alasan[c.id] || '').trim()
        if (!note) return
        router.patch(route(`admin.affiliate-commission.${aksi}`, c.id), { status_note: note }, {
            preserveScroll: true,
            onSuccess: () => setAlasan((a) => ({ ...a, [c.id]: '' })),
        })
    }

    const kandidatSetujui = commissions.data.filter(bisaSetujui).length

    return (
        <>
            <Head title="Komisi Afiliasi" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <h1 className="text-3xl font-bold text-foreground">Komisi Afiliasi</h1>
                            {/* Situs dikunci route; tidak bisa diubah dari layar. */}
                            <span className="text-sm bg-muted border border-border rounded-full px-3 py-1">{situsLabel}</span>
                            <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi' }, { label: 'Komisi' }]} />
                        </div>

                        {/* Ringkasan mengikuti filter yang sedang aktif */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                ['Menunggu (accrued)', ringkasan.accrued, 'text-slate-700'],
                                ['Siap cair (approved)', ringkasan.approved, 'text-blue-700'],
                                ['Sudah dibayar', ringkasan.paid, 'text-green-700'],
                                ['Tertahan (unassigned)', ringkasan.unassigned, 'text-orange-700'],
                            ].map(([label, nilai, warna]) => (
                                <Card key={label}>
                                    <div className="text-xs text-muted-foreground">{label}</div>
                                    <div className={`text-xl font-bold ${warna}`}>{formatRupiah(nilai)}</div>
                                </Card>
                            ))}
                        </div>

                        <Card>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                <Select options={affiliates} isClearable placeholder="Semua afiliator"
                                    value={affiliates.find((a) => String(a.value) === String(f.affiliate_id)) || null}
                                    onChange={(v) => setF({ ...f, affiliate_id: v?.value ?? '' })} />
                                <Select options={STATUS} value={STATUS.find((s) => s.value === f.status)}
                                    onChange={(v) => setF({ ...f, status: v?.value ?? '' })} />
                                <Select options={ROLE} value={ROLE.find((r) => r.value === f.role)}
                                    onChange={(v) => setF({ ...f, role: v?.value ?? '' })} />
                                <TextInput type="date" className="block w-full" value={f.start_date}
                                    onChange={(e) => setF({ ...f, start_date: e.target.value })} />
                                <TextInput type="date" className="block w-full" value={f.end_date}
                                    onChange={(e) => setF({ ...f, end_date: e.target.value })} />
                            </div>

                            {bolehUbah && kandidatSetujui > 0 && (
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                                    <Button size="sm" variant="outline" onClick={toggleSemua}>
                                        {pilih.length === kandidatSetujui ? 'Batal pilih' : `Pilih semua yang bisa disetujui (${kandidatSetujui})`}
                                    </Button>
                                    <Button size="sm" disabled={!pilih.length} onClick={setujui} className="gap-2">
                                        <Check className="w-4 h-4" /> Setujui {pilih.length || ''}
                                    </Button>
                                </div>
                            )}
                        </Card>

                        <Card>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {bolehUbah && <TableHead className="w-8"></TableHead>}
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Member / Pembayaran</TableHead>
                                            <TableHead>Situs</TableHead>
                                            <TableHead>Pos</TableHead>
                                            <TableHead>Penerima</TableHead>
                                            <TableHead className="text-right">Nominal</TableHead>
                                            <TableHead>Masa Tahan</TableHead>
                                            <TableHead>Status</TableHead>
                                            {bolehUbah && <TableHead className="text-right">Aksi</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {commissions.data.length === 0 && (
                                            <TableRow><TableCell colSpan={10} className="text-center py-10 text-muted-foreground">Belum ada komisi.</TableCell></TableRow>
                                        )}

                                        {commissions.data.map((c) => (
                                            <TableRow key={c.id}>
                                                {bolehUbah && (
                                                    <TableCell>
                                                        {bisaSetujui(c) && (
                                                            <input type="checkbox" checked={pilih.includes(c.id)} onChange={() => toggle(c.id)} />
                                                        )}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-xs">{formatDateTime(c.created_at)}</TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="font-medium">{c.user?.nama || '—'}</div>
                                                    <div className="text-muted-foreground">
                                                        {c.payment?.package?.name || '—'}
                                                        {c.payment?.reference ? ` · ${c.payment.reference}` : ''}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {/* Situs tidak ada kolomnya di tabel komisi — ditelusuri lewat paket yang dibeli. */}
                                                    <Badge variant="outline">{c.situs || '—'}</Badge>
                                                </TableCell>
                                                <TableCell>{roleBadge(c.role)}</TableCell>
                                                <TableCell className="text-xs">
                                                    {c.affiliate ? `${c.affiliate.name} (${c.affiliate.code})` : <span className="text-orange-600 font-medium">belum ada</span>}
                                                    {c.source_affiliate && c.role === 'tier2' && (
                                                        <div className="text-[11px] text-muted-foreground">dari {c.source_affiliate.name}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">{formatRupiah(c.amount)}</TableCell>
                                                <TableCell className="text-xs">
                                                    {new Date(c.available_at) > new Date() ? (
                                                        <span className="flex items-center gap-1 text-amber-600">
                                                            <Clock className="w-3.5 h-3.5" /> {formatDateTime(c.available_at)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-700">lepas</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {statusBadge(c.status)}
                                                    {c.status_note && <div className="text-[11px] text-muted-foreground mt-1 max-w-[180px]">{c.status_note}</div>}
                                                </TableCell>
                                                {bolehUbah && (
                                                    <TableCell>
                                                        {['accrued', 'unassigned', 'approved', 'paid'].includes(c.status) && (
                                                            <div className="flex flex-col gap-1 items-end">
                                                                <TextInput
                                                                    className="block w-40 text-xs"
                                                                    placeholder="Alasan..."
                                                                    value={alasan[c.id] || ''}
                                                                    onChange={(e) => setAlasan({ ...alasan, [c.id]: e.target.value })}
                                                                />
                                                                <div className="flex gap-1">
                                                                    {['accrued', 'unassigned'].includes(c.status) && (
                                                                        <Button size="xs" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50"
                                                                            onClick={() => kirimAlasan(c, 'reject')}>Tolak</Button>
                                                                    )}
                                                                    {['approved', 'paid'].includes(c.status) && (
                                                                        <Button size="xs" variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50"
                                                                            onClick={() => kirimAlasan(c, 'reverse')}>Balikkan</Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        {ringkasan.unassigned > 0 && (
                            <Card>
                                <div className="flex items-center gap-3 text-sm">
                                    <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                                    <span className="flex-1">
                                        Ada <strong>{formatRupiah(ringkasan.unassigned)}</strong> komisi tier-2 tanpa penerima.
                                    </span>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={route(`admin.${routePrefix}affiliate-commission.unassigned`)}>Lihat baris tertahan</Link>
                                    </Button>
                                </div>
                            </Card>
                        )}

                        <PaginationDaisy data={commissions} />
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
