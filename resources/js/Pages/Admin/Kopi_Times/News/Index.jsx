import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate, formatDateTimeLong } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search, Download } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select'

export default function Index({ news, members = [], filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');
    const [member, setMember] = useState(() => filters.member || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.kopi-times.news.index');

    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];

    const hasPermission = (permissions) => {
        if (Array.isArray(permissions)) {
            return permissions.some(permission => userPermissions.includes(permission));
        }
        return userPermissions.includes(permissions);
    };

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                INDEX_ROUTE,
                { search, status, member, page: 1 },
                { preserveState: true, replace: true }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, status, member]);

    function getStatusBadge(statusValue) {
        if (statusValue === 1 || statusValue === '1') {
            return <Badge className="bg-green-300 text-green-800">Published</Badge>;
        }

        if (statusValue === 2 || statusValue === '2') {
            return <Badge className="bg-yellow-300 text-yellow-800">On Pro</Badge>;
        }
        return <Badge variant="secondary">Draft</Badge>;
    }

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Berita AJP" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className='flex justify-between items-center'>
                        <h1 className="text-3xl font-bold text-foreground">Daftar Berita Kopi Times</h1>
                        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Kopi Times' }, { label: 'Berita' }]} />
                    </div>

                    {/* Toolbar / Filters */}
                    <Card>
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex gap-2">
                                {hasPermission(['create news kopi-times']) && (
                                    <Button asChild>
                                        <Link href={route('admin.kopi-times.news.create')}>
                                            <Plus size={16} /> Tulis Berita
                                        </Link>
                                    </Button>
                                )}

                                {hasPermission(['download json news kopi-times']) && (
                                    <Button asChild variant="outline">
                                        <a href={route('admin.kopi-times.news.download', member ? { member } : {})}>
                                            <Download size={16} /> Download JSON
                                        </a>
                                    </Button>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                <div className="w-full md:w-80">
                                    <InputWithPrefix
                                        prefix={<Search size={16} />}
                                        placeholder="Cari Judul atau Kode..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-56">
                                    <Select
                                        options={members}
                                        value={members.find(m => String(m.value) === String(member)) || null}
                                        placeholder="Semua Member"
                                        onChange={(opt) => setMember(opt?.value ? String(opt.value) : '')}
                                        isClearable
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <InputSelect
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        options={[
                                            { label: "Semua Status", value: "" },
                                            { label: "On Pro", value: "2" },
                                            { label: "Published", value: "1" },
                                            { label: "Draft", value: "0" },

                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Table Data */}
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 text-center">#</TableHead>
                                        <TableHead>Judul Berita</TableHead>
                                        <TableHead>Pewarta</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {news.data.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center">
                                                {(news.current_page - 1) * news.per_page + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-gray-900 max-w-md truncate" title={item.title}>
                                                    {item.headline ? <span className="text-red-500 mr-1">[HL]</span> : ''}
                                                    {item.title}
                                                </div>
                                                <div className="text-xs text-blue-600 font-mono mt-1">{item.is_code}</div>
                                            </TableCell>
                                            <TableCell>
                                                {/* Memanggil relasi writer dengan aman */}
                                                <span className="font-medium text-gray-700">
                                                    {item.writer?.nama || 'Unknown Pewarta'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatDateTimeLong(item.datetime)}</TableCell>
                                            <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end items-center gap-2">

                                                    {/* 1. Tombol Detail (Selalu Muncul untuk melihat preview) */}
                                                    <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                                        <Link href={route('admin.kopi-times.news.show', item.id)}>Detail</Link>
                                                    </Button>

                                                    {/* 2. Pengecekan Status Publish */}
                                                    {item.news_nasional == null ? (

                                                        /* --- TAMPILAN JIKA BELUM PUBLISH (DRAFT) --- */
                                                        <>
                                                            {/* Tombol Edit (Hanya muncul sebelum di-publish) */}
                                                            {hasPermission(['edit news kopi-times']) && (
                                                                <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                                                    <Link href={route('admin.kopi-times.news.edit', item.id)}>Edit</Link>
                                                                </Button>
                                                            )}

                                                            {/* Tombol Publish (Hanya muncul sebelum di-publish) */}
                                                            {hasPermission(['publish news kopi-times']) && (
                                                                <Button asChild size="sm" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-500/60 dark:text-green-400 dark:hover:bg-green-950/40">
                                                                    <Link href={route('admin.kopi-times.news.publish', item.id)}>Publish</Link>
                                                                </Button>
                                                            )}
                                                        </>

                                                    ) : (

                                                        /* --- TAMPILAN JIKA SUDAH PUBLISH (NASIONAL) --- */
                                                        <>
                                                            {/* Tombol Nasional (Mengarahkan ke detail berita tayang) */}
                                                            <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                                                                <Link href={route('admin.nasional.news.show', item.news_nasional.news_id)}>Nasional</Link>
                                                            </Button>
                                                        </>

                                                    )}

                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {news.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan="6" className="text-center py-8 text-gray-500 bg-gray-50/50">
                                                Tidak ada berita yang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {news.data.length > 0 && <PaginationDaisy data={news} />}
                </div>
            </div>
        </AuthenticatedLayout>
    )
}