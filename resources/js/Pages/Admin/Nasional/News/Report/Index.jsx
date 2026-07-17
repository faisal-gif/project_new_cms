import Card from '@/Components/Card'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { Download, Search, BarChart3, Eye, FileText, TrendingUp, Trophy, Layers } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Select from "react-select"

// 1. IMPORT BAR CHART
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/Components/ui/chart"
import axios from 'axios'
import AsyncSelect from 'react-select/async'

export default function ReportIndex({ summary, chart_data, top_news, top_categories, writers, editors, kanals, filters }) {
  const { flash } = usePage().props;

  const [tag, setTag] = useState(() => filters.tag || null);
  const [topNewsProcessing, setTopNewsProcessing] = useState(false);

  const tagId = tag ? tag.value : '';
  const initialTagId = filters.tag ? filters.tag.value : '';

  // 2. STATE MANAGEMENT (Single Source of Truth)
  // Gunakan data dan setData bawaan useForm agar payload otomatis terkirim saat post()
  const { data, setData, post, processing: exportProcessing } = useForm({
    start_date: filters.start_date || '',
    end_date: filters.end_date || '',
    kanal: filters.kanal || '',
    writer: filters.writer || '',
    editor: filters.editor || '',
    tag: filters.tag?.value || '',
  });

  useEffect(() => {
    setData('tag', tag ? tag.value : '');
  }, [tag]);

  useEffect(() => {
    if (flash?.success) {
      alert(flash.success); // Ganti dengan library toast jika Anda menggunakannya
    }
  }, [flash]);

  // Handler 1: Update Data di Layar
  const handleApplyFilter = () => {
    // router.get menerima parameter data langsung
    router.get(route('admin.nasional.news.report.index'), data, {
      preserveState: true,
      replace: true,
    });
  };

  // Handler 2: Lempar Tugas Export Excel ke Queue
  const handleExportExcel = () => {
    if (!data.start_date || !data.end_date) {
      alert("Rentang tanggal wajib diisi untuk melakukan export data.");
      return;
    }

    // post() otomatis membawa state 'data' di atas, menghindari error The start date is required
    post(route('admin.nasional.news.report.export'), {
      preserveScroll: true,
    });
  };

  const handleExportTopNews = () => {
    if (!data.start_date || !data.end_date) {
      alert("Rentang tanggal wajib diisi untuk melakukan export data.");
      return;
    }

    setTopNewsProcessing(true);
    router.post(route('admin.nasional.news.report.export-top-news'), data, {
      preserveScroll: true,
      onFinish: () => setTopNewsProcessing(false),
    });
  };

  const loadTagOptions = async (inputValue) => {
    if (!inputValue) return []; // Jangan hit backend jika input kosong
    try {
      const response = await axios.get(route('admin.nasional.tags.search'), {
        params: { search: inputValue }
      });
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil data tag:", error);
      return [];
    }
  };


  const chartConfig = {
    total_berita: {
      label: "Berita Tayang",
      color: "hsl(var(--chart-1, 221.2 83.2% 53.3%))",
    },
  };

  return (
    <AuthenticatedLayout>
      <Head title="Laporan & Analitik Nasional" />
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Analitik & Laporan Jaringan</h1>
            <p className="text-sm text-gray-500 mt-1">Pantau performa publikasi berita nasional secara *real-time*.</p>
          </div>

          {/* ==========================================
              SECTION 1: FILTER KONTROL 
          ========================================== */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-end p-2">
              <div className="w-full md:w-1/5">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Dari Tanggal <span className="text-red-500">*</span></label>
                <TextInput
                  type="date"
                  className="w-full"
                  value={data.start_date}
                  onChange={e => setData('start_date', e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/5">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Sampai Tanggal <span className="text-red-500">*</span></label>
                <TextInput
                  type="date"
                  className="w-full"
                  min={data.start_date}
                  value={data.end_date}
                  onChange={e => setData('end_date', e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/5">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Kategori Kanal</label>
                <Select
                  options={kanals}
                  isClearable
                  placeholder="Semua Kanal"
                  value={kanals.find(k => k.value === data.kanal) || null}
                  onChange={e => setData('kanal', e ? e.value : '')}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end p-2">
              <div className="w-full ">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Penulis</label>
                <Select
                  options={writers}
                  isClearable
                  placeholder="Semua Penulis"
                  value={writers.find(w => w.value === data.writer) || null}
                  onChange={e => setData('writer', e ? e.value : '')}
                />
              </div>

              <div className="w-full ">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Editor</label>
                <Select
                  options={editors}
                  isClearable
                  placeholder="Semua Editor"
                  value={editors.find(d => d.value === data.editor) || null}
                  onChange={e => setData('editor', e ? e.value : '')}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end p-2">

              <div className="w-full flex flex-col justify-end">
                <AsyncSelect
                  cacheOptions
                  defaultOptions={false}
                  loadOptions={loadTagOptions}
                  value={tag}
                  onChange={(selected) => setTag(selected)}
                  placeholder="Cari Tag..."
                  isClearable
                  className="w-full"
                  styles={{
                    menu: (base) => ({ ...base, zIndex: 50 }),
                    control: (base) => ({ ...base, minHeight: '38px' }) // Menyesuaikan tinggi agar presisi dengan input sebelahnya
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end justify-end p-2">
              <div className="w-full md:w-1/5">
                <button onClick={handleApplyFilter} className="btn btn-primary w-full">
                  <Search size={18} /> Terapkan Filter
                </button>
              </div>
            </div>
          </Card>

          {/* ==========================================
              SECTION 2: VISUALISASI DATA (SUMMARY CARDS) 
          ========================================== */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-blue-50/50 border-blue-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-xl text-white shadow-sm"><FileText size={24} /></div>
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Total Semua Berita</p>
                  <p className="text-2xl font-bold text-blue-950">{summary.total_news.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-green-50/50 border-green-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-xl text-white shadow-sm"><BarChart3 size={24} /></div>
                <div>
                  <p className="text-sm text-green-600 font-semibold">Berita Terbit</p>
                  <p className="text-2xl font-bold text-green-950">{summary.total_publish.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-yellow-50/50 border-yellow-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500 rounded-xl text-white shadow-sm"><FileText size={24} /></div>
                <div>
                  <p className="text-sm text-yellow-600 font-semibold">Sedang Direview</p>
                  <p className="text-2xl font-bold text-yellow-950">{summary.total_review.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-purple-50/50 border-purple-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-xl text-white shadow-sm"><Eye size={24} /></div>
                <div>
                  <p className="text-sm text-purple-600 font-semibold">Total Pageviews</p>
                  <p className="text-2xl font-bold text-purple-950">{summary.total_views.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ==========================================
              SECTION 3: GRAFIK TREND HARIAN (BAR CHART)
          ========================================== */}
          <Card className="mt-6 border border-gray-200 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                <TrendingUp size={20} className="text-primary" /> Tren Publikasi Berita Harian
              </h3>
              <p className="text-sm text-gray-500">
                Visualisasi jumlah berita yang diterbitkan per hari berdasarkan rentang waktu yang Anda pilih.
              </p>
            </div>

            <div className="w-full h-[350px]">
              {chart_data && chart_data.length > 0 ? (

                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart
                    data={chart_data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />

                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />

                    <ChartTooltip
                      cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }}
                      content={<ChartTooltipContent />}
                    />

                    <Bar
                      dataKey="total_berita"
                      name="Berita Terbit"
                      fill="var(--color-total_berita)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ChartContainer>

              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                  <BarChart3 size={48} className="mb-2 text-gray-300" />
                  <p>Tidak ada data publikasi untuk rentang tanggal yang dipilih.</p>
                </div>
              )}
            </div>
          </Card>

          {/* ==========================================
              SECTION FITUR BARU: TOP NEWS & TOP KATEGORI
          ========================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* Kartu Top Berita */}
            <Card className="border border-gray-200 shadow-sm p-6">
              <div className="mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" />
                <h3 className="font-bold text-lg text-foreground">Top 5 Berita (Berdasarkan Views)</h3>
              </div>
              <div className="space-y-4">
                {top_news && top_news.length > 0 ? (
                  top_news.map((news, index) => (
                    <div key={news.news_id} className="flex justify-between items-start gap-4 pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex gap-3">
                        <span className="font-bold text-gray-400">#{index + 1}</span>
                        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                          {news.news_title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md shrink-0">
                        <Eye size={14} />
                        <span className="text-xs font-bold">{Number(news.pageviews).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">Data tidak ditemukan.</p>
                )}
              </div>
            </Card>

            {/* Kartu Top Kategori */}
            <Card className="border border-gray-200 shadow-sm p-6">
              <div className="mb-4 flex items-center gap-2">
                <Layers size={20} className="text-purple-500" />
                <h3 className="font-bold text-lg text-foreground">Top 5 Kanal (Berdasarkan Views)</h3>
              </div>
              <div className="space-y-4">
                {top_categories && top_categories.length > 0 ? (
                  top_categories.map((cat, index) => (
                    <div key={index} className="flex justify-between items-center gap-4 pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex gap-3 items-center">
                        <span className="font-bold text-gray-400">#{index + 1}</span>
                        <p className="text-sm font-medium text-gray-800">
                          {cat.catnews_title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{Number(cat.total_views).toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-500">views</span></p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">Data tidak ditemukan.</p>
                )}
              </div>
            </Card>

          </div>

          {/* ==========================================
              SECTION 4: EXPORT AKSI (QUEUE JOB)
          ========================================== */}
          <Card className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 border border-gray-200 p-6 gap-4">
            <div>
              <h3 className="font-bold text-lg text-foreground">Butuh rincian data (Raw Data)?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Unduh seluruh detail baris berita ke dalam format Microsoft Excel (.xlsx) untuk keperluan audit lebih lanjut.
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              disabled={exportProcessing}
              className="btn btn-success text-white px-6 shadow-sm w-full md:w-auto"
            >
              {exportProcessing ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Download size={18} />
              )}
              {exportProcessing ? 'Memproses ke Queue...' : 'Export Laporan Excel'}
            </button>

            <button
              onClick={handleExportTopNews}
              disabled={topNewsProcessing}
              className="btn btn-primary w-full md:w-auto"
            >
              {topNewsProcessing ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Download size={18} />
              )}
              {topNewsProcessing ? 'Memproses ke Queue...' : 'Export Top 50 Berita'}
            </button>
          </Card>

        </div>
      </div>
    </AuthenticatedLayout>
  )
}