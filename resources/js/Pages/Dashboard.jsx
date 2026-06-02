import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Card from '@/Components/Card';
// Menambahkan import Camera dan Clock untuk dashboard fotografer
import { CheckIcon, Loader, Pause, Search, Database, Camera, Clock } from 'lucide-react';
import { useAuthorization } from '@/Hooks/useAuthorization';
import { formatNumber } from '@/Utils/formatter';

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const { hasAnyRole } = useAuthorization();

    // Komponen Khusus untuk Nasional & Daerah
    const StatRow = ({ data }) => (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                {data.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card color="bg-success">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <div className="text-4xl font-bold">{formatNumber(data.published)}</div>
                            <div className="mt-2 text-sm opacity-90">Published</div>
                        </div>
                        <CheckIcon className="w-16 h-16 text-success-content opacity-70" />
                    </div>
                </Card>
                <Card color="bg-warning">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <div className="text-4xl font-bold">{formatNumber(data.on_review)}</div>
                            <div className="mt-2 text-sm opacity-90">On Review</div>
                        </div>
                        <Search className="w-16 h-16 text-warning-content opacity-70" />
                    </div>
                </Card>
                <Card color="bg-error">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <div className="text-4xl font-bold">{formatNumber(data.on_progress)}</div>
                            <div className="mt-2 text-sm opacity-90">On Progress</div>
                        </div>
                        <Loader className="w-16 h-16 text-error-content opacity-70 animate-spin-slow" />
                    </div>
                </Card>
                <Card color="bg-secondary">
                    <div className="flex items-center justify-between text-gray-600">
                        <div>
                            <div className="text-4xl font-bold">{formatNumber(data.pending)}</div>
                            <div className="mt-2 text-sm opacity-90">Pending</div>
                        </div>
                        <Pause className="w-16 h-16 text-gray-600 opacity-70" />
                    </div>
                </Card>
            </div>
        </div>
    );

    // Komponen Khusus untuk Fotografer
    const PhotoStats = ({ data }) => (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                Performa Fotografi Anda
            </h3>
            {/* Menggunakan grid 2 kolom agar Card terlihat lebih proporsional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                <Card color="bg-info">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <div className="text-4xl font-bold">{formatNumber(data.uploaded_today || 0)}</div>
                            <div className="mt-2 text-sm font-medium opacity-90">Diunggah Hari Ini</div>
                        </div>
                        <Camera className="w-16 h-16 text-info-content opacity-70" />
                    </div>
                </Card>
                
                <Card color="bg-warning">
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <div className="text-4xl font-bold">{formatNumber(data.pending_review || 0)}</div>
                            <div className="mt-2 text-sm font-medium opacity-90">Menunggu Review Redaksi</div>
                        </div>
                        <Clock className="w-16 h-16 text-warning-content opacity-70" />
                    </div>
                </Card>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">

                    {/* Tampilan Admin / Editor */}
                    {hasAnyRole(['super-admin','admin', 'editor']) && stats.news && (
                        <>
                            {/* Widget Khusus Master Data (DB Tampungan) */}
                            <div className="mb-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700">
                                    <div className="flex items-center gap-4 text-white">
                                        <div className="p-3 bg-slate-600 rounded-lg">
                                            <Database className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{stats.news.utama.title}</h3>
                                            <p className="text-sm text-slate-300">Total entri is_code pada database sentral</p>
                                        </div>
                                    </div>
                                    <div className="text-5xl font-black text-white">
                                        {formatNumber(stats.news.utama.total)}
                                    </div>
                                </div>
                            </div>

                            {/* Widget Operasional (Nasional & Daerah) */}
                            <StatRow data={stats.news.nasional} />
                            <StatRow data={stats.news.daerah} />
                        </>
                    )}

                    {/* Tampilan Fotografer */}
                    {hasAnyRole(['fotografer']) && stats.photos && (
                        <div className="mb-10">
                            <PhotoStats data={stats.photos} />
                            
                            {/* Tambahan opsional: Call to Action untuk fotografer */}
                          
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}