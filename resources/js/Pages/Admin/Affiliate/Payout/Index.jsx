import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate, formatRupiah } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus } from 'lucide-react'
import React from 'react'
import Select from 'react-select'

const STATUS = [
    { value: '', label: 'Semua Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
]

function badge(s) {
    if (s === 'paid') return <Badge className="bg-green-300 text-green-800">Paid</Badge>
    if (s === 'cancelled') return <Badge variant="secondary">Cancelled</Badge>
    return <Badge className="bg-yellow-300 text-yellow-800">Pending</Badge>
}

export default function Index({ payouts, filters, affiliates }) {
    const { auth } = usePage().props
    const punya = (p) => (auth.permissions || []).includes(p)

    const ubahFilter = (key, val) => {
        router.get(route('admin.affiliate-payout.index'), { ...filters, [key]: val ?? '' }, { preserveState: true, replace: true })
    }

    return (
        <>
            <Head title="Pencairan Afiliasi" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <h1 className="text-3xl font-bold text-foreground">Pencairan Afiliasi</h1>
                            <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi' }, { label: 'Pencairan' }]} />
                        </div>

                        <Card>
                            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                    <div className="w-full sm:w-64">
                                        <Select options={affiliates} isClearable placeholder="Semua afiliator"
                                            value={affiliates.find((a) => String(a.value) === String(filters.affiliate_id)) || null}
                                            onChange={(v) => ubahFilter('affiliate_id', v?.value)} />
                                    </div>
                                    <div className="w-full sm:w-48">
                                        <Select options={STATUS} value={STATUS.find((s) => s.value === (filters.status || ''))}
                                            onChange={(v) => ubahFilter('status', v?.value)} />
                                    </div>
                                </div>

                                {punya('create pencairan afiliasi') && (
                                    <Button asChild className="gap-2">
                                        <Link href={route('admin.affiliate-payout.create')}><Plus className="w-4 h-4" /> Buat Batch</Link>
                                    </Button>
                                )}
                            </div>
                        </Card>

                        <Card>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Afiliator</TableHead>
                                            <TableHead>Periode</TableHead>
                                            <TableHead className="text-center">Komisi</TableHead>
                                            <TableHead className="text-right">Nominal</TableHead>
                                            <TableHead>Rekening</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payouts.data.length === 0 && (
                                            <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Belum ada batch pencairan.</TableCell></TableRow>
                                        )}

                                        {payouts.data.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-mono text-xs">#{p.id}</TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="font-medium">{p.affiliate?.name || '—'}</div>
                                                    <div className="text-muted-foreground">{p.affiliate?.code}</div>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {p.period_start ? `${formatDate(p.period_start)} – ${formatDate(p.period_end)}` : 'semua'}
                                                </TableCell>
                                                <TableCell className="text-center">{p.commissions_count ?? 0}</TableCell>
                                                <TableCell className="text-right font-semibold">{formatRupiah(p.amount)}</TableCell>
                                                <TableCell className="text-xs">
                                                    <div>{p.bank_name || '—'}</div>
                                                    <div className="text-muted-foreground">{p.bank_account_number}</div>
                                                </TableCell>
                                                <TableCell>{badge(p.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild size="xs" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                                        <Link href={route('admin.affiliate-payout.show', p.id)}>Detail</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        <PaginationDaisy data={payouts} />
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
