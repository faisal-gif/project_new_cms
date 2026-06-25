import Card from '@/Components/Card'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { Download, Search, Image as ImageIcon, Eye, FileText, TrendingUp } from 'lucide-react'
import React from 'react'
import Select from "react-select"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/Components/ui/chart"

export default function ReportGalleryIndex({ summary, chart_data, fotografers, editors, kanals, filters }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing: exportProcessing } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        kanal: filters.kanal || '',
        fotografer: filters.fotografer || '',
        editor: filters.editor || '',
    });

    const handleApplyFilter = () => {
        router.get(route('admin.nasional.fotografi.report.index'), data, {
            preserveState: true,
            replace: true,
        });
    };

    // const handleExportExcel = () => {
    //     if (!data.start_date || !data.end_date) {
    //         alert("Rentang tanggal wajib diisi untuk melakukan export data.");
    //         return;
    //     }

    //     post(route('admin.gallery.report.export'), {
    //         preserveScroll: true,
    //     });
    // };

    const chartConfig = {
        total_galeri: {
            label: "Galeri Terbit",
            color: "hsl(var(--chart-3, 217 91% 60%))", // Warna biru untuk galeri
        },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan & Analitik Galeri" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Laporan Galeri Nasional</h1>
                        <p className="text-sm text-gray-500 mt-1">Pantau performa publikasi visual dan foto secara *real-time*.</p>
                    </div>

                    {/* SECTION 1: FILTER */}
                    <Card>
                        <div className="flex flex-col md:flex-row gap-4 items-end p-2">
                            <div className="w-full md:w-1/6">
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Dari Tanggal *</label>
                                <TextInput type="date" className="w-full" value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)} />
                            </div>
                            <div className="w-full md:w-1/6">
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Sampai Tanggal *</label>
                                <TextInput type="date" className="w-full" min={data.start_date} value={data.end_date}
                                    onChange={e => setData('end_date', e.target.value)} />
                            </div>
                            <div className="w-full md:w-1/6">
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Kanal Galeri</label>
                                <Select options={kanals} isClearable placeholder="Semua Kanal"
                                    value={kanals.find(k => k.value === data.kanal) || null}
                                    onChange={e => setData('kanal', e ? e.value : '')} />
                            </div>
                            <div className="w-full md:w-1/6">
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Fotografer</label>
                                <Select options={fotografers} isClearable placeholder="Semua Fotografer"
                                    value={fotografers.find(f => f.value === data.fotografer) || null}
                                    onChange={e => setData('fotografer', e ? e.value : '')} />
                            </div>
                            <div className="w-full md:w-1/6">
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">Editor</label>
                                <Select options={editors} isClearable placeholder="Semua Editor"
                                    value={editors.find(d => d.value === data.editor) || null}
                                    onChange={e => setData('editor', e ? e.value : '')} />
                            </div>

                            <div className="w-full md:w-1/6">
                                <button onClick={handleApplyFilter} className="btn btn-primary w-full">
                                    <Search size={18} /> Terapkan
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* SECTION 2: SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <Card className="bg-blue-50/50 border-blue-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500 rounded-xl text-white"><ImageIcon size={24} /></div>
                                <div>
                                    <p className="text-sm text-blue-600 font-semibold">Total Galeri</p>
                                    <p className="text-2xl font-bold text-blue-950">{summary.total_gallery.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-green-50/50 border-green-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500 rounded-xl text-white"><TrendingUp size={24} /></div>
                                <div>
                                    <p className="text-sm text-green-600 font-semibold">Galeri Terbit</p>
                                    <p className="text-2xl font-bold text-green-950">{summary.total_publish.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-yellow-50/50 border-yellow-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-500 rounded-xl text-white"><FileText size={24} /></div>
                                <div>
                                    <p className="text-sm text-yellow-600 font-semibold">Sedang Direview</p>
                                    <p className="text-2xl font-bold text-yellow-950">{summary.total_review.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-purple-50/50 border-purple-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500 rounded-xl text-white"><Eye size={24} /></div>
                                <div>
                                    <p className="text-sm text-purple-600 font-semibold">Total Views Galeri</p>
                                    <p className="text-2xl font-bold text-purple-950">{summary.total_views.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* SECTION 3: SHADCN CHART */}
                    <Card className="mt-6 border border-gray-200 shadow-sm p-6">
                        <div className="mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                <TrendingUp size={20} className="text-primary" /> Tren Publikasi Galeri Harian
                            </h3>
                        </div>

                        <div className="w-full h-[350px]">
                            {chart_data && chart_data.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-full w-full">
                                    <BarChart data={chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date" tickLine={false} axisLine={false} tickMargin={12}
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
                                        />
                                        <YAxis tickLine={false} axisLine={false} tickMargin={12} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <ChartTooltip cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }} content={<ChartTooltipContent />} />
                                        <Bar
                                            dataKey="total_galeri" name="Galeri Terbit"
                                            fill="var(--color-total_galeri)" radius={[4, 4, 0, 0]} maxBarSize={50}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                                    <ImageIcon size={48} className="mb-2 text-gray-300" />
                                    <p>Tidak ada data publikasi galeri untuk rentang tanggal yang dipilih.</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* SECTION 4: EXPORT AKSI */}
                    {/* <Card className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 border border-gray-200 p-6 gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Unduh Data Mentah (Raw Data)</h3>
                            <p className="text-sm text-gray-600 mt-1">Export laporan galeri ini ke format Excel.</p>
                        </div>
                        <button
                            onClick={handleExportExcel} disabled={exportProcessing}
                            className="btn btn-success text-white px-6 shadow-sm w-full md:w-auto"
                        >
                            {exportProcessing ? <span className="loading loading-spinner loading-sm"></span> : <Download size={18} />}
                            {exportProcessing ? 'Memproses ke Queue...' : 'Export Excel Galeri'}
                        </button>
                    </Card> */}

                </div>
            </div>
        </AuthenticatedLayout>
    )
}