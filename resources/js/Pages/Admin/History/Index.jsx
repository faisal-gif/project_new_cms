import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import { History, User, FileText, Database, Clock, ChevronDown, Activity } from 'lucide-react';

// --- HELPER FUNCTIONS ---
// 1. Membersihkan key database (contoh: 'distribution_status' menjadi 'Distribution Status')
const formatKey = (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// 2. Memformat value agar rapi (menangani nilai kosong atau boolean/true-false)
const formatValue = (val) => {
    if (val === null || val === undefined || val === '') {
        return <span className="italic text-base-content/40">Kosong</span>;
    }
    if (typeof val === 'boolean') {
        return val ? 'Ya' : 'Tidak';
    }
    return String(val);
};

// 3. Menganalisis Tipe Aksi untuk warna Badge
const parseAction = (description) => {
    if (!description) return { badge: 'Aktivitas', color: 'bg-base-200 text-base-content', text: 'Tidak ada deskripsi.' };

    const descLower = description.toLowerCase();
    let badge = 'Aktivitas';
    let color = 'bg-base-200 text-base-content';
    let text = description;

    // Kategori bawaan Spatie
    if (description === 'created') {
        return { badge: 'Dibuat', color: 'bg-success/15 text-success border-success/30', text: 'Menambahkan data baru ke sistem.' };
    }
    if (description === 'updated') {
        return { badge: 'Diedit', color: 'bg-warning/15 text-warning-content border-warning/30', text: 'Memperbarui data yang sudah ada.' };
    }
    if (description === 'deleted') {
        return { badge: 'Dihapus', color: 'bg-error/15 text-error border-error/30', text: 'Menghapus data dari sistem.' };
    }

    // Kategori Custom (Log Manual)
    if (descLower.includes('import')) {
        badge = 'Import';
        color = 'bg-info/15 text-info border-info/30';
    } else if (descLower.includes('buat') || descLower.includes('tambah')) {
        badge = 'Dibuat';
        color = 'bg-success/15 text-success border-success/30';
    } else if (descLower.includes('edit') || descLower.includes('update')) {
        badge = 'Diedit';
        color = 'bg-warning/15 text-warning-content border-warning/30';
    }

    return { badge, color, text };
};


export default function Index({ activities }) {

  
    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Aktivitas (Log)" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                
                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <History className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-base-content">Riwayat Sistem</h1>
                        <p className="text-base-content/60 mt-1 text-sm md:text-base">
                            Pantau seluruh jejak aktivitas, perubahan data, dan histori operasional.
                        </p>
                    </div>
                </div>

                {/* --- MAIN LIST CARD --- */}
                <Card padding="p-0" className="border border-base-200 bg-transparent shadow-none overflow-hidden">
                    <div className="space-y-4">
                        {activities.data.length > 0 ? (
                            activities.data.map((log) => {
                                const action = parseAction(log.description);
                                const hasDetails = Object.keys(log.properties).length > 0;

                                return (
                                    <div key={log.id} className="bg-base-100 rounded-2xl border border-base-200 p-5 hover:shadow-md transition-all duration-200">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            
                                            {/* KOLOM 1: Waktu & User */}
                                            <div className="w-full lg:w-56 flex-shrink-0 flex flex-col space-y-3 border-b lg:border-b-0 lg:border-r border-base-200 pb-4 lg:pb-0 pr-0 lg:pr-4">
                                                <div className="flex items-center gap-2 text-base-content/70">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{log.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-2 font-semibold text-primary">
                                                    <div className="bg-primary/10 p-1.5 rounded-full flex-shrink-0">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm line-clamp-1">
                                                        {log.causer_name?.trim() ? log.causer_name : 'Sistem / Super Admin'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* KOLOM 2: Modul & Aksi */}
                                            <div className="flex-1 flex flex-col justify-center space-y-2.5">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <div className="flex items-center gap-1.5 font-bold text-base">
                                                        <Database className="w-4 h-4 text-base-content/40" />
                                                        {log.log_name}
                                                    </div>
                                                    <span className="text-[11px] font-bold text-base-content/50 bg-base-200 px-2 py-0.5 rounded-md tracking-wider">
                                                        ID: {log.subject_id}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-start sm:items-center gap-2.5 flex-col sm:flex-row">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${action.color}`}>
                                                        {action.badge}
                                                    </span>
                                                    <span className="text-sm text-base-content/80 font-medium italic">
                                                        {action.text}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* KOLOM 3: Detail Dropdown JSON */}
                                            <div className="w-full lg:w-5/12 flex items-center justify-end">
                                                {hasDetails ? (
                                                    <details className="group w-full bg-base-200/50 rounded-xl border border-base-200 [&_summary::-webkit-details-marker]:hidden">
                                                        <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-base-200 transition-colors rounded-xl">
                                                            <div className="flex items-center gap-2 text-sm font-bold text-primary select-none">
                                                                <FileText className="w-4 h-4" />
                                                                Lihat Detail Data
                                                            </div>
                                                            <ChevronDown className="w-4 h-4 text-base-content/50 transition-transform group-open:rotate-180" />
                                                        </summary>
                                                        
                                                        <div className="p-4 border-t border-base-200 text-xs font-mono">
                                                            <div className="grid grid-cols-1 gap-5">
                                                                
                                                                {/* --- DATA BARU --- */}
                                                                {log.properties.attributes && (
                                                                    <div className="bg-base-100 p-4 rounded-xl border border-success/30 shadow-sm">
                                                                        <p className="font-bold text-success mb-3 text-[10px] uppercase tracking-wider border-b border-success/10 pb-2">
                                                                            Data Tersimpan:
                                                                        </p>
                                                                        <ul className="space-y-2.5">
                                                                            {Object.entries(log.properties.attributes).map(([key, value]) => (
                                                                                <li key={key} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-1 sm:gap-4 border-b border-base-200/50 pb-2.5 last:border-0 last:pb-0">
                                                                                    <span className="text-base-content/60 font-medium break-words leading-relaxed">
                                                                                        {formatKey(key)}
                                                                                    </span>
                                                                                    <span className="font-semibold text-base-content break-words leading-relaxed">
                                                                                        {formatValue(value)}
                                                                                    </span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* --- DATA LAMA --- */}
                                                                {log.properties.old && (
                                                                    <div className="bg-base-100 p-4 rounded-xl border border-error/30 shadow-sm opacity-90">
                                                                        <p className="font-bold text-error mb-3 text-[10px] uppercase tracking-wider border-b border-error/10 pb-2">
                                                                            Data Sebelumnya:
                                                                        </p>
                                                                        <ul className="space-y-2.5">
                                                                            {Object.entries(log.properties.old).map(([key, value]) => (
                                                                                <li key={key} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-1 sm:gap-4 border-b border-base-200/50 pb-2.5 last:border-0 last:pb-0">
                                                                                    <span className="text-base-content/60 font-medium break-words leading-relaxed">
                                                                                        {formatKey(key)}
                                                                                    </span>
                                                                                    <span className="font-semibold text-base-content break-words leading-relaxed line-through decoration-error/50">
                                                                                        {formatValue(value)}
                                                                                    </span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                
                                                            </div>
                                                        </div>
                                                    </details>
                                                ) : (
                                                    <div className="w-full p-3 bg-base-200/30 rounded-xl border border-dashed border-base-200 text-center flex items-center justify-center gap-2">
                                                        <Activity className="w-4 h-4 text-base-content/30" />
                                                        <span className="text-sm text-base-content/40 italic">Tanpa Detail Data</span>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-16 bg-base-100 rounded-2xl border border-base-200">
                                <History className="h-12 w-12 text-base-content/20 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-base-content">Log Kosong</h3>
                                <p className="text-base-content/60 text-sm">Belum ada riwayat aktivitas yang tercatat di dalam sistem.</p>
                            </div>
                        )}
                    </div>

                    {/* --- PAGINASI --- */}
                    {activities.links && activities.links.length > 3 && (
                        <div className="flex justify-center mt-8">
                            <div className="join shadow-sm border border-base-200">
                                {activities.links.map((link, index) => (
                                    <Link 
                                        key={index} 
                                        href={link.url || '#'} 
                                        className={`join-item btn btn-sm ${link.active ? 'btn-primary' : 'bg-base-100 hover:bg-base-200'} ${!link.url ? 'btn-disabled bg-base-200 text-base-content/30' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

            </div>
        </AuthenticatedLayout>
    );
}