import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Button } from '@/Components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime, formatRupiah } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { AlertTriangle, ArrowLeftIcon } from 'lucide-react'
import React, { useState } from 'react'
import Select from 'react-select'

/**
 * Baris tier-2 tanpa upline. Uangnya belum jadi milik siapa pun — manajemen memutuskan
 * penerimanya belakangan. Tanpa layar ini, uang tertahan tidak terlihat siapa pun.
 */
export default function Unassigned({ commissions, affiliates, total, routePrefix = '' }) {
    // Permission bersufiks situs; slug-nya diturunkan dari prefix route.
    const situsSlug = routePrefix.replace('.', '')
    const { auth } = usePage().props
    const bolehUbah = (auth.permissions || []).includes(`edit komisi afiliasi ${situsSlug}`)
    const [pilihan, setPilihan] = useState({})

    const tetapkan = (c) => {
        const id = pilihan[c.id]
        if (!id) return
        router.patch(route(`admin.${routePrefix}affiliate-commission.assign`, c.id), { affiliate_id: id }, { preserveScroll: true })
    }

    return (
        <>
            <Head title="Komisi Tertahan" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <div className="flex items-center gap-3">
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={route(`admin.${routePrefix}affiliate-commission.index`)}><ArrowLeftIcon className="w-5 h-5" /></Link>
                                </Button>
                                <h1 className="text-3xl font-bold text-foreground">Komisi Tertahan</h1>
                            </div>
                            <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi' }, { label: 'Tertahan' }]} />
                        </div>

                        <Card>
                            <div className="flex items-start gap-3 text-sm">
                                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-semibold">Total tertahan: {formatRupiah(total)}</div>
                                    <p className="text-muted-foreground mt-1">
                                        Baris tier-2 yang perekrutnya belum punya upline. Setelah penerima ditetapkan,
                                        baris kembali ke alur normal dan menunggu persetujuan.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Perekrut Asal</TableHead>
                                            <TableHead className="text-right">Nominal</TableHead>
                                            {bolehUbah && <TableHead>Tetapkan Penerima</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {commissions.data.length === 0 && (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                Tidak ada komisi tertahan.
                                            </TableCell></TableRow>
                                        )}

                                        {commissions.data.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell className="text-xs">{formatDateTime(c.created_at)}</TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="font-medium">{c.user?.nama || '—'}</div>
                                                    <div className="text-muted-foreground">{c.payment?.reference || '—'}</div>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {c.source_affiliate ? `${c.source_affiliate.name} (${c.source_affiliate.code})` : '—'}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">{formatRupiah(c.amount)}</TableCell>
                                                {bolehUbah && (
                                                    <TableCell>
                                                        <div className="flex gap-2 items-center min-w-[280px]">
                                                            <div className="flex-1">
                                                                <Select
                                                                    options={affiliates}
                                                                    placeholder="Pilih penerima..."
                                                                    value={affiliates.find((a) => a.value === pilihan[c.id]) || null}
                                                                    onChange={(v) => setPilihan({ ...pilihan, [c.id]: v?.value })}
                                                                />
                                                            </div>
                                                            <Button size="sm" disabled={!pilihan[c.id]} onClick={() => tetapkan(c)}>Tetapkan</Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        <PaginationDaisy data={commissions} />
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
