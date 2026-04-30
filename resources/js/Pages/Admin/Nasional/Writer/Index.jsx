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
    const INDEX_ROUTE = route('admin.nasional.writer.index');

    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];

    // 2. Buat helper function
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
            <Head title="Penulis Nasional" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


                        <div className=" space-y-6">
                            <div className='flex flex-row justify-between items-center'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Writer</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Penulis Nasional</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            {/* Start Head */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    {/* Button Tambah User */}
                                    {hasPermission('create penulis nasional') && (
                                        <Link href={route('admin.nasional.writer.create')} className="btn btn-primary rounded-lg">
                                            <Plus size={16} /> Tambah Penulis
                                        </Link>
                                    )}

                                    {/* Field Search And Filter */}
                                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                        <div className="w-full md:w-80">
                                            <InputWithPrefix
                                                prefix={<Search size={16} />}
                                                placeholder="Search Writer..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-48">
                                            <InputSelect
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                options={[
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
                                    {/* Contoh data, ganti dengan data.map(...) */}
                                    {writers.data.map((writer) => (
                                        <div key={writer.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                                            {/* Header (Nama + Status) */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold text-base">{writer.name}</p>
                                                    <p className="text-sm text-gray-500">{writer.email}</p>
                                                </div>

                                                {getStatusBadge(writer.status)}
                                            </div>



                                            {/* Actions */}
                                            <div className="flex gap-2 mt-4">
                                                {hasPermission('edit penulis nasional') && (
                                                    <Link href={route('admin.nasional.writer.edit', writer)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* DESKTOP VERSION (Table Mode) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="table table-zebra">

                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Nama</th>

                                                <th>Status</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {writers.data.map((writer, index) => (
                                                <tr key={writer.id}>
                                                    <th>{index + 1}</th>
                                                    <td>{writer.name}</td>
                                                    <td>
                                                        {getStatusBadge(writer.status)}
                                                    </td>
                                                    <td>
                                                        <div className="flex justify-end gap-2">
                                                            {hasPermission('edit penulis nasional') && (
                                                                <Link href={route('admin.nasional.writer.edit', writer)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>

                            </Card>
                            {/* End Table */}

                            {/* Start Pagination */}
                            <PaginationDaisy data={writers} />
                            {/* End Pagination */}


                        </div>


                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Index