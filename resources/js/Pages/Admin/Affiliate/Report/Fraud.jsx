import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router } from '@inertiajs/react'
import { ArrowLeftIcon, ShieldAlert } from 'lucide-react'
import React, { useState } from 'react'

/**
 * Daftar yang perlu dilihat manusia — bukan vonis. Dua pola yang disorot:
 * rasio menulis rendah, dan beberapa pendaftaran dengan pola email mirip.
 */
export default function Fraud({ rows, filters }) {
    const [min, setMin] = useState(filters.min_direkrut)

    return (
        <>
            <Head title="Deteksi Kecurangan" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <div className="flex items-center gap-3">
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={route('admin.affiliate-report.index')}><ArrowLeftIcon className="w-5 h-5" /></Link>
                                </Button>
                                <h1 className="text-3xl font-bold text-foreground">Deteksi Kecurangan</h1>
                            </div>
                            <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi' }, { label: 'Deteksi' }]} />
                        </div>

                        <Card>
                            <div className="flex items-start gap-3 text-sm">
                                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-muted-foreground">
                                    Ini <strong>bukan vonis</strong>. Daftar ini hanya menyorot afiliator yang pola rekrutannya
                                    layak diperiksa manusia: member yang direkrut hampir tidak pernah mengirim tulisan,
                                    atau beberapa pendaftaran memakai pola email yang mirip.
                                </p>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex gap-3 items-end">
                                <div>
                                    <InputLabel value="Minimal jumlah direkrut" className="mb-2 font-bold" />
                                    <TextInput type="number" min="1" className="w-40" value={min} onChange={(e) => setMin(e.target.value)} />
                                </div>
                                <Button onClick={() => router.get(route('admin.affiliate-report.fraud'), { min_direkrut: min }, { preserveState: true })}>
                                    Terapkan
                                </Button>
                            </div>
                        </Card>

                        <Card>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Afiliator</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-center">Direkrut</TableHead>
                                            <TableHead className="text-center">Pernah Menulis</TableHead>
                                            <TableHead className="text-center">Rasio</TableHead>
                                            <TableHead>Pola Email Mirip</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.length === 0 && (
                                            <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                                Tidak ada pola mencurigakan pada ambang ini.
                                            </TableCell></TableRow>
                                        )}

                                        {rows.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell>
                                                    <div className="font-medium">{r.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{r.code}</div>
                                                </TableCell>
                                                <TableCell className="text-xs">{r.status}</TableCell>
                                                <TableCell className="text-center">{r.direkrut}</TableCell>
                                                <TableCell className="text-center">{r.menulis}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={r.rasio_menulis < 30 ? 'bg-red-300 text-red-800' : 'bg-slate-200 text-slate-800'}>
                                                        {r.rasio_menulis}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {r.email_mirip >= 3
                                                        ? <span className="text-red-700">{r.email_mirip}× pola "{r.pola_mirip}"</span>
                                                        : <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild size="xs" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                                        <Link href={route('admin.affiliate.edit', r.id)}>Periksa</Link>
                                                    </Button>
                                                </TableCell>
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
