import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
// Import icon Sparkles ditambahkan untuk representasi AI
import { Receipt, Users, Calendar, RotateCcw, Wallet, BarChart3, ListFilter, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

export default function Report({ packages, statistics, chart_data, package_distribution, ai_insights, filters }) {
    const [packageId, setPackageId] = useState(() => filters.package_id || '');
    const [startDate, setStartDate] = useState(() => filters.start_date || '');
    const [endDate, setEndDate] = useState(() => filters.end_date || '');

    const isFirst = useRef(true);
    const REPORT_ROUTE = route('admin.kopi-times.transaction.report');

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        router.get(REPORT_ROUTE, {
            package_id: packageId,
            start_date: startDate,
            end_date: endDate
        }, { preserveState: true, replace: true });

    }, [packageId, startDate, endDate]);

    const handleReset = () => {
        setPackageId('');
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
        setStartDate(`${y}-${m}-01`);
        setEndDate(`${y}-${m}-${lastDay}`);
    };

    const isFilterApplied = packageId || startDate !== filters.start_date || endDate !== filters.end_date;
    const formatCurrency = (amount) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

    const packageOptions = [
        { label: "Semua Paket", value: "" },
        ...packages.map((pkg) => ({ label: pkg.name, value: String(pkg.id) }))
    ];

    // FIX DATA TYPE: Memastikan Recharts menerima Number murni
    const formattedChartData = (chart_data || []).map(item => ({
        ...item,
        total_revenue: Number(item.total_revenue),
        total_transactions: Number(item.total_transactions)
    }));

    const formattedPackageDistribution = (package_distribution || []).map(item => ({
        ...item,
        value: Number(item.value)
    }));

    return (
        <>
            <Head title="Laporan Analisis Pembayaran" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            {/* Header Navigation Tab System */}
                            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Analisis & Laporan Transaksi</h1>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Periode Laporan: <span className="font-semibold text-gray-600">{startDate ? formatDate(startDate) : 'Awal'}</span> s/d <span className="font-semibold text-gray-600">{endDate ? formatDate(endDate) : 'Sekarang'}</span>
                                    </p>
                                </div>

                                <div className="join bg-base-100 border shadow-sm rounded-xl">
                                    <Link href={route('admin.kopi-times.transaction.index')} className="btn join-item btn-sm font-medium">
                                        <ListFilter size={14} /> Daftar Transaksi
                                    </Link>
                                    <button className="btn join-item btn-sm btn-primary font-bold">
                                        <BarChart3 size={14} /> Grafik & Report
                                    </button>
                                </div>
                            </div>

                            {/* STATISTIK BOX */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">User Aktif Membeli</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.total_users}</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users size={24} /></div>
                                    </div>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Volume Transaksi</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.total_transactions}</p>
                                        </div>
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><Receipt size={24} /></div>
                                    </div>
                                </Card>
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Omzet Bersih (Paid)</p>
                                            <p className="text-2xl lg:text-3xl font-bold text-green-700 mt-1">{formatCurrency(statistics.total_revenue || 0)}</p>
                                        </div>
                                        <div className="p-3 bg-green-50 text-green-600 rounded-full"><Wallet size={24} /></div>
                                    </div>
                                </Card>
                            </div>

                            {/* PANEL REKOMENDASI AI (Ditenagai oleh Gemini 1.5 Flash) */}
                            {ai_insights && ai_insights.has_data && (
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-200">
                                                <Sparkles size={18} className="animate-pulse" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-800">AI Business Insights & Saran Strategi</h2>
                                                <p className="text-xs text-gray-500">{ai_insights.summary}</p>
                                            </div>
                                        </div>
                                        {/* Badge Indicator Model AI */}
                                        <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-purple-200/60 text-purple-700 border border-purple-300 w-max">
                                            Gemini 1.5 Flash
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 border-t border-purple-100 pt-4">
                                        {/* Kolom Kiri: Temuan Sistem */}
                                        <div>
                                            <h4 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-1.5">
                                                <AlertCircle size={15} /> Analisis Temuan AI
                                            </h4>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                {ai_insights.findings.map((finding, idx) => (
                                                    <li key={idx} className="flex gap-2 items-start bg-white/60 p-2.5 rounded-lg border border-purple-100/50">
                                                        <span className="text-purple-600 font-bold">•</span>
                                                        <span dangerouslySetInnerHTML={{ __html: finding }} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Kolom Kanan: Rekomendasi Aksi */}
                                        <div>
                                            <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                                                <CheckCircle2 size={15} className="text-indigo-600" /> Rekomendasi Aksi Kedepan
                                            </h4>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                {ai_insights.recommendations.map((rec, idx) => (
                                                    <li key={idx} className="flex gap-2 items-start bg-indigo-600/5 text-indigo-950 p-2.5 rounded-lg border border-indigo-100">
                                                        <span className="text-indigo-600 font-bold">✓</span>
                                                        <span>{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FILTER PANEL */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <Calendar size={18} className="text-gray-500 hidden md:block" />
                                        <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full md:w-40 text-sm" />
                                        <span className="text-gray-400">-</span>
                                        <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full md:w-40 text-sm" />
                                    </div>
                                    <div className="flex flex-row gap-2 w-full md:w-auto justify-end">
                                        <div className="w-56">
                                            <InputSelect value={packageId} onChange={(e) => setPackageId(e.target.value)} options={packageOptions} />
                                        </div>
                                        <button type="button" onClick={handleReset} disabled={!isFilterApplied} className={`btn btn-square btn-outline rounded-lg ${isFilterApplied ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'opacity-40 cursor-not-allowed text-gray-300'}`}>
                                            <RotateCcw size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            {/* SEKTOR GRAFIK UTAMA */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Card>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-gray-800">Tren Pertumbuhan Omzet</h3>
                                            <p className="text-xs text-gray-500">Akumulasi penjualan sukses harian (Status Paid)</p>
                                        </div>
                                        <div className="w-full h-80">
                                            {formattedChartData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                        <XAxis dataKey="date" tickFormatter={(t) => new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                                                        <YAxis tickFormatter={(v) => `Rp ${v.toLocaleString('id-ID')}`} stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} width={80} />
                                                        <Tooltip formatter={(val) => [formatCurrency(val), 'Revenue']} labelFormatter={(l) => formatDate(l)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                                        <defs>
                                                            <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                                                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <Area type="monotone" dataKey="total_revenue" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReport)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-gray-400 text-sm">Tidak ada transaksi berbayar pada periode ini.</div>
                                            )}
                                        </div>
                                    </Card>
                                </div>

                                <div>
                                    <Card>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-gray-800">Performa Paket</h3>
                                            <p className="text-xs text-gray-500">Jumlah paket terjual dalam kuantitas</p>
                                        </div>
                                        <div className="w-full h-80">
                                            {formattedPackageDistribution.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={formattedPackageDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                                        <XAxis type="number" stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                                                        <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={11} width={70} axisLine={false} tickLine={false} />
                                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                                        <Bar dataKey="value" name="Terjual" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-gray-400 text-sm">Belum ada paket yang terjual.</div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}