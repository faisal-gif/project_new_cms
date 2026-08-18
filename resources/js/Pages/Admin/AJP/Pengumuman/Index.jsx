import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter' // Menggunakan formatDateTime karena tipe datanya datetime
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Pencil, Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ pengumuman, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.ajp.pengumuman.index');

    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];

    // Helper function untuk cek permission
    const hasPermission = (permissions) => {
        if (Array.isArray(permissions)) {
            return permissions.some(permission => userPermissions.includes(permission));
        }
        return userPermissions.includes(permissions);
    };

    useEffect(() => {
        // Skip initial load
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        let timeout = null;

        // Search → debounce
        if (search !== filters.search) {
            timeout = setTimeout(() => {
                router.get(
                    INDEX_ROUTE,
                    { search, status, page: 1 },
                    { preserveState: true, replace: true }
                );
            }, 400);
        }
        // Status → langsung request
        else {
            router.get(
                INDEX_ROUTE,
                { search, status, page: 1 },
                { preserveState: true, replace: true }
            );
        }

        return () => timeout && clearTimeout(timeout);
    }, [search, status]);

    // Badge untuk Status Aktif/Tidak
    function getStatusBadge(isActive) {
        // Handle boolean true/false atau integer 1/0
        if (isActive === true || isActive === 1 || isActive === '1') {
            return <Badge className="bg-green-300 text-green-700 hover:bg-green-400">Aktif</Badge>;
        }
        return <Badge variant="secondary">Tidak Aktif</Badge>;
    }

    // Badge untuk Kategori Urgent/Info
    function getKategoriBadge(kategori) {
        if (kategori === 'urgent') {
            return <Badge className="bg-red-200 text-red-800 hover:bg-red-300">Urgent</Badge>;
        }
        return <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">Info Biasa</Badge>;
    }

    return (
        <>
            <Head title="Manajemen Pengumuman" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-row justify-between items-center'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Pengumuman</h1>
                                </div>
                                {/* end Header */}

                                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'AJP' }, { label: 'Pengumuman' }]} />
                            </div>

                            {/* Start Head (Toolbar) */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    {/* Button Tambah Pengumuman */}
                                    {/* Pastikan nama permission disesuaikan dengan yang ada di databasemu */}
                                    {hasPermission('create pengumuman ajp') && (
                                        <Button asChild className="rounded-lg">
                                            <Link href={route('admin.ajp.pengumuman.create')}>
                                                <Plus size={16} /> Buat Pengumuman
                                            </Link>
                                        </Button>
                                    )}

                                    {/* Field Search And Filter */}
                                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                        <div className="w-full md:w-80">
                                            <InputWithPrefix
                                                prefix={<Search size={16} />}
                                                placeholder="Cari Judul Pengumuman..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-48">
                                            <InputSelect
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                options={[
                                                    { label: "Semua Status", value: "" },
                                                    { label: "Aktif Tayang", value: "1" },
                                                    { label: "Tidak Aktif", value: "0" },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </Card>
                            {/* End Head */}

                            {/* Start Table */}
                            <Card>
                                {/* MOBILE VERSION (Card Mode) */}
                                <div className="md:hidden flex flex-col gap-4">
                                    {pengumuman.data.map((item) => (
                                        <div key={item.id} className="border rounded-xl p-4 bg-background shadow-sm">
                                            {/* Header (Judul + Status) */}
                                            <div className="flex justify-between items-start mb-3 gap-2">
                                                <div>
                                                    <p className="font-semibold text-base line-clamp-2">{item.title}</p>
                                                    <div className="mt-1">{getKategoriBadge(item.kategori)}</div>
                                                </div>
                                                {getStatusBadge(item.is_active)}
                                            </div>

                                            {/* Detail Jadwal */}
                                            <div className="text-sm space-y-1 bg-muted/50 p-2 rounded-lg mt-3">
                                                <p><span className="font-medium text-foreground/70">Mulai:</span> {item.start_date ? formatDateTime(item.start_date) : 'Langsung Tayang'}</p>
                                                <p><span className="font-medium text-foreground/70">Selesai:</span> {item.end_date ? formatDateTime(item.end_date) : 'Selamanya'}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-end text-xs pt-3 mt-3 border-t">
                                                {hasPermission('edit pengumuman ajp') && (
                                                    <Button asChild size="xs" variant="outline" className="gap-1 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                                        <Link href={route('admin.ajp.pengumuman.edit', item.id)}>
                                                            <Pencil className="w-3 h-3" /> Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {pengumuman.data.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">Tidak ada data pengumuman.</div>
                                    )}
                                </div>

                                {/* DESKTOP VERSION (Table Mode) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border">
                                                <TableHead className="w-12 text-center">#</TableHead>
                                                <TableHead>Pengumuman</TableHead>
                                                <TableHead>Kategori</TableHead>
                                                <TableHead>Jadwal Tayang</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pengumuman.data.map((item, index) => {
                                                const from = pengumuman.from ?? 1;
                                                return (
                                                    <TableRow key={item.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                                                        <TableCell className="text-xs text-foreground/50 align-top py-4 text-center">{from + index}</TableCell>

                                                        {/* Info Pengumuman (Judul & Cuplikan Isi) */}
                                                        <TableCell className="py-4 align-top max-w-xs">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-foreground line-clamp-1" title={item.title}>
                                                                    {item.title}
                                                                </span>
                                                                <span className="text-xs text-foreground/60 line-clamp-2 mt-1" title={item.content}>
                                                                    {item.content}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        {/* Kategori */}
                                                        <TableCell className="py-4 align-top">
                                                            {getKategoriBadge(item.kategori)}
                                                        </TableCell>

                                                        {/* Jadwal Tayang */}
                                                        <TableCell className="py-4 align-top text-sm">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-foreground/80">
                                                                    <span className="text-xs font-semibold uppercase text-foreground/50 block">Mulai</span>
                                                                    {item.start_date ? formatDateTime(item.start_date) : 'Langsung tayang'}
                                                                </span>
                                                                <span className="text-foreground/80 mt-1">
                                                                    <span className="text-xs font-semibold uppercase text-foreground/50 block">Selesai</span>
                                                                    {item.end_date ? formatDateTime(item.end_date) : 'Selamanya (Tidak diatur)'}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        {/* Status */}
                                                        <TableCell className="py-4 align-top text-center">
                                                            {getStatusBadge(item.is_active)}
                                                        </TableCell>

                                                        {/* Aksi */}
                                                        <TableCell className="py-4 align-top text-right">
                                                            {hasPermission('edit pengumuman ajp') && (
                                                                <Button asChild size="sm" variant="outline" className="gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                                                    <Link href={route('admin.ajp.pengumuman.edit', item.id)}>
                                                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}

                                            {/* Empty State */}
                                            {pengumuman.data.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan="6" className="text-center py-8 text-gray-500 bg-muted/20">
                                                        Tidak ada data pengumuman yang ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                            {/* End Table */}

                            {/* Start Pagination */}
                            {pengumuman.data.length > 0 && <PaginationDaisy data={pengumuman} />}
                            {/* End Pagination */}

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Index
