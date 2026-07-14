import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
// Import icon Wallet ditambahkan
import { Search, Receipt, Users, Calendar, RotateCcw, Wallet, ListFilter, BarChart3 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export default function Index({ payments, packages, statistics, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');
    const [packageId, setPackageId] = useState(() => filters.package_id || '');
    const [startDate, setStartDate] = useState(() => filters.start_date || '');
    const [endDate, setEndDate] = useState(() => filters.end_date || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.kopi-times.transaction.index');

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        let timeout = null;

        const queryParams = {
            search,
            status,
            package_id: packageId,
            start_date: startDate,
            end_date: endDate,
            page: 1
        };

        if (search !== filters.search) {
            timeout = setTimeout(() => {
                router.get(INDEX_ROUTE, queryParams, { preserveState: true, replace: true });
            }, 400);
        } else {
            router.get(INDEX_ROUTE, queryParams, { preserveState: true, replace: true });
        }

        return () => timeout && clearTimeout(timeout);
    }, [search, status, packageId, startDate, endDate]);

    // FUNGSI RESET: Mengembalikan ke Filter Bulan Ini
    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPackageId('');

        // Kalkulasi akurat tanggal hari pertama dan terakhir bulan berjalan di Javascript
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();

        setStartDate(`${y}-${m}-01`);
        setEndDate(`${y}-${m}-${lastDay}`);
    };

    // Mengecek apakah filter diubah dari state asal prop
    const isFilterApplied = search || status || packageId || startDate !== filters.start_date || endDate !== filters.end_date;

    const formatCurrency = (amount) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

    const packageOptions = [
        { label: "Semua Paket", value: "" },
        ...packages.map((pkg) => ({ label: pkg.name, value: String(pkg.id) }))
    ];

    function getStatusBadge(paymentStatus) {
        switch (paymentStatus) {
            case "paid": return <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>;
            case "pending": return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
            case "failed": return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
            case "expired": return <Badge variant="secondary">Expired</Badge>;
            default: return <Badge variant="neutral">{paymentStatus}</Badge>;
        }
    }

    return (
        <>
            <Head title="Manajemen Pembayaran" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            {/* Header */}
                            <div className='flex flex-row justify-between items-center'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Transaksi Kopi Times</h1>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Periode: <span className="font-semibold text-gray-600">{startDate ? formatDate(startDate) : 'Awal'}</span> s/d <span className="font-semibold text-gray-600">{endDate ? formatDate(endDate) : 'Sekarang'}</span>
                                    </p>
                                </div>
                                <div className="join bg-base-100 border shadow-sm rounded-xl">
                                    <Link href={route('admin.ajp.transaction.index')} className="btn join-item btn-sm btn-primary font-bold">
                                        <ListFilter size={14} /> Daftar Transaksi
                                    </Link>
                                    <Link href={route('admin.ajp.transaction.index')} className="btn join-item btn-sm  font-medium">
                                        <BarChart3 size={14} /> Grafik & Report
                                    </Link>
                                </div>
                            </div>

                            {/* KARTU STATISTIK (Berubah menjadi 3 Kolom) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total User</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.total_users}</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                            <Users size={24} />
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Transaksi</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.total_transactions}</p>
                                        </div>
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                            <Receipt size={24} />
                                        </div>
                                    </div>
                                </Card>

                                {/* CARD BARU: TOTAL NOMINAL MASUK */}
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Nominal (Paid)</p>
                                            <p className="text-2xl lg:text-3xl font-bold text-green-700 mt-1">
                                                {formatCurrency(statistics.total_revenue || 0)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-green-50 text-green-600 rounded-full">
                                            <Wallet size={24} />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* FILTER CONTROL PANEL */}
                            <Card>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">

                                        {/* Filter Tanggal */}
                                        <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto items-center">
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                <Calendar size={18} className="text-gray-500 hidden md:block" />
                                                <TextInput
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full md:w-40 text-sm"
                                                    placeholder="Tgl Mulai"
                                                />
                                                <span className="text-gray-400">-</span>
                                                <TextInput
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full md:w-40 text-sm"
                                                    placeholder="Tgl Akhir"
                                                />
                                            </div>
                                        </div>

                                        {/* Search & Reset */}
                                        <div className="flex flex-row gap-2 w-full lg:w-auto items-center">
                                            <div className="w-full md:w-80">
                                                <InputWithPrefix
                                                    prefix={<Search size={16} />}
                                                    placeholder="Cari Referensi atau Nama..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                disabled={!isFilterApplied}
                                                className={`btn btn-square btn-outline rounded-lg ${isFilterApplied
                                                        ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                                        : 'opacity-40 cursor-not-allowed text-gray-300'
                                                    }`}
                                                title="Reset Semua Filter"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dropdown Filter */}
                                    <div className="flex flex-col md:flex-row items-center justify-end gap-4 w-full border-t border-gray-100 pt-4">
                                        <div className="w-full md:w-56">
                                            <InputSelect
                                                value={packageId}
                                                onChange={(e) => setPackageId(e.target.value)}
                                                options={packageOptions}
                                            />
                                        </div>
                                        <div className="w-full md:w-48">
                                            <InputSelect
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                options={[
                                                    { label: "Semua Status", value: "" },
                                                    { label: "Pending", value: "pending" },
                                                    { label: "Paid", value: "paid" },
                                                    { label: "Failed", value: "failed" },
                                                    { label: "Expired", value: "expired" },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* TABEL DATA RESPONSIVE */}
                            <Card>
                                {/* MOBILE VERSION */}
                                <div className="md:hidden flex flex-col gap-4">
                                    {payments.data.map((payment) => (
                                        <div key={payment.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold text-base">{payment.user?.nama || 'Unknown User'}</p>
                                                    <p className="text-sm text-gray-500 font-mono">{payment.reference || '-'}</p>
                                                </div>
                                                {getStatusBadge(payment.status)}
                                            </div>

                                            <div className="text-sm space-y-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Paket:</span>
                                                    <span className="text-gray-900 font-semibold">{payment.package?.name || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Metode:</span>
                                                    <span>{payment.method || '-'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Total:</span>
                                                    <span className="font-bold text-blue-600">{formatCurrency(payment.amount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Tgl Dibuat:</span>
                                                    <span>{formatDate(payment.created_at)}</span>
                                                </div>
                                                {/* Menampilkan Tgl Bayar Jika Status Paid */}
                                                {payment.status === 'paid' && payment.paid_at && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-green-600">Tgl Bayar:</span>
                                                        <span className="text-green-600 font-medium">{formatDate(payment.paid_at)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* DESKTOP VERSION */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="table table-zebra">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Referensi / User</th>
                                                <th>Paket</th>
                                                <th>Metode</th>
                                                <th className="text-right">Total Nominal</th>
                                                <th>Waktu Transaksi</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.data.map((payment, index) => (
                                                <tr key={payment.id}>
                                                    <th>{(payments.current_page - 1) * payments.per_page + index + 1}</th>
                                                    <td>
                                                        <div className="font-bold font-mono text-sm">{payment.reference || '-'}</div>
                                                        <div className="text-xs text-gray-500">{payment.user?.nama || 'Unknown User'}</div>
                                                    </td>
                                                    <td className="font-semibold">{payment.package?.name || '-'}</td>
                                                    <td>{payment.method || '-'}</td>
                                                    <td className="text-right font-medium text-blue-600">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td>
                                                        <div className="text-sm text-gray-900">{formatDate(payment.created_at)}</div>
                                                        {payment.status === 'paid' && payment.paid_at && (
                                                            <div className="text-xs text-green-600 font-medium mt-0.5">
                                                                Paid: {formatDate(payment.paid_at)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(payment.status)}
                                                    </td>
                                                </tr>
                                            ))}

                                            {payments.data.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                                        Tidak ada data pembayaran yang ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* PAGINATION */}
                            {payments.data.length > 0 && (
                                <PaginationDaisy data={payments} />
                            )}

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}