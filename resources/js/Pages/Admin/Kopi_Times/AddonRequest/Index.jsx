import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateLong, formatDateTime } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { FileText, Instagram, MessageCircle, Settings2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export default function Index({ requests, filters }) {
    const [jenis, setJenis] = useState(() => filters.jenis || '');
    const [status, setStatus] = useState(() => filters.status || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.kopi-times.addon-requests.index');

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        router.get(
            INDEX_ROUTE,
            { jenis, status, page: 1 },
            { preserveState: true, replace: true }
        );
    }, [jenis, status]);

    function getStatusBadge(statusValue) {
        switch (statusValue) {
            case 'completed': return <Badge className="bg-green-300 text-green-800 border-none">Completed</Badge>;
            case 'processing': return <Badge className="bg-yellow-300 text-yellow-800 border-none">Processing</Badge>;
            case 'rejected': return <Badge className="bg-red-300 text-red-800 border-none">Rejected</Badge>;
            case 'pending': default: return <Badge variant="secondary">Pending</Badge>;
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Add-ons" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
                        <h1 className="text-3xl font-bold text-foreground">Antrean Feed & Ekoran</h1>
                        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Kopi Times' }, { label: 'Add-ons Berita' }]} />
                    </div>

                    {/* Toolbar / Filters */}
                    <Card>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <div className="w-full md:w-48">
                                <InputSelect value={jenis} onChange={(e) => setJenis(e.target.value)}
                                    options={[
                                        { label: "Semua Jenis", value: "" },
                                        { label: "Feed Instagram", value: "feed_instagram" },
                                        { label: "Ekoran", value: "ekoran" },
                                        { label: "WA Channel", value: "wa_channel" },
                                    ]}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <InputSelect value={status} onChange={(e) => setStatus(e.target.value)}
                                    options={[
                                        { label: "Semua Status", value: "" },
                                        { label: "Pending", value: "pending" },
                                        { label: "Processing", value: "processing" },
                                        { label: "Completed", value: "completed" },
                                        { label: "Rejected", value: "rejected" },
                                    ]}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-0 overflow-hidden">

                        {/* --- VERSI DESKTOP (Tabel) --- */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 text-center">#</TableHead>
                                        <TableHead>Waktu Request</TableHead>
                                        <TableHead>Wartawan</TableHead>
                                        <TableHead>Judul Berita</TableHead>
                                        <TableHead>Jenis Request</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.data.map((req, index) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="text-center">
                                                {(requests.current_page - 1) * requests.per_page + index + 1}
                                            </TableCell>
                                            <TableCell>{formatDateLong(req.created_at)}</TableCell>
                                            <TableCell className="font-semibold text-gray-700">{req.wartawan?.nama || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <div className="font-bold text-gray-900 max-w-xs truncate" title={req.news?.title}>
                                                    {req.news?.title || 'Berita Dihapus'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 font-medium">
                                                    {
                                                        {
                                                            feed_instagram: <><Instagram size={16} className="text-pink-500" /> Feed IG</>,
                                                            ekoran: <><FileText size={16} className="text-blue-500" /> Ekoran</>,
                                                            wa_channel: <><MessageCircle size={16} className="text-green-500" /> WA Channel</>
                                                        }[req.jenis_request]
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">{getStatusBadge(req.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                                        <Link href={route('admin.kopi-times.addon-requests.show', req.id)}>
                                                            <Settings2 size={14} /> Proses
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {requests.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan="7" className="text-center py-8 text-gray-500 bg-gray-50/50">
                                                Tidak ada antrean request ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* --- VERSI MOBILE (Cards) --- */}
                        <div className="md:hidden flex flex-col p-4 gap-4">
                            {requests.data.map((req) => (
                                <div key={req.id} className="border rounded-xl p-4 bg-background shadow-sm flex flex-col gap-3">

                                    {/* Card Header: Judul & Status */}
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="font-bold text-base leading-tight line-clamp-2">
                                            {req.news?.title || 'Berita Dihapus'}
                                        </div>
                                        <div className="shrink-0">
                                            {getStatusBadge(req.status)}
                                        </div>
                                    </div>

                                    {/* Card Body: Info Detail */}
                                    <div className="text-sm space-y-1.5 text-muted-foreground mt-1">
                                        <p>
                                            <span className="font-medium text-foreground mr-1">Wartawan:</span>
                                            {req.wartawan?.nama || 'Unknown'}
                                        </p>
                                        <p>
                                            <span className="font-medium text-foreground mr-1">Waktu:</span>
                                            {formatDateLong(req.created_at)}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <span className="font-medium text-foreground mr-1">Jenis:</span>
                                            {
                                                {
                                                    feed_instagram: <><Instagram size={14} className="text-pink-500" /> Feed IG</>,
                                                    ekoran: <><FileText size={14} className="text-blue-500" /> Ekoran</>,
                                                    wa_channel: <><MessageCircle size={14} className="text-green-500" /> WA Channel</>
                                                }[req.jenis_request]
                                            }
                                        </p>
                                    </div>

                                    {/* Card Footer: Action */}
                                    <div className="mt-2 pt-3 border-t border-border">
                                        <Button asChild size="sm" className="w-full">
                                            <Link href={route('admin.kopi-times.addon-requests.show', req.id)}>
                                                <Settings2 size={16} className="mr-1" /> Proses Request
                                            </Link>
                                        </Button>
                                    </div>

                                </div>
                            ))}
                            {requests.data.length === 0 && (
                                <div className="text-center py-8 text-gray-500 bg-gray-50/50 rounded-xl border">
                                    Tidak ada antrean request ditemukan.
                                </div>
                            )}
                        </div>

                    </Card>

                    {/* Pagination */}
                    {requests.data.length > 0 && <PaginationDaisy data={requests} />}
                </div>
            </div>
        </AuthenticatedLayout>
    )
}