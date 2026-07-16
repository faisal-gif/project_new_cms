import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateLong, formatDateTime } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { FileText, Instagram, Settings2 } from 'lucide-react'
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
                        <div className="breadcrumbs text-sm">
                            <ul>
                                <li><a>Home</a></li>
                                <li>Kopi Times</li>
                                <li>Add-ons Berita</li>
                            </ul>
                        </div>
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
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th className="w-12 text-center">#</th>
                                        <th>Waktu Request</th>
                                        <th>Wartawan</th>
                                        <th>Judul Berita</th>
                                        <th>Jenis Request</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.data.map((req, index) => (
                                        <tr key={req.id}>
                                            <th className="text-center">
                                                {(requests.current_page - 1) * requests.per_page + index + 1}
                                            </th>
                                            <td>{formatDateLong(req.created_at)}</td>
                                            <td className="font-semibold text-gray-700">{req.wartawan?.nama || 'Unknown'}</td>
                                            <td>
                                                <div className="font-bold text-gray-900 max-w-xs truncate" title={req.news?.title}>
                                                    {req.news?.title || 'Berita Dihapus'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 font-medium">
                                                    {req.jenis_request === 'feed_instagram'
                                                        ? <><Instagram size={16} className="text-pink-500" /> Feed IG</>
                                                        : <><FileText size={16} className="text-blue-500" /> Ekoran</>
                                                    }
                                                </div>
                                            </td>
                                            <td className="text-center">{getStatusBadge(req.status)}</td>
                                            <td>
                                                <div className="flex justify-end gap-2">
                                                    <Link 
                                                        href={route('admin.kopi-times.addon-requests.show', req.id)}
                                                        className="btn btn-sm btn-primary btn-outline"
                                                    >
                                                        <Settings2 size={14} /> Proses
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.data.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-8 text-gray-500 bg-gray-50/50">
                                                Tidak ada antrean request ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* --- VERSI MOBILE (Cards) --- */}
                        <div className="md:hidden flex flex-col p-4 gap-4">
                            {requests.data.map((req) => (
                                <div key={req.id} className="border rounded-xl p-4 bg-base-100 shadow-sm flex flex-col gap-3">
                                    
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
                                            {req.jenis_request === 'feed_instagram'
                                                ? <><Instagram size={14} className="text-pink-500" /> Feed IG</>
                                                : <><FileText size={14} className="text-blue-500" /> Ekoran</>
                                            }
                                        </p>
                                    </div>

                                    {/* Card Footer: Action */}
                                    <div className="mt-2 pt-3 border-t border-base-200">
                                        <Link 
                                            href={route('admin.kopi-times.addon-requests.show', req.id)}
                                            className="btn btn-sm btn-primary w-full"
                                        >
                                            <Settings2 size={16} className="mr-1" /> Proses Request
                                        </Link>
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