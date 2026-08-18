import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Select from "react-select";
import { Plus, Search } from 'lucide-react';

// Components
import Card from '@/Components/Card';
import InputWithPrefix from '@/Components/InputWithPrefix';
import PaginationDaisy from '@/Components/PaginationDaisy';
import { Badge } from '@/Components/ui/badge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDateTime, formatDateTimeLong } from '@/Utils/formatter';
import InputSelect from '@/Components/InputSelect';

/* ==============================================================================
   HELPER FUNCTIONS 
   (Dipindah ke luar agar tidak re-render di setiap lifecycle komponen)
============================================================================== */
const getStatusBadge = (status) => {
    switch (String(status).toLowerCase()) {
        case "pending":
        case "0":
            return <Badge variant="secondary">Pending</Badge>;
        case "review":
        case "2":
            return <Badge className="bg-yellow-300 text-yellow-700 hover:bg-yellow-400">Review</Badge>;
        case "on pro":
        case "3":
            return <Badge variant="destructive">OnPro</Badge>;
        case "publish":
        case "1":
            return <Badge className="bg-green-300 text-green-700 hover:bg-green-400">Publish</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

const getDistributionBadge = (status) => {
    switch (Number(status)) {
        case 2:
            return <Badge className="badge bg-emerald-500 text-white border-none">Sudah di Semua Jaringan</Badge>;
        case 1:
            return <Badge className="badge bg-sky-500 text-white border-none">Tayang Parsial</Badge>;
        case 0:
        default:
            return <Badge className="badge bg-secondary text-gray-500 border-none">Draft / Belum Tayang</Badge>;
    }
};

/* ==============================================================================
   SUB-COMPONENTS (Idealnya bisa dipisah ke file terpisah di folder components)
============================================================================== */

// --- 1. Mobile Card View ---
const NewsMobileCard = ({ item, hasPermission }) => (
    <div className="card bg-background border border-border shadow-sm overflow-hidden">
        <div className="flex flex-col p-4 sm:p-5 gap-0">
            {/* Header: Title */}
            <div className="flex justify-between items-start gap-3 mb-2">
                <h3 className="text-xs font-medium leading-snug whitespace-normal break-words">
                    {item.title}
                </h3>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/70 mb-4">
                <span className="font-semibold text-primary">{item.writer?.name || 'Unknown'}</span>
                <span>•</span>
                <span>{formatDateTimeLong(item.created_at)}</span>
            </div>

            {/* Integration Status */}
            <div className="bg-muted/50 rounded-lg p-3 flex flex-col gap-4 mb-4">

                {/* Nasional */}
                {hasPermission('import nasional news master') && (
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-foreground/80">Distribusi Nasional</span>
                        {item.news_nasional ? (
                            <div className="flex justify-between items-center bg-background p-2 rounded border border-border">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Terindeks
                                    </span>
                                    <span className="text-[11px] text-foreground/70 truncate max-w-[150px]">
                                        {item.news_nasional.kanal?.catnews_title || 'Nasional'}
                                    </span>
                                    <span className="text-[10px] text-foreground/70">
                                        {formatDateTimeLong(item.news_nasional.news_datepub)}
                                    </span>
                                </div>
                                <Button asChild size="xs" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                    <Link href={route('admin.nasional.news.edit', item.news_nasional.news_id)}>Edit</Link>
                                </Button>
                            </div>
                        ) : (
                            <Button asChild size="xs" variant="outline" className="self-start border-primary text-primary hover:bg-primary/10">
                                <Link href={route('admin.news.import.nasional', item.is_code)}>+ Nasional</Link>
                            </Button>
                        )}
                    </div>
                )}

                <div className="border-t border-border"></div>

                {/* Daerah */}
                {hasPermission('import daerah news master') && (
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-foreground/80">Distribusi Daerah</span>
                        {item.news_daerah ? (
                            <div className="flex justify-between items-center bg-background p-2 rounded border border-border">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Terindeks
                                    </span>
                                    <span className="text-[11px] text-foreground/70 truncate max-w-[150px]">
                                        {item.news_daerah.kanal?.name || 'Daerah'}
                                    </span>
                                    <span className="text-[10px] text-foreground/70">
                                        {formatDateTimeLong(item.news_daerah.datepub)}
                                    </span>
                                </div>
                                <Button asChild size="xs" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                    <Link href={route('admin.daerah.news.edit', item.news_daerah.id)}>Edit</Link>
                                </Button>
                            </div>
                        ) : (
                            <Button asChild size="xs" variant="outline" className="self-start border-primary text-primary hover:bg-primary/10">
                                <Link href={route('admin.news.import.daerah', item.is_code)}>+ Daerah</Link>
                            </Button>
                        )}
                    </div>
                )}

            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-foreground/70 mb-2">
                {getDistributionBadge(item.distribution_status)}
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-2">
                <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link href={route('admin.news.show', item.id)}>Detail Berita</Link>
                </Button>
            </div>
        </div>
    </div>
);

// --- 2. Desktop Table Row View ---
const NewsDesktopRow = ({ item, hasPermission }) => (
    <TableRow>
        <TableCell>{item.id}</TableCell>
        <TableCell>{item.writer?.name || 'Unknown'}</TableCell>
        <TableCell>
            <p className="text-xs font-medium leading-snug whitespace-normal break-words" title={item.title}>{item.title}</p>
            <p className="text-xs text-foreground/70">
                {formatDateTimeLong(item.created_at)}
            </p>
        </TableCell>

        {/* Kolom Nasional */}
        {hasPermission('import nasional news master') && (
            <TableCell>
                {item.news_nasional ? (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-600">Terindeks</span>
                            <Button asChild size="xs" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                <Link href={route('admin.nasional.news.edit', item.news_nasional.news_id)}>Edit</Link>
                            </Button>
                        </div>
                        <span className="text-[11px] leading-tight text-foreground/80 truncate max-w-[150px]">
                            {item.news_nasional.news_title || '-'}
                        </span>
                        <span className="text-[10px] text-foreground/70">
                            {formatDateTimeLong(item.news_nasional.news_datepub)} {/* Tanggal publish nasional */}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] italic text-muted-foreground">{item.news_nasional.kanal?.catnews_title || 'Nasional'}</span>
                            {getStatusBadge(item.news_nasional.news_status)}
                        </div>
                    </div>
                ) : (
                    <Button asChild size="xs" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        <Link href={route('admin.news.import.nasional', item.is_code)}>+ Nasional</Link>
                    </Button>
                )}
            </TableCell>
        )}

        {/* Kolom Daerah */}
        {hasPermission('import daerah news master') && (
            <TableCell>
                {item.news_daerah ? (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-600">Terindeks</span>
                            <Button asChild size="xs" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                <Link href={route('admin.daerah.news.edit', item.news_daerah.id)}>Edit</Link>
                            </Button>
                        </div>
                        <span className="text-[11px] leading-tight text-foreground/80 truncate max-w-[150px]" title={item.news_daerah.title}>
                            {item.news_daerah.title}
                        </span>
                        <span className="text-[10px] text-foreground/70">
                            {formatDateTimeLong(item.news_daerah.datepub)} {/* Tanggal publish daerah */}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] italic text-muted-foreground">{item.news_daerah.kanal?.name}</span>
                            {getStatusBadge(item.news_daerah.status)}
                        </div>
                    </div>
                ) : (
                    <Button asChild size="xs" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        <Link href={route('admin.news.import.daerah', item.is_code)}>+ Daerah</Link>
                    </Button>
                )}
            </TableCell>
        )}

        <TableCell className="text-center">
            {getDistributionBadge(item.distribution_status)}
        </TableCell>

        {hasPermission('edit news master') && (
            <TableCell>
                <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        <Link href={route('admin.news.show', item.id)}>Detail</Link>
                    </Button>
                </div>
            </TableCell>
        )}
    </TableRow>
);


/* ==============================================================================
   MAIN COMPONENT
============================================================================== */
export default function Index({ news, writers, kanals, filters }) {
    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];
    const isFirst = useRef(true);

    // State Filters
    const [search, setSearch] = useState(() => filters.search || '');
    const [writer, setWriter] = useState(() => filters.writer || '');
    const [status, setStatus] = useState(() => filters.distribution_status || '');

    const INDEX_ROUTE = route('admin.news.index');

    // Helper: Cek Permisi User
    const hasPermission = (permissions) => {
        if (Array.isArray(permissions)) {
            return permissions.some(permission => userPermissions.includes(permission));
        }
        return userPermissions.includes(permissions);
    };

    // Effect: Handle Pencarian & Filtering (Debounced)
    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                INDEX_ROUTE,
                { search, writer, distribution_status: status, page: 1 },
                { preserveState: true, replace: true }
            );
        }, search !== filters.search ? 400 : 0); // Hanya debounce untuk ketikan search

        return () => clearTimeout(timeout);
    }, [search, writer, status]);

    // Handle Reset Filter
    const handleReset = () => {
        setSearch('');
        setWriter('');
        setStatus('');
        router.get(INDEX_ROUTE, { search: '', writer: '', distribution_status: '', page: 1 }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="News Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header & Breadcrumbs */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h1 className="text-3xl font-bold text-foreground">Daftar News</h1>
                        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'News' }]} />
                    </div>

                    {/* Tombol Aksi Utama */}
                    {hasPermission('create news master') && (
                        <div className="flex justify-end md:justify-start">
                            <Button asChild className="rounded-lg">
                                <Link href={route('admin.news.create')}>
                                    <Plus size={16} /> Tambah News
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Filter Section */}
                    <Card>
                        <div className="flex flex-col md:flex-row justify-between gap-4 w-full md:w-auto items-center">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                                <div className="w-full md:w-96">
                                    <InputWithPrefix
                                        prefix={<Search size={16} />}
                                        placeholder="Search Title and Id..."
                                        className="w-full"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-48 z-20">
                                    <Select
                                        options={writers}
                                        value={writers.find(w => w.value === writer) || null}
                                        placeholder="Penulis"
                                        onChange={(e) => setWriter(e ? e.value : '')}
                                        isClearable
                                    />
                                </div>
                                <div className="w-full md:w-48 z-20">
                                    <InputSelect
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full"
                                        options={[
                                            { label: "Semua Status", value: "" },
                                            { label: "Belum Tayang", value: "0" },
                                            { label: "Tayang Parsial", value: "1" },
                                            { label: "Tayang Semua", value: "2" },
                                        ]}
                                    />
                                </div>
                            </div>


                            <Button type="button" variant="secondary" className="w-full md:w-auto md:ml-2" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </Card>

                    {/* Content Section (Table & Cards) */}
                    <Card>
                        {/* Mobile View */}
                        <div className="md:hidden flex flex-col gap-4">
                            {news.data.length > 0 ? (
                                news.data.map((n) => (
                                    <NewsMobileCard key={n.id} item={n} hasPermission={hasPermission} />
                                ))
                            ) : (
                                <div className="text-center py-8 text-foreground/50">Data tidak ditemukan.</div>
                            )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto min-h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Penulis</TableHead>
                                        <TableHead className="w-1/3">Judul & Tanggal Masuk</TableHead>
                                        {hasPermission('import nasional news master') && <TableHead>Nasional</TableHead>}
                                        {hasPermission('import daerah news master') && <TableHead>Daerah</TableHead>}
                                        <TableHead className="text-center">Status Distribusi</TableHead>
                                        {hasPermission('edit news master') && <TableHead className="text-right">Action</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {news.data.length > 0 ? (
                                        news.data.map((n) => (
                                            <NewsDesktopRow key={n.id} item={n} hasPermission={hasPermission} />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-foreground/50">
                                                Data tidak ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    <PaginationDaisy data={news} />

                </div>
            </div>
        </AuthenticatedLayout>
    );
}