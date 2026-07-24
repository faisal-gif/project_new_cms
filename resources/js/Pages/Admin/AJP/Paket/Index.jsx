import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search, Package } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ pakets, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.ajp.paket.index');

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

    const formatRupiah = (value) => {
        if (value === null || value === undefined) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    function getStatusBadge(status) {
        return status
            ? <Badge className="bg-green-300 text-green-700">Active</Badge>
            : <Badge variant="secondary">Inactive</Badge>;
    }

    function getQuotaBadge(quota) {
        if (quota === null || quota === undefined) {
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200">⭐ Custom</Badge>;
        }
        return (
            <Badge variant="outline" className="font-bold text-blue-600 border-blue-200 bg-blue-50">
                {quota}
            </Badge>
        );
    }

    const getTypeBadge = (type) => {
        switch (type) {
            case "1":
                return <Badge variant="secondary">AJP</Badge>;
            case "3":
                return <Badge className="bg-yellow-300 text-yellow-700 hover:bg-yellow-400">DJ</Badge>;
            case "4":
                return <Badge variant="destructive">Kopi Times</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };


    return (
        <>
            <Head title="Paket Berita Management" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-row justify-between items-center'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Paket Berita</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>AJP</li>
                                        <li>Paket Berita</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Start Head */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    {hasPermission(['create paket ajp']) && (
                                        <Link href={route('admin.ajp.paket.create')} className="btn btn-primary rounded-lg">
                                            <Plus size={16} /> Tambah Paket
                                        </Link>
                                    )}
                                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                        <div className="w-full md:w-80">
                                            <InputWithPrefix
                                                prefix={<Search size={16} />}
                                                placeholder="Cari Nama Paket..."
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
                                    {pakets.data.map((paket) => (
                                        <div key={paket.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold text-base">{paket.name}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{getTypeBadge(paket.type)}</p>
                                                </div>
                                                {getStatusBadge(paket.status)}
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {paket.popular && <Badge className="bg-purple-100 text-purple-700">Populer</Badge>}
                                                {paket.promo && <Badge className="bg-pink-100 text-pink-700">Promo</Badge>}
                                                {paket.flash_sale && <Badge className="bg-red-100 text-red-700">Flash Sale</Badge>}
                                                {paket.badge && <Badge variant="outline">{paket.badge}</Badge>}
                                            </div>

                                            <div className="text-sm space-y-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Kuota:</span>
                                                    <span>{getQuotaBadge(paket.quota)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Harga:</span>
                                                    <span className="font-bold text-green-600">{formatRupiah(paket.price)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Masa Aktif:</span>
                                                    <span>{paket.period ? `${paket.period} ${paket.jenis_periode}` : '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Item Tambahan:</span>
                                                    <span className="font-bold">{paket.items_lainnya?.length ?? 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Terdaftar:</span>
                                                    <span>{formatDate(paket.created)}</span>
                                                </div>
                                            </div>
                                            {hasPermission(['edit paket ajp']) && (
                                                <div className="flex gap-2 mt-4">
                                                    <Link href={route('admin.ajp.paket.edit', paket.id)} className="btn btn-sm btn-warning btn-outline w-full">Edit Paket</Link>
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
                                                <th>Nama Paket</th>
                                                <th className="text-center">Kuota</th>
                                                <th>Harga</th>
                                                <th>Masa Aktif</th>
                                                <th className="text-center">Item Lainnya</th>
                                                <th>Label</th>
                                                <th>Status</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pakets.data.map((paket, index) => (
                                                <tr key={paket.id}>
                                                    <th>{(pakets.current_page - 1) * pakets.per_page + index + 1}</th>
                                                    <td>
                                                        <div className="font-bold">{paket.name}</div>
                                                        <div className="text-xs text-gray-500 capitalize">
                                                            {getTypeBadge(paket.type)}
                                                            {paket.kategori_produk && ` • ${paket.kategori_produk}`}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        {getQuotaBadge(paket.quota)}
                                                    </td>
                                                    <td className="font-semibold text-green-600">
                                                        {formatRupiah(paket.price)}
                                                    </td>
                                                    <td>
                                                        {paket.period
                                                            ? <span>{paket.period} <span className="text-xs text-gray-500 capitalize">{paket.jenis_periode}</span></span>
                                                            : <span className="text-gray-400">-</span>}
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge variant="outline" className="font-bold">
                                                            {paket.items_lainnya?.length ?? 0}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="flex flex-wrap gap-1">
                                                            {paket.popular && <Badge className="bg-purple-100 text-purple-700">Populer</Badge>}
                                                            {paket.promo && <Badge className="bg-pink-100 text-pink-700">Promo</Badge>}
                                                            {paket.flash_sale && <Badge className="bg-red-100 text-red-700">Flash</Badge>}
                                                            {!paket.popular && !paket.promo && !paket.flash_sale && <span className="text-gray-400 text-xs">-</span>}
                                                        </div>
                                                    </td>
                                                    <td>{getStatusBadge(paket.status)}</td>
                                                    <td>
                                                        {hasPermission(['edit paket ajp']) && (
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={route('admin.ajp.paket.edit', paket.id)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}

                                            {pakets.data.length === 0 && (
                                                <tr>
                                                    <td colSpan="9" className="text-center py-8 text-gray-500">
                                                        Tidak ada data paket yang ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                            {/* End Table */}

                            {/* Start Pagination */}
                            {pakets.data.length > 0 && (
                                <PaginationDaisy data={pakets} />
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
