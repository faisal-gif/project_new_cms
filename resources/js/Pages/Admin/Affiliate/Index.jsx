import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatRupiah } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Check, Copy, Inbox, Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select'

const STATUS_FILTER = [
    { value: '', label: 'Semua Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' },
]

function statusBadge(status) {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-300 text-green-800">Active</Badge>
        case 'pending':
            return <Badge className="bg-yellow-300 text-yellow-800">Pending</Badge>
        case 'suspended':
            return <Badge variant="destructive">Suspended</Badge>
        default:
            return <Badge variant="secondary">Inactive</Badge>
    }
}

export default function Index({ affiliates, filters, referralBase, routePrefix = '' }) {
    // Permission bersufiks situs; slug-nya diturunkan dari prefix route.
    const situsSlug = routePrefix.replace('.', '')
    const { auth } = usePage().props
    const izin = auth.permissions || []
    const punya = (p) => izin.includes(p)

    const [search, setSearch] = useState(filters.search || '')
    const [status, setStatus] = useState(filters.status || '')
    const [disalin, setDisalin] = useState(null)
    const pertama = useRef(true)

    useEffect(() => {
        if (pertama.current) { pertama.current = false; return }
        const t = setTimeout(() => {
            router.get(route(`admin.${routePrefix}affiliate.index`), { search, status }, { preserveState: true, replace: true })
        }, 400)
        return () => clearTimeout(t)
    }, [search, status])

    const salin = (code) => {
        navigator.clipboard.writeText(referralBase + code)
        setDisalin(code)
        setTimeout(() => setDisalin(null), 2000)
    }

    const ubahStatus = (a, baru) => {
        router.patch(route(`admin.${routePrefix}affiliate.status`, a.id), { status: baru }, { preserveScroll: true })
    }

    return (
        <>
            <Head title="Program Afiliasi" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <h1 className="text-3xl font-bold text-foreground">Program Afiliasi</h1>
                                <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi' }]} />
                            </div>

                            <Card>
                                <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <TextInput
                                                className="block w-full pl-9"
                                                placeholder="Cari nama, kode, atau email..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full sm:w-52">
                                            <Select
                                                options={STATUS_FILTER}
                                                value={STATUS_FILTER.find((s) => s.value === status)}
                                                onChange={(v) => setStatus(v?.value ?? '')}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button asChild variant="outline" className="gap-2">
                                            <Link href={route(`admin.${routePrefix}affiliate.applications`)}>
                                                <Inbox className="w-4 h-4" /> Pengajuan
                                            </Link>
                                        </Button>
                                        {punya(`create afiliasi ${situsSlug}`) && (
                                            <Button asChild className="gap-2">
                                                <Link href={route(`admin.${routePrefix}affiliate.create`)}><Plus className="w-4 h-4" /> Tambah Afiliator</Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Upline</TableHead>
                                                <TableHead className="text-center">Direkrut</TableHead>
                                                <TableHead className="text-right">Tertahan</TableHead>
                                                <TableHead className="text-right">Siap Cair</TableHead>
                                                <TableHead className="text-right">Dibayar</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {affiliates.data.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                                                        Belum ada afiliator.
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {affiliates.data.map((a) => (
                                                <TableRow key={a.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{a.name}</div>
                                                        <div className="text-xs text-muted-foreground">{a.email || '—'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-mono text-xs tracking-wider">{a.code}</span>
                                                            <Button type="button" size="icon-sm" variant="ghost" onClick={() => salin(a.code)} title="Salin link referral">
                                                                {disalin === a.code ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs">{a.upline ? `${a.upline.name} (${a.upline.code})` : '—'}</TableCell>
                                                    <TableCell className="text-center">{a.referrals_count ?? 0}</TableCell>
                                                    <TableCell className="text-right text-xs">{formatRupiah(a.komisi_tertahan ?? 0)}</TableCell>
                                                    <TableCell className="text-right text-xs font-semibold text-emerald-700">{formatRupiah(a.komisi_siap_cair ?? 0)}</TableCell>
                                                    <TableCell className="text-right text-xs text-muted-foreground">{formatRupiah(a.komisi_dibayar ?? 0)}</TableCell>
                                                    <TableCell>{statusBadge(a.status)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-2">
                                                            {punya(`edit afiliasi ${situsSlug}`) && a.status !== 'active' && (
                                                                <Button size="xs" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50" onClick={() => ubahStatus(a, 'active')}>
                                                                    Setujui
                                                                </Button>
                                                            )}
                                                            {punya(`edit afiliasi ${situsSlug}`) && a.status === 'active' && (
                                                                <Button size="xs" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50" onClick={() => ubahStatus(a, 'suspended')}>
                                                                    Tangguhkan
                                                                </Button>
                                                            )}
                                                            {punya(`edit afiliasi ${situsSlug}`) && (
                                                                <Button asChild size="xs" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                                                    <Link href={route(`admin.${routePrefix}affiliate.edit`, a.id)}>Edit</Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>

                            <PaginationDaisy data={affiliates} />
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
