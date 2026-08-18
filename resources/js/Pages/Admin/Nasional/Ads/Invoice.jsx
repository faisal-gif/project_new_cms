import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import React from 'react';
import { Head, Link } from '@inertiajs/react';

const formatRupiah = (number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

export default function Invoice({ ad }) {
    const invoiceNo = `INV-NAS-${String(ad.id).padStart(5, '0')}`;
    const issued = (ad.created || new Date().toISOString()).slice(0, 10);
    const locates = ad.locates || [];
    const total = ad.cost || 0;

    return (
        <>
            <Head title={`Invoice ${invoiceNo}`} />

            <style>{`@media print { .no-print { display: none !important; } body { background: #fff; } }`}</style>

            <div className="min-h-screen bg-gray-100 py-8 px-4">
                {/* Toolbar - disembunyikan saat print */}
                <div className="no-print max-w-3xl mx-auto flex justify-between items-center mb-4">
                    <Link href={route('admin.nasional.ads.show', ad.id)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-semibold text-sm">
                        Kembali
                    </Link>
                    <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-sm">
                        Cetak / Simpan PDF
                    </button>
                </div>

                {/* Kertas invoice */}
                <div className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-200 p-10">
                    <div className="flex justify-between items-start border-b pb-6">
                        <div>
                            <div className="text-2xl font-bold text-gray-800">TIMES Indonesia</div>
                            <div className="text-sm text-gray-500">Divisi Iklan Nasional</div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-800 tracking-wide">INVOICE</div>
                            <div className="text-sm text-gray-500 mt-1">{invoiceNo}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 py-6 text-sm">
                        <div>
                            <div className="text-gray-500 font-medium mb-1">Tanggal Terbit</div>
                            <div className="text-gray-800 font-semibold">{issued}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 font-medium mb-1">Periode Tayang</div>
                            <div className="text-gray-800 font-semibold">{ad.datestart} s/d {ad.dateend}</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-gray-500 font-medium mb-1">Campaign</div>
                            <div className="text-gray-800 font-semibold">{ad.title}</div>
                            <a href={ad.url} className="text-xs text-blue-500 break-all">{ad.url}</a>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="text-gray-500 uppercase text-xs">
                                <TableHead className="py-3 text-left">Deskripsi</TableHead>
                                <TableHead className="py-3 text-center">Platform</TableHead>
                                <TableHead className="py-3 text-right">Jumlah</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {locates.length === 0 ? (
                                <TableRow className="border-t">
                                    <TableCell className="py-3">Penayangan iklan "{ad.title}"</TableCell>
                                    <TableCell className="py-3 text-center">-</TableCell>
                                    <TableCell className="py-3 text-right">{formatRupiah(total)}</TableCell>
                                </TableRow>
                            ) : (
                                locates.map((loc, i) => (
                                    <TableRow key={loc.id} className="border-t">
                                        <TableCell className="py-3">Slot {loc.master?.name || `#${loc.locate_id}`}{loc.master ? ` (${loc.master.width}x${loc.master.height})` : ''}</TableCell>
                                        <TableCell className="py-3 text-center">{loc.master?.type === 'm' ? 'Mobile' : loc.master?.type === 'd' ? 'Desktop' : '-'}</TableCell>
                                        <TableCell className="py-3 text-right">{i === 0 ? formatRupiah(total) : '-'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex justify-end mt-6">
                        <div className="w-64 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>CPC (Cost Per Click)</span>
                                <span>{formatRupiah(ad.cpc)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-2">
                                <span>Total</span>
                                <span>{formatRupiah(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t text-xs text-gray-400 text-center">
                        Invoice ini dibuat secara otomatis oleh sistem. Terima kasih atas kerjasamanya.
                    </div>
                </div>
            </div>
        </>
    );
}
