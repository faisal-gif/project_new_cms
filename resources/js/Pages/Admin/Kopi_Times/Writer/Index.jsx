import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ writers, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');

    const isFirst = useRef(true);
    // PERBAIKAN: Ubah dari daerah ke ajp agar sesuai konteks
    const INDEX_ROUTE = route('admin.kopi-times.writer.index');

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

        let timeout = null;

        if (search !== filters.search) {
            timeout = setTimeout(() => {
                router.get(
                    INDEX_ROUTE,
                    { search, status, page: 1 },
                    { preserveState: true, replace: true }
                );
            }, 400);
        } else {
            router.get(
                INDEX_ROUTE,
                { search, status, page: 1 },
                { preserveState: true, replace: true }
            );
        }

        return () => timeout && clearTimeout(timeout);
    }, [search, status]);

    function getStatusBadge(status) {
        switch (status) {
            case "pending":
            case '0':
            case 0:
                return <Badge variant="secondary">Inactive</Badge>;
            case "Publish":
            case '1':
            case 1:
                return <Badge className={"bg-green-300 text-green-700"}>Active</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    }

    return (
        <>
            <Head title="Writer Management" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-row justify-between items-center'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Penulis Kopi Times</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Kopi Times</li>
                                        <li>Penulis</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Start Head */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    {hasPermission(['create member kopi-times']) && (
                                        <Link href={route('admin.kopi-times.writer.create')} className="btn btn-primary rounded-lg">
                                            <Plus size={16} /> Tambah Writers
                                        </Link>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                        <div className="w-full md:w-80">
                                            <InputWithPrefix
                                                prefix={<Search size={16} />}
                                                placeholder="Cari Nama Writer..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-48">
                                            <InputSelect
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                options={[
                                                    { label: "Semua Status", value: "" }, // Tambahkan opsi reset filter
                                                    { label: "Active", value: "1" },
                                                    { label: "Inactive", value: "0" },
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
                                    {writers.data.map((writer) => (
                                        <div key={writer.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    {/* PERBAIKAN: Gunakan nama, bukan name */}
                                                    <p className="font-semibold text-base">{writer.nama}</p>
                                                    <p className="text-sm text-gray-500">{writer.email}</p>
                                                </div>
                                                {getStatusBadge(writer.status)}
                                            </div>

                                            <div className="text-sm space-y-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                {/* PENAMBAHAN INFO BARU */}
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Kuota Berita:</span>
                                                    <span className="font-bold text-blue-600">{writer.quota_news ?? 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    {/* PERBAIKAN: Gunakan dateexp, bukan date_exp */}
                                                    <span className="font-medium text-gray-600">Masa Berlaku:</span>
                                                    <span>{formatDate(writer.dateexp)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Terdaftar:</span>
                                                    <span>{formatDate(writer.created)}</span>
                                                </div>
                                            </div>
                                            {hasPermission(['edit member kopi-times']) && (
                                                <div className="flex gap-2 mt-4">
                                                    <Link href={route('admin.kopi-times.writer.edit', writer.id)} className="btn btn-sm btn-warning btn-outline w-full">Edit Profil</Link>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* DESKTOP VERSION (Table Mode) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="table table-zebra">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Nama / Email</th>
                                                <th className="text-center">Kuota</th>
                                                <th>Masa Berlaku</th>
                                                <th>Tgl Terdaftar</th>
                                                <th>Status</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {writers.data.map((writer, index) => (
                                                <tr key={writer.id}>
                                                    {/* Hitung index yang benar berdasarkan paginasi */}
                                                    <th>{(writers.current_page - 1) * writers.per_page + index + 1}</th>
                                                    <td>
                                                        <div className="font-bold">{writer.nama}</div>
                                                        <div className="text-xs text-gray-500">{writer.email}</div>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge variant="outline" className="font-bold text-blue-600 border-blue-200 bg-blue-50">
                                                            {writer.quota_news ?? 0}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <span className={!writer.is_active_subscriber ? "text-red-500 font-semibold" : ""}>
                                                            {formatDate(writer.dateexp)}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(writer.created)}</td>
                                                    <td>
                                                        {getStatusBadge(writer.status)}
                                                    </td>
                                                    <td>
                                                        {hasPermission(['edit member kopi-times']) && (
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={route('admin.kopi-times.writer.edit', writer.id)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}

                                            {writers.data.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                                        Tidak ada data writer yang ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                            {/* End Table */}

                            {/* Start Pagination */}
                            {writers.data.length > 0 && (
                                <PaginationDaisy data={writers} />
                            )}
                            {/* End Pagination */}

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Index