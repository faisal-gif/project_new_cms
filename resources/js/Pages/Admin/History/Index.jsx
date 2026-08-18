import React, { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import TextInput from '@/Components/TextInput';
import InputSelect from '@/Components/InputSelect';
import PaginationDaisy from '@/Components/PaginationDaisy';
import { Button } from '@/Components/ui/button';
import { History, User, FileText, Database, Clock, ChevronDown, Activity, Search, X } from 'lucide-react';

// --- HELPER FUNCTIONS ---
const formatKey = (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (val) => {
    if (val === null || val === undefined || val === '') {
        return <span className="italic text-foreground/40">Kosong</span>;
    }
    if (typeof val === 'boolean') return val ? 'Ya' : 'Tidak';
    if (typeof val === 'object') return <span className="break-all">{JSON.stringify(val)}</span>;
    return String(val);
};

// Menganalisis Tipe Aksi untuk warna Badge
const parseAction = (description) => {
    if (!description) return { badge: 'Aktivitas', color: 'bg-muted text-foreground border-border', text: 'Tidak ada deskripsi.' };

    const d = description.toLowerCase();

    if (description === 'created') return { badge: 'Dibuat', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', text: 'Menambahkan data baru ke sistem.' };
    if (description === 'updated') return { badge: 'Diedit', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', text: 'Memperbarui data yang sudah ada.' };
    if (description === 'deleted') return { badge: 'Dihapus', color: 'bg-destructive/15 text-destructive border-destructive/30', text: 'Menghapus data dari sistem.' };

    if (d.includes('import')) return { badge: 'Import', color: 'bg-sky-500/15 text-sky-600 border-sky-500/30', text: description };
    if (d.includes('buat') || d.includes('tambah')) return { badge: 'Dibuat', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', text: description };
    if (d.includes('edit') || d.includes('update')) return { badge: 'Diedit', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', text: description };
    if (d.includes('hapus')) return { badge: 'Dihapus', color: 'bg-destructive/15 text-destructive border-destructive/30', text: description };

    return { badge: 'Aktivitas', color: 'bg-muted text-foreground border-border', text: description };
};

export default function Index({ activities, filters = {}, logNames = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [logName, setLogName] = useState(filters.log_name || '');
    const [action, setAction] = useState(filters.action || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.history.index');

    // Debounce: satu efek untuk search + filter, kirim setelah 350ms diam.
    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }
        const t = setTimeout(() => {
            router.get(
                INDEX_ROUTE,
                { search, log_name: logName, action, page: 1 },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 350);
        return () => clearTimeout(t);
    }, [search, logName, action]);

    const resetFilters = () => {
        setSearch('');
        setLogName('');
        setAction('');
    };

    const hasFilter = search || logName || action;

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Aktivitas (Log)" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-0">

                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 bg-background p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
                    <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                        <History className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Riwayat Sistem</h1>
                        <p className="text-foreground/60 mt-1 text-sm">
                            Pantau seluruh jejak aktivitas, perubahan data, dan histori operasional.
                        </p>
                    </div>
                </div>

                {/* --- TOOLBAR FILTER --- */}
                <Card className="border border-border">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <TextInput
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari deskripsi, modul, ID, atau nama pengguna…"
                                className="w-full pl-9"
                            />
                        </div>
                        <div className="w-full md:w-52">
                            <InputSelect
                                value={logName}
                                onChange={(e) => setLogName(e.target.value)}
                                placeholder="Semua Modul"
                                options={[
                                    { label: 'Semua Modul', value: '' },
                                    ...logNames.map((n) => ({ label: n, value: n })),
                                ]}
                            />
                        </div>
                        <div className="w-full md:w-44">
                            <InputSelect
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                placeholder="Semua Aksi"
                                options={[
                                    { label: 'Semua Aksi', value: '' },
                                    { label: 'Dibuat', value: 'created' },
                                    { label: 'Diedit', value: 'updated' },
                                    { label: 'Dihapus', value: 'deleted' },
                                ]}
                            />
                        </div>
                        {hasFilter && (
                            <Button
                                onClick={resetFilters}
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-foreground/60"
                                type="button"
                            >
                                <X className="w-4 h-4" /> Reset
                            </Button>
                        )}
                    </div>
                </Card>

                {/* --- TIMELINE LIST --- */}
                {activities.data.length > 0 ? (
                    <div className="relative space-y-3">
                        {activities.data.map((log) => {
                            const act = parseAction(log.description);
                            const hasDetails = log.properties && Object.keys(log.properties).length > 0;

                            return (
                                <div
                                    key={log.id}
                                    className="bg-background rounded-2xl border border-border p-4 sm:p-5 hover:shadow-md transition-all duration-200"
                                >
                                    {/* Baris atas: badge aksi + modul + waktu */}
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${act.color}`}>
                                            {act.badge}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 font-bold text-sm text-foreground">
                                            <Database className="w-4 h-4 text-foreground/40" />
                                            {log.log_name || 'Umum'}
                                        </span>
                                        {log.subject_type && (
                                            <span className="text-[11px] font-semibold text-foreground/50 bg-muted px-2 py-0.5 rounded-md">
                                                {log.subject_type}#{log.subject_id}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground/50 ml-auto">
                                            <Clock className="w-3.5 h-3.5" />
                                            {log.created_at}
                                        </span>
                                    </div>

                                    {/* Deskripsi */}
                                    <p className="text-sm text-foreground/80 mb-3">{act.text}</p>

                                    {/* Baris bawah: pelaku + tombol detail */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                                        <div className="inline-flex items-center gap-2 font-semibold text-primary">
                                            <div className="bg-primary/10 p-1.5 rounded-full flex-shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm">
                                                {log.causer_name?.trim() ? log.causer_name : 'Sistem / Super Admin'}
                                            </span>
                                        </div>

                                        {hasDetails ? (
                                            <details className="group w-full sm:w-auto sm:min-w-[18rem] bg-muted/50 rounded-xl border border-border [&_summary::-webkit-details-marker]:hidden">
                                                <summary className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted transition-colors rounded-xl">
                                                    <span className="flex items-center gap-2 text-sm font-bold text-primary select-none">
                                                        <FileText className="w-4 h-4" />
                                                        Lihat Detail Data
                                                    </span>
                                                    <ChevronDown className="w-4 h-4 text-foreground/50 transition-transform group-open:rotate-180" />
                                                </summary>

                                                <div className="p-3 border-t border-border text-xs">
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {log.properties.attributes && (
                                                            <DetailBlock
                                                                title="Data Tersimpan"
                                                                tone="success"
                                                                data={log.properties.attributes}
                                                            />
                                                        )}
                                                        {log.properties.old && (
                                                            <DetailBlock
                                                                title="Data Sebelumnya"
                                                                tone="error"
                                                                data={log.properties.old}
                                                                strike
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </details>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground/30 italic">
                                                <Activity className="w-3.5 h-3.5" /> Tanpa detail data
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-background rounded-2xl border border-border">
                        <History className="h-12 w-12 text-foreground/20 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-foreground">
                            {hasFilter ? 'Tidak ada hasil' : 'Log Kosong'}
                        </h3>
                        <p className="text-foreground/60 text-sm">
                            {hasFilter
                                ? 'Tidak ada aktivitas yang cocok dengan filter. Coba ubah atau reset filter.'
                                : 'Belum ada riwayat aktivitas yang tercatat di dalam sistem.'}
                        </p>
                    </div>
                )}

                {/* --- PAGINASI --- */}
                <div className="flex justify-center pt-2">
                    <PaginationDaisy data={activities} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Kelas literal (Tailwind JIT tidak bisa membaca kelas yang dirakit dinamis).
const TONE = {
    success: { box: 'border-emerald-500/30', head: 'text-emerald-600 border-emerald-500/10', strike: 'decoration-success/50' },
    error: { box: 'border-destructive/30', head: 'text-destructive border-destructive/10', strike: 'decoration-error/50' },
};

// Blok detail (data baru / data lama) — dipisah biar tidak duplikat markup.
function DetailBlock({ title, tone, data, strike = false }) {
    const c = TONE[tone] ?? TONE.success;
    return (
        <div className={`bg-background p-3 rounded-xl border ${c.box} shadow-sm`}>
            <p className={`font-bold mb-2 text-[10px] uppercase tracking-wider border-b pb-2 ${c.head}`}>
                {title}
            </p>
            <ul className="space-y-2">
                {Object.entries(data).map(([key, value]) => (
                    <li
                        key={key}
                        className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-0.5 sm:gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0"
                    >
                        <span className="text-foreground/60 font-medium break-words">{formatKey(key)}</span>
                        <span className={`font-semibold text-foreground break-words ${strike ? `line-through ${c.strike}` : ''}`}>
                            {formatValue(value)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
