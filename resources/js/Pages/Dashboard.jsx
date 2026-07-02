import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Card from '@/Components/Card';
import { 
    CheckIcon, Loader, Pause, Search, Database, Camera, Clock, 
    CheckCircle2, AlertCircle, XCircle, Activity, FileEdit 
} from 'lucide-react';
import { useAuthorization } from '@/Hooks/useAuthorization';
import { formatNumber } from '@/Utils/formatter';

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const { hasAnyRole, hasRole } = useAuthorization();

    // 1. KOMPONEN: Performa Harian Editor
    const EditorPerformance = ({ data }) => (
        <div className="mb-8 md:mb-10">
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 md:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Aktivitas Anda Hari Ini
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                <Card color="bg-indigo-600">
                    <div className="flex items-center justify-between text-white p-2">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold">{formatNumber(data.total_today)}</div>
                            <div className="mt-1 md:mt-2 text-xs md:text-sm font-medium opacity-90">Total Berita Diedit</div>
                        </div>
                        <FileEdit className="w-12 h-12 md:w-16 md:h-16 text-indigo-300 opacity-70" />
                    </div>
                </Card>
                
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4 lg:col-span-2">
                    <Card color="bg-slate-700">
                        <div className="flex items-center justify-between text-white p-2">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">{formatNumber(data.nasional)}</div>
                                <div className="mt-1 text-xs opacity-90">Berita Nasional</div>
                            </div>
                        </div>
                    </Card>
                    <Card color="bg-slate-700">
                        <div className="flex items-center justify-between text-white p-2">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">{formatNumber(data.daerah)}</div>
                                <div className="mt-1 text-xs opacity-90">Berita Daerah</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );

    // 2. KOMPONEN: Master Data (Tampungan)
    const MasterDataStats = ({ data }) => (
        <div className="mb-8 md:mb-10">
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 md:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-600" />
                Status Distribusi Master Berita
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <Card color="bg-slate-500">
                    <div className="flex items-center justify-between text-white p-2">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold">{formatNumber(data.belum_tayang)}</div>
                            <div className="mt-1 md:mt-2 text-xs md:text-sm font-medium opacity-90">Belum Tayang</div>
                        </div>
                        <XCircle className="w-10 h-10 md:w-16 md:h-16 text-slate-300 opacity-70" />
                    </div>
                </Card>
                <Card color="bg-orange-500">
                    <div className="flex items-center justify-between text-white p-2">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold">{formatNumber(data.tayang_parsial)}</div>
                            <div className="mt-1 md:mt-2 text-xs md:text-sm font-medium opacity-90">Tayang Parsial</div>
                        </div>
                        <AlertCircle className="w-10 h-10 md:w-16 md:h-16 text-orange-300 opacity-70" />
                    </div>
                </Card>
                <Card color="bg-emerald-600">
                    <div className="flex items-center justify-between text-white p-2">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold">{formatNumber(data.tayang_semua)}</div>
                            <div className="mt-1 md:mt-2 text-xs md:text-sm font-medium opacity-90">Tayang Semua</div>
                        </div>
                        <CheckCircle2 className="w-10 h-10 md:w-16 md:h-16 text-emerald-300 opacity-70" />
                    </div>
                </Card>
            </div>
        </div>
    );

    // 3. KOMPONEN: Status Nasional & Daerah (Operasional)
    const StatRow = ({ data }) => (
        <div className="mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 md:mb-4 pb-2 border-b border-gray-200">
                {data.title}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card color="bg-success">
                    <div className="flex items-center justify-between text-white p-1 md:p-2">
                        <div>
                            <div className="text-2xl md:text-4xl font-bold">{formatNumber(data.published)}</div>
                            <div className="mt-1 md:mt-2 text-[10px] md:text-sm opacity-90">Published</div>
                        </div>
                        <CheckIcon className="w-8 h-8 md:w-16 md:h-16 text-success-content opacity-70" />
                    </div>
                </Card>
                <Card color="bg-warning">
                    <div className="flex items-center justify-between text-white p-1 md:p-2">
                        <div>
                            <div className="text-2xl md:text-4xl font-bold">{formatNumber(data.on_review)}</div>
                            <div className="mt-1 md:mt-2 text-[10px] md:text-sm opacity-90">On Review</div>
                        </div>
                        <Search className="w-8 h-8 md:w-16 md:h-16 text-warning-content opacity-70" />
                    </div>
                </Card>
                <Card color="bg-error">
                    <div className="flex items-center justify-between text-white p-1 md:p-2">
                        <div>
                            <div className="text-2xl md:text-4xl font-bold">{formatNumber(data.on_progress)}</div>
                            <div className="mt-1 md:mt-2 text-[10px] md:text-sm opacity-90">On Progress</div>
                        </div>
                        <Loader className="w-8 h-8 md:w-16 md:h-16 text-error-content opacity-70 animate-spin-slow" />
                    </div>
                </Card>
                <Card color="bg-secondary">
                    <div className="flex items-center justify-between text-gray-600 p-1 md:p-2">
                        <div>
                            <div className="text-2xl md:text-4xl font-bold">{formatNumber(data.pending)}</div>
                            <div className="mt-1 md:mt-2 text-[10px] md:text-sm opacity-90">Pending</div>
                        </div>
                        <Pause className="w-8 h-8 md:w-16 md:h-16 text-gray-600 opacity-70" />
                    </div>
                </Card>
            </div>
        </div>
    );

    // 4. KOMPONEN: Fotografer
    const PhotoStats = ({ data }) => (
        <div className="mb-8 md:mb-10">
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 md:mb-4 pb-2 border-b border-gray-200">
                Performa Fotografi Anda
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-4xl">
                <Card color="bg-info">
                    <div className="flex items-center justify-between text-white p-2">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold">{formatNumber(data.uploaded_today || 0)}</div>
                            <div className="mt-1 md:mt-2 text-xs md:text-sm font-medium opacity-90">Diunggah Hari Ini</div>
                        </div>
                        <Camera className="w-10 h-10 md:w-16 md:h-16 text-info-content opacity-70" />
                    </div>
                </Card>
                <Card color="bg-warning">
                    <div className="flex items-center justify-between text-white p-2">
                        <div>
                            <div className="text-3xl md:text-4xl font-bold">{formatNumber(data.pending_review || 0)}</div>
                            <div className="mt-1 md:mt-2 text-xs md:text-sm font-medium opacity-90">Menunggu Review</div>
                        </div>
                        <Clock className="w-10 h-10 md:w-16 md:h-16 text-warning-content opacity-70" />
                    </div>
                </Card>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Mengurangi padding vertikal di mobile (py-4) dan kembali ke py-6 di desktop */}
            <div className="py-4 md:py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Tampilan Admin / Editor */}
                    {hasAnyRole(['super-admin','admin', 'editor']) && stats.news && (
                        <>
                            {hasRole('editor') && stats.editor_performance && (
                                <EditorPerformance data={stats.editor_performance} />
                            )}

                            {stats.news.utama && (
                                <MasterDataStats data={stats.news.utama} />
                            )}

                            {stats.news.nasional && <StatRow data={stats.news.nasional} />}
                            {stats.news.daerah && <StatRow data={stats.news.daerah} />}
                        </>
                    )}

                    {/* Tampilan Fotografer */}
                    {hasAnyRole(['fotografer']) && stats.photos && (
                        <div className="mb-10">
                            <PhotoStats data={stats.photos} />
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}