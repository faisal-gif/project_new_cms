import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate, formatDateTime, formatRupiah } from '@/Utils/formatter'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { AlertTriangle, ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react'
import React from 'react'

export default function Show({ payout, jumlahKomisi, selisih, routePrefix = '' }) {
    // Permission bersufiks situs; slug-nya diturunkan dari prefix route.
    const situsSlug = routePrefix.replace('.', '')
    const { auth } = usePage().props
    const bolehUbah = (auth.permissions || []).includes(`edit pencairan afiliasi ${situsSlug}`)

    const lunas = useForm({ reference: '', proof: null, paid_at: '' })
    const batal = useForm({ note: '' })

    const tandaiLunas = (e) => {
        e.preventDefault()
        lunas.post(route(`admin.${routePrefix}affiliate-payout.mark-paid`, payout.id), { preserveScroll: true, forceFormData: true })
    }

    const batalkan = (e) => {
        e.preventDefault()
        batal.patch(route(`admin.${routePrefix}affiliate-payout.cancel`, payout.id), { preserveScroll: true })
    }

    const badge = payout.status === 'paid'
        ? <Badge className="bg-green-300 text-green-800">Paid</Badge>
        : payout.status === 'cancelled'
            ? <Badge variant="secondary">Cancelled</Badge>
            : <Badge className="bg-yellow-300 text-yellow-800">Pending</Badge>

    return (
        <>
            <Head title={`Batch Pencairan #${payout.id}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <div className="flex items-center gap-3">
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={route(`admin.${routePrefix}affiliate-payout.index`)}><ArrowLeftIcon className="w-5 h-5" /></Link>
                                </Button>
                                <h1 className="text-3xl font-bold text-foreground">Batch #{payout.id}</h1>
                                {badge}
                            </div>
                            <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi' }, { label: 'Pencairan' }, { label: `#${payout.id}` }]} />
                        </div>

                        {/* Invariant 1: amount batch harus sama dengan jumlah komisinya. */}
                        {selisih !== 0 && (
                            <Card>
                                <div className="flex items-start gap-3 text-sm text-red-700">
                                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Total batch tidak cocok dengan jumlah komisinya.</strong><br />
                                        Batch {formatRupiah(payout.amount)} · jumlah komisi {formatRupiah(jumlahKomisi)} · selisih {formatRupiah(selisih)}.
                                        Jangan tandai lunas sebelum ini diselidiki.
                                    </div>
                                </div>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title={<span className="text-lg font-semibold">Afiliator</span>}>
                                <div className="text-sm space-y-1 mt-3">
                                    <div className="font-medium">{payout.affiliate?.name}</div>
                                    <div className="text-muted-foreground font-mono text-xs">{payout.affiliate?.code}</div>
                                    <div className="text-muted-foreground">{payout.affiliate?.email || '—'}</div>
                                </div>
                            </Card>

                            <Card title={<span className="text-lg font-semibold">Rekening saat batch dibuat</span>}>
                                <div className="text-sm space-y-1 mt-3">
                                    <div>{payout.bank_name || '—'}</div>
                                    <div className="font-mono">{payout.bank_account_number || '—'}</div>
                                    <div className="text-muted-foreground">{payout.bank_account_name || '—'}</div>
                                    <div className="text-xs text-muted-foreground pt-1">Metode: {payout.method}</div>
                                </div>
                            </Card>

                            <Card title={<span className="text-lg font-semibold">Nilai</span>}>
                                <div className="text-sm space-y-1 mt-3">
                                    <div className="text-2xl font-bold">{formatRupiah(payout.amount)}</div>
                                    <div className="text-muted-foreground">{payout.commissions?.length ?? 0} komisi</div>
                                    <div className="text-xs text-muted-foreground">
                                        Periode: {payout.period_start ? `${formatDate(payout.period_start)} – ${formatDate(payout.period_end)}` : 'semua'}
                                    </div>
                                    {payout.paid_at && <div className="text-xs text-green-700">Lunas {formatDateTime(payout.paid_at)}</div>}
                                </div>
                            </Card>
                        </div>

                        {payout.status === 'pending' && bolehUbah && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card title={<span className="text-lg font-semibold">Tandai Lunas</span>}>
                                    <form onSubmit={tandaiLunas} className="space-y-3 mt-4">
                                        <div>
                                            <InputLabel value="Nomor Referensi Transfer" className="mb-2 font-bold" />
                                            <TextInput className="block w-full" value={lunas.data.reference}
                                                onChange={(e) => lunas.setData('reference', e.target.value)} />
                                            <InputError message={lunas.errors.reference} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Bukti Transfer (opsional)" className="mb-2 font-bold" />
                                            <input type="file" accept="image/*"
                                                onChange={(e) => lunas.setData('proof', e.target.files?.[0] ?? null)}
                                                className="block w-full text-sm" />
                                            <InputError message={lunas.errors.proof} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Tanggal Lunas (kosong = sekarang)" className="mb-2 font-bold" />
                                            <TextInput type="datetime-local" className="block w-full" value={lunas.data.paid_at}
                                                onChange={(e) => lunas.setData('paid_at', e.target.value)} />
                                        </div>
                                        <InputError message={lunas.errors.error} />
                                        <Button type="submit" disabled={lunas.processing || selisih !== 0} className="w-full">
                                            Tandai Lunas
                                        </Button>
                                    </form>
                                </Card>

                                <Card title={<span className="text-lg font-semibold">Batalkan Batch</span>}>
                                    <form onSubmit={batalkan} className="space-y-3 mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Komisinya dilepas kembali ke status approved dan bisa dimasukkan batch lain.
                                        </p>
                                        <InputTextarea label="Alasan pembatalan" value={batal.data.note}
                                            onChange={(e) => batal.setData('note', e.target.value)} />
                                        <InputError message={batal.errors.note} />
                                        <InputError message={batal.errors.error} />
                                        <Button type="submit" variant="outline" disabled={batal.processing}
                                            className="w-full border-red-500 text-red-600 hover:bg-red-50">
                                            Batalkan Batch
                                        </Button>
                                    </form>
                                </Card>
                            </div>
                        )}

                        {payout.status === 'paid' && payout.proof_path && (
                            <Card>
                                <a href={`/storage/${payout.proof_path}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary underline">
                                    <ExternalLinkIcon className="w-4 h-4" /> Lihat bukti transfer
                                </a>
                                {payout.reference && <div className="text-sm mt-2">Referensi: <span className="font-mono">{payout.reference}</span></div>}
                            </Card>
                        )}

                        <Card title={<span className="text-lg font-semibold">Komisi dalam batch ini</span>}>
                            <div className="overflow-x-auto mt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Pos</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Nominal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(payout.commissions || []).map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell className="text-xs">{formatDateTime(c.created_at)}</TableCell>
                                                <TableCell className="text-xs">{c.user?.nama || '—'}</TableCell>
                                                <TableCell className="text-xs uppercase">{c.role}</TableCell>
                                                <TableCell className="text-xs">{c.status}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(c.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
