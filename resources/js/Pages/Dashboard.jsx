import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Card from '@/Components/Card';
import {
    CheckIcon, Loader, Pause, Search, Database, Camera, Clock,
    CheckCircle2, AlertCircle, XCircle, Activity, FileEdit, Coffee, FileStack, Newspaper,
    Wallet, Receipt, UserPlus, TrendingUp, Eye
} from 'lucide-react';
import { useAuthorization } from '@/Hooks/useAuthorization';
import { formatNumber, formatRupiah } from '@/Utils/formatter';

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const { hasPermission } = useAuthorization();

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

    // 4b. KOMPONEN: Berita Nasional Populer Hari Ini
    const PopularNews = ({ items }) => (
        <div className="mb-8 md:mb-10">
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 md:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-600" />
                Berita Nasional Populer Hari Ini
            </h3>
            {items.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada berita nasional yang tayang hari ini.</p>
            ) : (
                <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 bg-white">
                    {items.map((item, index) => (
                        <div key={item.news_id} className="flex items-center gap-3 px-3 py-2 md:px-4 md:py-3">
                            <span className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs md:text-sm font-bold ${index < 3 ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {index + 1}
                            </span>
                            <span className="flex-1 text-sm md:text-base text-gray-700 truncate">{item.news_title}</span>
                            <span className="flex-shrink-0 flex items-center gap-1 text-xs md:text-sm text-gray-500">
                                <Eye className="w-4 h-4" /> {formatNumber(item.pageviews)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // 5. KOMPONEN: Berita Berbayar (Kopi Times / AJP)
    const PaidNewsStats = ({ data, Icon = FileStack, accent = 'bg-amber-700', iconClass = 'text-amber-700' }) => (
        <div className="mb-8 md:mb-10">
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 md:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconClass}`} />
                {data.title}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card color={accent}>
                    <div className="flex items-center justify-between text-white p-1 md:p-2">
                        <div>
                            <div className="text-2xl md:text-4xl font-bold">{formatNumber(data.total)}</div>
                            <div className="mt-1 md:mt-2 text-[10px] md:text-sm opacity-90">Total Berita</div>
                        </div>
                        <FileStack className="w-8 h-8 md:w-16 md:h-16 text-white opacity-40" />
                    </div>
                </Card>
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
                            <div className="text-2xl md:text-4xl font-bold">{formatNumber(data.on_pro)}</div>
                            <div className="mt-1 md:mt-2 text-[10px] md:text-sm opacity-90">On Pro</div>
                        </div>
                        <Loader className="w-8 h-8 md:w-16 md:h-16 text-warning-content opacity-70 animate-spin-slow" />
                    </div>
                </Card>
                <Card color="bg-secondary">
                    <div className="flex items-center justify-between text-gray-600 p-1 md:p-2">
                        <div>
                            <div className="text-2xl md:text-4xl font-bold">{formatNumber(data.draft)}</div>
                            <div className="mt-1 md:mt-2 text-[10px] md:text-sm opacity-90">Draft</div>
                        </div>
                        <FileEdit className="w-8 h-8 md:w-16 md:h-16 text-gray-600 opacity-70" />
                    </div>
                </Card>
            </div>

            {data.payment && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
                    <Card color="bg-emerald-600">
                        <div className="flex items-center justify-between text-white p-2">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">{formatRupiah(data.payment.revenue)}</div>
                                <div className="mt-1 text-xs md:text-sm opacity-90">Pendapatan Bulan Ini</div>
                            </div>
                            <Wallet className="w-10 h-10 md:w-14 md:h-14 text-emerald-200 opacity-70" />
                        </div>
                    </Card>
                    <Card color="bg-sky-700">
                        <div className="flex items-center justify-between text-white p-2">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">{formatNumber(data.payment.transactions)}</div>
                                <div className="mt-1 text-xs md:text-sm opacity-90">Transaksi Lunas Bulan Ini</div>
                            </div>
                            <Receipt className="w-10 h-10 md:w-14 md:h-14 text-sky-200 opacity-70" />
                        </div>
                    </Card>
                    <Card color="bg-violet-700">
                        <div className="flex items-center justify-between text-white p-2">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">{formatNumber(data.new_users || 0)}</div>
                                <div className="mt-1 text-xs md:text-sm opacity-90">Penulis Baru Aktif Bulan Ini</div>
                            </div>
                            <UserPlus className="w-10 h-10 md:w-14 md:h-14 text-violet-200 opacity-70" />
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Mengurangi padding vertikal di mobile (py-4) dan kembali ke py-6 di desktop */}
            <div className="py-4 md:py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Tampilan Admin / Editor */}
                    {hasPermission('view dashboard news') && stats.news && (
                        <>
                            {hasPermission('view dashboard editor performance') && stats.editor_performance && (
                                <EditorPerformance data={stats.editor_performance} />
                            )}

                            {stats.news.utama && (
                                <MasterDataStats data={stats.news.utama} />
                            )}

                            {stats.news.nasional && <StatRow data={stats.news.nasional} />}
                            {stats.news.daerah && <StatRow data={stats.news.daerah} />}

                            {stats.news.popular_today && <PopularNews items={stats.news.popular_today} />}
                        </>
                    )}

                    {/* Tampilan Kopi Times */}
                    {hasPermission('view dashboard kopi times') && stats.kopi_times && (
                        <PaidNewsStats data={stats.kopi_times} Icon={Coffee} accent="bg-amber-700" iconClass="text-amber-700" />
                    )}

                    {/* Tampilan AJP */}
                    {hasPermission('view dashboard ajp') && stats.ajp && (
                        <PaidNewsStats data={stats.ajp} Icon={Newspaper} accent="bg-teal-700" iconClass="text-teal-700" />
                    )}

                    {/* Tampilan Fotografer */}
                    {hasPermission('view dashboard photo') && stats.photos && (
                        <div className="mb-10">
                            <PhotoStats data={stats.photos} />
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}