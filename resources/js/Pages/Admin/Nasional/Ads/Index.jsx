import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import Breadcrumbs from '@/Components/Breadcrumbs'
import React, { useState, useEffect, useRef } from 'react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ ads, filters = {} }) {

    const [search, setSearch] = useState(filters.search || '');
    const isFirst = useRef(true);

    useEffect(() => {
        if (isFirst.current) { isFirst.current = false; return; }
        const t = setTimeout(() => {
            router.get(route('admin.nasional.ads.index'), { search }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350);
        return () => clearTimeout(t);
    }, [search]);

    // Helper untuk memformat angka menjadi Rupiah (IDR)
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(number);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Campaign Iklan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* --- HEADER & ACTION --- */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Iklan</h1>
                        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Daftar Iklan' }]} />
                    </div>

                    <Card>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                            <h2 className="text-lg font-semibold text-gray-700">Daftar Campaign Iklan</h2>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                                <Input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari judul / ID iklan..."
                                    className="w-full sm:w-64"
                                />
                                <Button asChild className="rounded-lg whitespace-nowrap">
                                    <Link href={route('admin.nasional.ads.create')}>
                                        + Tambah Iklan
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* --- TABEL DATA (Desktop) --- */}
                        <div className="overflow-x-auto hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal border-b border-gray-200">
                                        <TableHead className="py-3 px-6 text-left">Info Campaign</TableHead>
                                        <TableHead className="py-3 px-6 text-center">Periode</TableHead>
                                        <TableHead className="py-3 px-6 text-right">Anggaran (Cost)</TableHead>
                                        <TableHead className="py-3 px-6 text-center">Status</TableHead>
                                        <TableHead className="py-3 px-6 text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ads.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan="5" className="py-8 text-center text-gray-500">
                                                Belum ada data iklan. Silakan tambahkan kampanye baru.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ads.data.map((ad) => (
                                            <TableRow key={ad.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                                                <TableCell className="py-4 px-6 text-left">
                                                    <div className="font-bold text-gray-800">{ad.title}</div>
                                                    <a href={ad.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                                        {ad.url}
                                                    </a>
                                                    <div className="text-xs text-gray-400 mt-1">ID: {ad.unique_id}</div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center">
                                                    <div className="font-semibold">{ad.datestart}</div>
                                                    <div className="text-xs text-gray-500">s/d</div>
                                                    <div className="font-semibold">{ad.dateend}</div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-right">
                                                    <div className="font-bold text-gray-800">{formatRupiah(ad.cost)}</div>
                                                    <div className="text-xs text-gray-500">CPC: {formatRupiah(ad.cpc)}</div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center">
                                                    {ad.is_status == 1 ? (
                                                        <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">Aktif</span>
                                                    ) : (
                                                        <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">Tidak Aktif</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center">
                                                    <div className="flex item-center justify-center gap-3">
                                                        <Link
                                                            href={route('admin.nasional.ads.show', ad.id)}
                                                            className="text-gray-600 hover:text-gray-900 font-medium"
                                                        >
                                                            Detail
                                                        </Link>
                                                        <Link
                                                            href={route('admin.nasional.ads.invoice', ad.id)}
                                                            className="text-emerald-600 hover:text-emerald-900 font-medium"
                                                        >
                                                            Invoice
                                                        </Link>
                                                        <Link
                                                            href={route('admin.nasional.ads.edit', ad.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                        >
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* --- KARTU DATA (Mobile) --- */}
                        <div className="md:hidden space-y-4">
                            {ads.data.length === 0 ? (
                                <div className="py-8 text-center text-gray-500 text-sm">
                                    Belum ada data iklan. Silakan tambahkan kampanye baru.
                                </div>
                            ) : (
                                ads.data.map((ad) => (
                                    <div key={ad.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="min-w-0">
                                                <div className="font-bold text-gray-800 break-words">{ad.title}</div>
                                                <a href={ad.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline break-all">
                                                    {ad.url}
                                                </a>
                                                <div className="text-xs text-gray-400 mt-1">ID: {ad.unique_id}</div>
                                            </div>
                                            {ad.is_status == 1 ? (
                                                <span className="shrink-0 bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">Aktif</span>
                                            ) : (
                                                <span className="shrink-0 bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">Tidak Aktif</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 pt-3">
                                            <div>
                                                <div className="text-xs text-gray-400">Periode</div>
                                                <div className="font-semibold text-gray-700">{ad.datestart}</div>
                                                <div className="text-xs text-gray-500">s/d {ad.dateend}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-400">Anggaran</div>
                                                <div className="font-bold text-gray-800">{formatRupiah(ad.cost)}</div>
                                                <div className="text-xs text-gray-500">CPC: {formatRupiah(ad.cpc)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-3">
                                            <Link href={route('admin.nasional.ads.show', ad.id)} className="text-gray-600 hover:text-gray-900 font-medium text-sm">Detail</Link>
                                            <Link href={route('admin.nasional.ads.invoice', ad.id)} className="text-emerald-600 hover:text-emerald-900 font-medium text-sm">Invoice</Link>
                                            <Link href={route('admin.nasional.ads.edit', ad.id)} className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Edit</Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* --- PAGINATION --- */}
                        {ads.links && ads.links.length > 3 && (
                            <div className="mt-6 flex justify-end">
                                <div className="inline-flex shadow-sm">
                                    {ads.links.map((link, index) => {
                                        // Jika URL null (tombol Prev/Next di ujung halaman), render sebagai elemen statis (disabled)
                                        if (link.url === null) {
                                            return (
                                                <div
                                                    key={index}
                                                    className="px-3 py-1.5 text-sm border border-border bg-muted text-muted-foreground cursor-not-allowed -ml-px first:ml-0 first:rounded-l-md last:rounded-r-md"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        // Jika URL ada, render sebagai Inertia Link
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-1.5 text-sm border border-border -ml-px first:ml-0 first:rounded-l-md last:rounded-r-md ${link.active
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-background text-foreground hover:bg-muted'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}