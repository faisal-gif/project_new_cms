import Card from '@/Components/Card';
import InputSelect from '@/Components/InputSelect';
import InputWithPrefix from '@/Components/InputWithPrefix';
import PaginationDaisy from '@/Components/PaginationDaisy';
import TextInput from '@/Components/TextInput';
import { Badge } from '@/Components/ui/badge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDateTime, formatNumber } from '@/Utils/formatter';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Download, Link2, Plus, Search, RefreshCcw } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Select from "react-select";
import { toast } from 'sonner';

export default function Index({ news, writers, kanals, filters }) {
    // 1. State Management
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');
    const [writer, setWriter] = useState(() => filters.writer || '');
    const [kanal, setKanal] = useState(() => filters.kanal || '');
    const [startDate, setStartDate] = useState(() => filters.start_date || '');
    const [endDate, setEndDate] = useState(() => filters.end_date || '');
    const [copiedId, setCopiedId] = useState(null);

    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];
    const INDEX_ROUTE = route('admin.nasional.news.index');
    const isFirst = useRef(true);

    // 2. Helper Permissions
    const hasPermission = (permissions) => {
        if (Array.isArray(permissions)) {
            return permissions.some(permission => userPermissions.includes(permission));
        }
        return userPermissions.includes(permissions);
    };

    // 3. Helper Text formatting
    const createSlug = (text) => {
        if (!text) return '';
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    // 4. Efek Filter dengan Debounce
    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        let timeout = null;
        const queryPayload = {
            search,
            status,
            writer,
            kanal,
            start_date: startDate,
            end_date: endDate,
            page: 1
        };

        if (search !== filters.search) {
            timeout = setTimeout(() => {
                router.get(INDEX_ROUTE, queryPayload, { preserveState: true, replace: true });
            }, 400);
        } else {
            router.get(INDEX_ROUTE, queryPayload, { preserveState: true, replace: true });
        }

        return () => timeout && clearTimeout(timeout);
    }, [search, status, writer, kanal, startDate, endDate]);

    // 5. Reset Filter
    const handleReset = () => {
        setSearch('');
        setStatus('');
        setWriter('');
        setKanal('');
        setStartDate('');
        setEndDate('');

        router.get(
            INDEX_ROUTE,
            { search: '', status: '', writer: '', kanal: '', start_date: '', end_date: '', page: 1 },
            { preserveState: true, replace: true }
        );
    };

    // 6. Helper Salin Tautan
    const handleCopyLink = (newsItem) => {
        const url = `https://timesindonesia.co.id/${newsItem.kanal?.catnews_slug}/${newsItem.news_id}/${createSlug(newsItem.news_title)}`;

        navigator.clipboard.writeText(url)
            .then(() => {
                setCopiedId(newsItem.news_id);
                toast.success('Tautan berita berhasil disalin!'); // Menggunakan Toast (Bukan Alert)
                setTimeout(() => setCopiedId(null), 2000);
            })
            .catch((err) => {
                console.error('Gagal menyalin link: ', err);
                toast.error('Gagal menyalin tautan.');
            });
    };

    // 7. UI Helpers (Badges)
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
            case '0':
            case 0:
                return <Badge variant="secondary" className="shadow-none">Pending</Badge>;
            case "Review":
            case '2':
            case 2:
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 shadow-none border-yellow-200">Review</Badge>;
            case "On Pro":
            case '3':
            case 3:
                return <Badge variant="destructive" className="shadow-none">OnPro</Badge>;
            case "Publish":
            case '1':
            case 1:
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 shadow-none border-green-200">Publish</Badge>;
            default:
                return <Badge variant="outline" className="shadow-none">{status}</Badge>;
        }
    };

    const getHeadlineBadge = (status) => {
        switch (status) {
            case '1':
            case 1:
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 shadow-none border-blue-200">ON</Badge>;
            case '0':
            case 0:
            case null:
                return <Badge variant="secondary" className="shadow-none text-muted-foreground">OFF</Badge>;
            default:
                return <Badge variant="outline" className="shadow-none">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Berita Nasional" />
            
            <div className="py-8 sm:py-12 bg-muted/20 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header & Breadcrumbs */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Daftar Berita Nasional</h1>
                            <div className="breadcrumbs text-sm text-muted-foreground mt-1">
                                <ul>
                                    <li><Link href={route('dashboard')}>Beranda</Link></li>
                                    <li className="font-medium text-foreground">Berita Nasional</li>
                                </ul>
                            </div>
                        </div>

                        {/* Tombol Aksi Utama */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href={route('admin.nasional.news.report.index')} className="btn btn-outline btn-sm sm:btn-md shadow-sm">
                                <Download size={16} className="mr-1" /> Report Excel
                            </Link>
                            {hasPermission('create news nasional') && (
                                <Link href={route('admin.nasional.news.create')} className="btn btn-primary btn-sm sm:btn-md shadow-sm">
                                    <Plus size={16} className="mr-1" /> Tambah Berita
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Filter Section */}
                    <Card className="shadow-sm border-muted">
                        <div className="p-4 sm:p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-foreground flex items-center">
                                    <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                                    Filter Pencarian
                                </h3>
                            </div>
                            
                            {/* Baris 1: Grid System untuk Dropdown & Search */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="col-span-1 sm:col-span-2 md:col-span-1">
                                    <InputWithPrefix
                                        prefix={<Search size={16} />}
                                        placeholder="Cari ID atau Judul..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Select
                                        options={writers}
                                        placeholder="Semua Penulis"
                                        value={writers.find(option => option.value === writer) || null}
                                        onChange={(e) => setWriter(e?.value || '')}
                                        isClearable
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <Select
                                        options={kanals}
                                        placeholder="Semua Kanal"
                                        value={kanals.find(option => option.value === kanal) || null}
                                        onChange={(e) => setKanal(e?.value || '')}
                                        isClearable
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <InputSelect
                                        value={status}
                                        placeholder='Semua Status'
                                        onChange={(e) => setStatus(e.target.value)}
                                        options={[
                                            { label: "Semua Status", value: "" },
                                            { label: "Pending", value: "0" },
                                            { label: "Review", value: "2" },
                                            { label: "On Pro", value: "3" },
                                            { label: "Publish", value: "1" },
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* Baris 2: Date Range & Reset Button */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 items-end pt-2 border-t border-dashed">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dari Tanggal</label>
                                    <TextInput
                                        type="date"
                                        className="w-full text-sm"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sampai Tanggal</label>
                                    <TextInput
                                        type="date"
                                        className="w-full text-sm"
                                        value={endDate}
                                        min={startDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <button 
                                        type="button" 
                                        className="btn btn-ghost w-full border border-muted-foreground/20 text-muted-foreground hover:bg-muted/50" 
                                        onClick={handleReset}
                                    >
                                        <RefreshCcw size={14} className="mr-2" /> Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Table Section */}
                    <Card className="shadow-sm border-muted overflow-hidden">
                        
                        {/* MOBILE VERSION (Card Mode) */}
                        <div className="md:hidden flex flex-col gap-0 divide-y">
                            {news.data.length > 0 ? news.data.map((n) => (
                                <div key={n.news_id} className="p-4 bg-background hover:bg-muted/10 transition-colors space-y-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-sm leading-snug">{n.news_title}</p>
                                            <p className="text-xs text-muted-foreground font-medium">{n.news_writer}</p>
                                        </div>
                                        <div className="shrink-0">
                                            {getStatusBadge(n.news_status)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/20 p-2.5 rounded-md">
                                        <div><span className="text-muted-foreground block mb-0.5">Kanal:</span> <span className="font-medium">{n.kanal?.catnews_title || '-'}</span></div>
                                        <div><span className="text-muted-foreground block mb-0.5">Publish:</span> <span className="font-medium">{formatDateTime(n.news_datepub)}</span></div>
                                        <div className="flex items-center gap-2"><span className="text-muted-foreground">Headline:</span> {getHeadlineBadge(n.news_headline)}</div>
                                        <div><span className="text-muted-foreground block mb-0.5">Views:</span> <span className="font-medium">{formatNumber(n.view_data?.pageviews)}</span></div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        {hasPermission('edit news nasional') && (
                                            <Link href={route('admin.nasional.news.edit', n.news_id)} className="btn btn-sm btn-outline flex-1">Edit</Link>
                                        )}
                                        <button onClick={() => handleCopyLink(n)} className="btn btn-sm btn-outline">
                                            {copiedId === n.news_id ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4 text-muted-foreground" />}
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">Data tidak ditemukan.</div>
                            )}
                        </div>

                        {/* DESKTOP VERSION (Table Mode) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider border-b">
                                    <tr>
                                        <th className="py-4 font-semibold">ID</th>
                                        <th className="py-4 font-semibold">Judul Berita</th>
                                        <th className="py-4 font-semibold">Kanal & Penulis</th>
                                        <th className="py-4 font-semibold">Tgl Publish</th>
                                        <th className="py-4 font-semibold text-center">HL</th>
                                        <th className="py-4 font-semibold text-center">Views</th>
                                        <th className="py-4 font-semibold">Status</th>
                                        <th className="py-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/50">
                                    {news.data.length > 0 ? news.data.map((n) => (
                                        <tr key={n.news_id} className="hover:bg-muted/10 transition-colors group">
                                            <td className="text-muted-foreground font-medium text-xs align-top pt-4">#{n.news_id}</td>
                                            <td className="align-top pt-4">
                                                <p className="font-semibold text-foreground text-sm line-clamp-2 max-w-[300px]" title={n.news_title}>
                                                    {n.news_title}
                                                </p>
                                            </td>
                                            <td className="align-top pt-4">
                                                <div className="text-sm font-medium">{n.kanal?.catnews_title || '-'}</div>
                                                <div className="text-xs text-muted-foreground">{n.news_writer}</div>
                                            </td>
                                            <td className="text-xs align-top pt-4 whitespace-nowrap">
                                                {formatDateTime(n.news_datepub)}
                                            </td>
                                            <td className="text-center align-top pt-4">
                                                {getHeadlineBadge(n.news_headline)}
                                            </td>
                                            <td className="text-center align-top pt-4 font-medium text-sm text-muted-foreground">
                                                {formatNumber(n.view_data?.pageviews)}
                                            </td>
                                            <td className="align-top pt-4">
                                                {getStatusBadge(n.news_status)}
                                            </td>
                                            <td className="align-top pt-3 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    {hasPermission('edit news nasional') && (
                                                        <Link href={route('admin.nasional.news.edit', n.news_id)} className="btn btn-sm btn-outline border-muted-foreground/30 hover:bg-muted">
                                                            Edit
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleCopyLink(n)}
                                                        className="btn btn-sm btn-outline border-muted-foreground/30 hover:bg-muted"
                                                        title="Salin Tautan Berita"
                                                    >
                                                        {copiedId === n.news_id ? (
                                                            <Check className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <Link2 className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                                                Berita tidak ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    <PaginationDaisy data={news} />

                </div>
            </div>
        </AuthenticatedLayout>
    );
}