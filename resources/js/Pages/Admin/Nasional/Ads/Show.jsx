import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import { Head, Link } from '@inertiajs/react';

const formatRupiah = (number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

function Row({ label, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100 last:border-0">
            <div className="w-48 shrink-0 text-sm font-medium text-gray-500">{label}</div>
            <div className="text-sm text-gray-800 font-semibold">{children}</div>
        </div>
    );
}

export default function Show({ ad }) {
    const locates = ad.locates || [];

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Iklan - ${ad.title}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Detail Campaign Iklan</h1>
                        <div className="flex gap-2">
                            <Link
                                href={route('admin.nasional.ads.invoice', ad.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-sm"
                            >
                                Lihat Invoice
                            </Link>
                            <Link
                                href={route('admin.nasional.ads.edit', ad.id)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold text-sm"
                            >
                                Edit
                            </Link>
                            <Link
                                href={route('admin.nasional.ads.index')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-semibold text-sm"
                            >
                                Kembali
                            </Link>
                        </div>
                    </div>

                    <Card>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Informasi Campaign</h2>
                        <Row label="Judul">{ad.title}</Row>
                        <Row label="ID Unik">{ad.unique_id}</Row>
                        <Row label="URL Tujuan">
                            <a href={ad.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all">
                                {ad.url}
                            </a>
                        </Row>
                        <Row label="Periode">{ad.datestart} s/d {ad.dateend}</Row>
                        <Row label="Total Cost">{formatRupiah(ad.cost)}</Row>
                        <Row label="CPC">{formatRupiah(ad.cpc)}</Row>
                        <Row label="Status">
                            {ad.is_status == 1 ? (
                                <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">Aktif</span>
                            ) : (
                                <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold">Tidak Aktif</span>
                            )}
                        </Row>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <h2 className="text-base font-semibold text-blue-600 mb-3">Banner Desktop</h2>
                            {ad.d_img ? (
                                <img src={ad.d_img} alt="Banner Desktop" className="w-full rounded border border-gray-200" />
                            ) : (
                                <div className="text-sm text-gray-400 italic">Tidak ada banner desktop.</div>
                            )}
                        </Card>
                        <Card>
                            <h2 className="text-base font-semibold text-green-600 mb-3">Banner Mobile</h2>
                            {ad.m_img ? (
                                <img src={ad.m_img} alt="Banner Mobile" className="w-full rounded border border-gray-200" />
                            ) : (
                                <div className="text-sm text-gray-400 italic">Tidak ada banner mobile.</div>
                            )}
                        </Card>
                    </div>

                    <Card>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Lokasi Tayang & Performa</h2>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-100 text-gray-600 uppercase text-xs border-b border-gray-200">
                                        <TableHead className="py-2 px-4 text-left">Lokasi</TableHead>
                                        <TableHead className="py-2 px-4 text-center">Platform</TableHead>
                                        <TableHead className="py-2 px-4 text-center">Ukuran</TableHead>
                                        <TableHead className="py-2 px-4 text-right">Views</TableHead>
                                        <TableHead className="py-2 px-4 text-right">Clicks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locates.length === 0 ? (
                                        <TableRow><TableCell colSpan="5" className="py-6 text-center text-gray-400">Belum ada lokasi tayang.</TableCell></TableRow>
                                    ) : (
                                        locates.map((loc) => (
                                            <TableRow key={loc.id} className="border-b border-gray-100">
                                                <TableCell className="py-2 px-4 text-left font-semibold">{loc.master?.name || `#${loc.locate_id}`}</TableCell>
                                                <TableCell className="py-2 px-4 text-center">{loc.master?.type === 'm' ? 'Mobile' : loc.master?.type === 'd' ? 'Desktop' : '-'}</TableCell>
                                                <TableCell className="py-2 px-4 text-center">{loc.master ? `${loc.master.width}x${loc.master.height}` : '-'}</TableCell>
                                                <TableCell className="py-2 px-4 text-right">{(loc.is_views || 0).toLocaleString('id-ID')}</TableCell>
                                                <TableCell className="py-2 px-4 text-right">{(loc.is_clicks || 0).toLocaleString('id-ID')}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
