import React from 'react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import { Head, Link } from '@inertiajs/react';

export default function Index({ ads }) {

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
                        <div className="breadcrumbs text-sm text-gray-500">
                            <ul>
                                <li>Home</li>
                                <li>Daftar Iklan</li>
                            </ul>
                        </div>
                    </div>

                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-700">Daftar Campaign Iklan</h2>
                            <Link
                                href={route('admin.nasional.ads.create')}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition duration-150 ease-in-out"
                            >
                                + Tambah Iklan
                            </Link>
                        </div>

                        {/* --- TABEL DATA --- */}
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal border-b border-gray-200">
                                        <th className="py-3 px-6 text-left">Info Campaign</th>
                                        <th className="py-3 px-6 text-center">Periode</th>
                                        <th className="py-3 px-6 text-right">Anggaran (Cost)</th>
                                        <th className="py-3 px-6 text-center">Status</th>
                                        <th className="py-3 px-6 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm font-light">
                                    {ads.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-gray-500">
                                                Belum ada data iklan. Silakan tambahkan kampanye baru.
                                            </td>
                                        </tr>
                                    ) : (
                                        ads.data.map((ad) => (
                                            <tr key={ad.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                                                <td className="py-4 px-6 text-left">
                                                    <div className="font-bold text-gray-800">{ad.title}</div>
                                                    <a href={ad.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                                        {ad.url}
                                                    </a>
                                                    <div className="text-xs text-gray-400 mt-1">ID: {ad.unique_id}</div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="font-semibold">{ad.datestart}</div>
                                                    <div className="text-xs text-gray-500">s/d</div>
                                                    <div className="font-semibold">{ad.dateend}</div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="font-bold text-gray-800">{formatRupiah(ad.cost)}</div>
                                                    <div className="text-xs text-gray-500">CPC: {formatRupiah(ad.cpc)}</div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {ad.is_status == 1 ? (
                                                        <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">Aktif</span>
                                                    ) : (
                                                        <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">Tidak Aktif</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex item-center justify-center gap-3">
                                                        <Link
                                                            href={route('admin.nasional.ads.edit', ad.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                        >
                                                            Edit
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* --- PAGINATION --- */}
                        {ads.links && ads.links.length > 3 && (
                            <div className="mt-6 flex justify-end">
                                <div className="join shadow-sm">
                                    {ads.links.map((link, index) => {
                                        // Jika URL null (tombol Prev/Next di ujung halaman), render sebagai elemen statis (disabled)
                                        if (link.url === null) {
                                            return (
                                                <div
                                                    key={index}
                                                    className="join-item btn btn-sm bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        // Jika URL ada, render sebagai Inertia Link
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`join-item btn btn-sm border-gray-200 ${link.active
                                                    ? 'btn-active bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
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