import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Card from '@/Components/Card'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import React from 'react'

function statusBadge(status) {
    // 0 = menunggu review redaksi (pending). Selain itu sudah diproses.
    if (status === 0 || status === '0') {
        return <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-300">Menunggu Review</Badge>;
    }
    return <Badge className="bg-green-200 text-green-800 hover:bg-green-300">Diproses</Badge>;
}

function Submissions({ event, submissions }) {
    return (
        <>
            <Head title={`Kiriman — ${event.name}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Kiriman Event</h1>
                                    <p className="text-sm text-foreground/60 mt-1">{event.name}</p>
                                </div>
                                <Button asChild variant="ghost" size="sm" className="gap-1.5">
                                    <Link href={route('admin.kopi-times.events.index')}>
                                        <ArrowLeft className="w-4 h-4" /> Kembali
                                    </Link>
                                </Button>
                            </div>

                            <Card>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border">
                                                <TableHead className="w-12 text-center">#</TableHead>
                                                <TableHead>Judul</TableHead>
                                                <TableHead>Narasumber</TableHead>
                                                <TableHead>Kota</TableHead>
                                                <TableHead>Kontak</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions.data.map((item, index) => {
                                                const from = submissions.from ?? 1;
                                                return (
                                                    <TableRow key={item.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                                                        <TableCell className="text-xs text-foreground/50 py-4 text-center">{from + index}</TableCell>
                                                        <TableCell className="py-4 max-w-xs"><span className="text-sm font-semibold line-clamp-2" title={item.title}>{item.title}</span></TableCell>
                                                        <TableCell className="py-4 text-sm">{item.narsum || '-'}</TableCell>
                                                        <TableCell className="py-4 text-sm">{item.city || '-'}</TableCell>
                                                        <TableCell className="py-4 text-sm">{item.contact || '-'}</TableCell>
                                                        <TableCell className="py-4 text-center">{statusBadge(item.status)}</TableCell>
                                                        <TableCell className="py-4 text-sm">{item.created ? formatDateTime(item.created) : '-'}</TableCell>
                                                        <TableCell className="py-4 text-right">
                                                            <Button asChild size="sm" variant="ghost" className="gap-1.5">
                                                                <Link href={route('admin.kopi-times.news.publish', item.id)}>
                                                                    <ClipboardCheck className="w-3.5 h-3.5" /> Review
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {submissions.data.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan="8" className="text-center py-8 text-gray-500 bg-muted/20">
                                                        Belum ada kiriman untuk event ini.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>

                            {submissions.data.length > 0 && <PaginationDaisy data={submissions} />}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Submissions
