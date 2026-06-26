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
    const INDEX_ROUTE = route('admin.ajp.writer.index');

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
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Writer AJP</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>AJP</li>
                                        <li>Writer</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Start Head */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <Link href={route('admin.ajp.writer.create')} className="btn btn-primary rounded-lg">
                                        <Plus size={16} /> Tambah Writers
                                    </Link>

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

                                            <div className="flex gap-2 mt-4">
                                                <Link href={route('admin.ajp.writer.edit', writer.id)} className="btn btn-sm btn-warning btn-outline w-full">Edit Profil</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* DESKTOP VERSION (Table Mode) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="table table-zebra w-full">
                                        <thead>
                                            <tr>
                                                <th className="w-12 text-center">#</th>
                                                <th>Profil Penulis</th>
                                                <th>Informasi Paket & Akun</th>
                                                <th className="text-right w-24">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {writers.data.map((writer, index) => (
                                                <tr key={writer.id}>

                                                    {/* 1. Nomor Urut */}
                                                    <th className="text-center align-top pt-5">
                                                        {(writers.current_page - 1) * writers.per_page + index + 1}
                                                    </th>

                                                    {/* 2. Profil Penulis (Nama, Email, Status) */}
                                                    <td className="align-top pt-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-base text-gray-900">{writer.nama}</span>
                                                            {getStatusBadge(writer.status)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-medium">{writer.email}</div>
                                                    </td>

                                                    {/* 3. Informasi Paket (Kuota, Kedaluwarsa, Terdaftar) */}
                                                    <td className="align-top pt-4">
                                                        <div className="flex flex-col gap-1.5 text-sm">
                                                            <div className="flex items-center">
                                                                <span className="text-gray-500 w-28">Kuota Tersedia:</span>
                                                                <Badge variant="outline" className="font-bold text-blue-700 border-blue-200 bg-blue-50 px-2 py-0.5">
                                                                    {writer.quota_news ?? 0} Berita
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="text-gray-500 w-28">Masa Berlaku:</span>
                                                                <span className={!writer.is_active_subscriber ? "text-red-600 font-bold bg-red-50 px-1 rounded" : "font-medium text-gray-800"}>
                                                                    {formatDate(writer.dateexp)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="text-gray-500 w-28">Tgl Terdaftar:</span>
                                                                <span className="text-gray-600">{formatDate(writer.created)}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* 4. Action */}
                                                    <td className="align-top pt-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={route('admin.ajp.writer.edit', writer.id)} className="btn btn-sm btn-warning btn-outline">
                                                                Edit
                                                            </Link>
                                                        </div>
                                                    </td>

                                                </tr>
                                            ))}

                                            {/* Empty State */}
                                            {writers.data.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-12 text-gray-500 bg-gray-50/50">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className="text-lg font-semibold">Tidak ada data ditemukan</span>
                                                            <span className="text-sm">Silakan ubah filter atau kata kunci pencarian Anda.</span>
                                                        </div>
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