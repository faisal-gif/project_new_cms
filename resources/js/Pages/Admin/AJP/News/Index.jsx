import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate, formatDateTimeLong } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export default function Index({ news, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.ajp.news.index');

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
                { search, status, page: 1 },
                { preserveState: true, replace: true }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, status]);

    function getStatusBadge(statusValue) {
        if (statusValue === 1 || statusValue === '1') {
            return <Badge className="bg-green-300 text-green-800">Published</Badge>;
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
                        <h1 className="text-3xl font-bold text-foreground">Daftar Berita AJP</h1>
                        <div className="breadcrumbs text-sm">
                            <ul>
                                <li><a>Home</a></li>
                                <li>AJP</li>
                                <li>Berita</li>
                            </ul>
                        </div>
                    </div>

                    {/* Toolbar / Filters */}
                    <Card>
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            {hasPermission(['create news ajp']) && (
                                <Link href={route('admin.ajp.news.create')} className="btn btn-primary">
                                    <Plus size={16} /> Tulis Berita
                                </Link>
                            )}

                            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                <div className="w-full md:w-80">
                                    <InputWithPrefix
                                        prefix={<Search size={16} />}
                                        placeholder="Cari Judul atau Kode..."
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
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th className="w-12 text-center">#</th>
                                        <th>Judul Berita</th>
                                        <th>Pewarta</th>
                                        <th>Tanggal</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {news.data.map((item, index) => (
                                        <tr key={item.id}>
                                            <th className="text-center">
                                                {(news.current_page - 1) * news.per_page + index + 1}
                                            </th>
                                            <td>
                                                <div className="font-bold text-gray-900 max-w-md truncate" title={item.title}>
                                                    {item.headline ? <span className="text-red-500 mr-1">[HL]</span> : ''}
                                                    {item.title}
                                                </div>
                                                <div className="text-xs text-blue-600 font-mono mt-1">{item.is_code}</div>
                                            </td>
                                            <td>
                                                {/* Memanggil relasi writer dengan aman */}
                                                <span className="font-medium text-gray-700">
                                                    {item.writer?.nama || 'Unknown Pewarta'}
                                                </span>
                                            </td>
                                            <td>{formatDateTimeLong(item.datetime)}</td>
                                            <td className="text-center">{getStatusBadge(item.status)}</td>
                                            <td>
                                                <div className="flex justify-end gap-2">
                                                    {/* Ubah warna menjadi info (biru) dan arahkan ke route show */}
                                                    <Link href={route('admin.ajp.news.show', item.id)} className="btn btn-sm btn-info btn-outline">
                                                        Detail
                                                    </Link>

                                                    {hasPermission(['publish news ajp']) && (
                                                        <Link href={route('admin.ajp.news.publish', item.id)} className="btn btn-sm btn-success btn-outline">
                                                            Publish
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {news.data.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500 bg-gray-50/50">
                                                Tidak ada berita yang ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {news.data.length > 0 && <PaginationDaisy data={news} />}
                </div>
            </div>
        </AuthenticatedLayout>
    )
}