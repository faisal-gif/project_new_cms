import Card from '@/Components/Card'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Edit, ImageIcon, InfoIcon, UploadCloudIcon } from 'lucide-react'
import React from 'react'

export default function Show({ news }) {

    // Helper untuk status badge
    const getStatusBadge = (statusValue) => {
        if (statusValue === 1 || statusValue === '1') {
            return <Badge className="bg-green-300 text-green-800">Published</Badge>;
        }
        return <Badge variant="secondary">Draft</Badge>;
    };

    const availableImages = [news.image, news.image2, news.image3].filter(Boolean);

    // Helper untuk menentukan layout grid berdasarkan jumlah gambar
    const getGridLayout = (count) => {
        if (count === 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-1 md:grid-cols-2';
        return 'grid-cols-1 md:grid-cols-3';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Berita - ${news.title}`} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header & Breadcrumbs */}
                    <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
                        <h1 className="text-3xl font-bold text-foreground">Detail Berita</h1>
                        <div className="breadcrumbs text-sm">
                            <ul>
                                <li><Link href={route('dashboard')}>Home</Link></li>
                                <li>Kopi Times</li>
                                <li><Link href={route('admin.kopi-times.news.index')}>Berita</Link></li>
                                <li>Detail</li>
                            </ul>
                        </div>
                    </div>

                    <Card>
                        {/* Top Action Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 mb-6 gap-4">
                            <Link href={route('admin.kopi-times.news.index')} className="btn btn-ghost btn-sm">
                                <ArrowLeft size={16} /> Kembali ke Daftar
                            </Link>

                            {news.news_nasional === null && (
                            <Link href={route('admin.kopi-times.news.publish', news.id)} className="btn btn-success">
                                <UploadCloudIcon size={16} /> Publish Berita
                            </Link>
                            )}

                            {news.news_nasional && (
                                <Link href={route('admin.nasional.news.show', news.news_nasional.news_id)} className="btn btn-info">
                                    <InfoIcon size={16} /> Detail Berita
                                </Link>
                            )}
                        </div>

                        {/* Judul Berita Utama */}
                        <div className="mb-8 text-center sm:text-left">
                            <div className="flex flex-wrap items-center gap-2 mb-2 justify-center sm:justify-start">
                                {getStatusBadge(news.status)}
                                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    Kode: {news.is_code || '-'}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                {news.title}
                            </h2>
                        </div>

                        {/* Grid Informasi Meta Data */}
                        {/* Grid Informasi Meta Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 mb-8">

                            {/* Kolom Kiri */}
                            <div className="space-y-4 text-sm">
                                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-2">
                                    <span className="text-gray-500 font-medium mb-1 sm:mb-0">Pewarta</span>
                                    <span className="sm:col-span-2 font-bold text-gray-900 break-words">
                                        <span className="hidden sm:inline mr-1">:</span>
                                        {news.writer?.nama || 'Unknown'}
                                        <span className="block sm:inline text-gray-500 font-normal sm:ml-1">
                                            ({news.writer?.email || '-'})
                                        </span>
                                    </span>
                                </div>
                                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-2">
                                    <span className="text-gray-500 font-medium mb-1 sm:mb-0">Waktu Tayang</span>
                                    <span className="sm:col-span-2 font-semibold text-gray-800">
                                        <span className="hidden sm:inline mr-1">:</span>
                                        {formatDate(news.datetime)}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-2">
                                    <span className="text-gray-500 font-medium mb-1 sm:mb-0">Kota Liputan</span>
                                    <span className="sm:col-span-2 text-gray-800">
                                        <span className="hidden sm:inline mr-1">:</span>
                                        {news.city || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Kolom Kanan */}
                            <div className="space-y-4 text-sm border-t sm:border-none pt-4 sm:pt-0 border-gray-200">
                                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-2">
                                    <span className="text-gray-500 font-medium mb-1 sm:mb-0">Narasumber</span>
                                    <span className="sm:col-span-2 text-gray-800 break-words">
                                        <span className="hidden sm:inline mr-1">:</span>
                                        {news.narsum || '-'}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-2">
                                    <span className="text-gray-500 font-medium mb-1 sm:mb-0">Profesi</span>
                                    <span className="sm:col-span-2 text-gray-800">
                                        <span className="hidden sm:inline mr-1">:</span>
                                        {news.profesi || '-'}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-2">
                                    <span className="text-gray-500 font-medium mb-1 sm:mb-0">Kontak</span>
                                    <span className="sm:col-span-2 text-gray-800 break-words">
                                        <span className="hidden sm:inline mr-1">:</span>
                                        {news.contact || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {availableImages.length > 0 && (
                            <div className="mb-8">
                                <div className={`grid gap-4 ${getGridLayout(availableImages.length)}`}>
                                    {availableImages.map((img, index) => (
                                        <div key={index} className="relative w-full h-64 md:h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100 group">
                                            {/* 
                                                Catatan Senior Dev: 
                                                Sesuaikan prefix URL di bawah ini. Jika menggunakan Laravel Storage symlink, gunakan `/storage/${img}`. 
                                                Jika URL eksternal atau S3, Anda bisa langsung meletakkan `img`.
                                            */}
                                            <img
                                                src={img.startsWith('http') ? img : `/storage/${img}`}
                                                alt={`Dokumentasi Berita ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                // Fallback elegan jika gambar gagal dimuat (broken link)
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/600x400/f3f4f6/a1a1aa?text=Image+Not+Found';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Render Caption jika ada di database */}
                                {news.caption && (
                                    <div className="mt-8 flex items-start gap-2 text-gray-500 text-sm italic px-2 border-l-4 border-indigo-500">
                                        <ImageIcon size={16} className="mt-0.5 shrink-0" />
                                        <p>{news.caption}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bagian Konten Berita */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Isi Berita</h3>

                            {/* Catatan Senior: 
                                Jika isi konten berupa HTML (dari Rich Text Editor seperti TinyMCE), 
                                gunakan dangerouslySetInnerHTML. Jika hanya teks biasa, gunakan tag <p> 
                                dengan white-space: pre-wrap agar enter terbaca.
                            */}
                            { }
                            <div
                                className="prose max-w-none text-gray-700 leading-relaxed bg-white p-6 border rounded-lg shadow-sm"
                                dangerouslySetInnerHTML={{ __html: news.content } || <span className="italic text-gray-400">Tidak ada isi berita.</span>}
                            />

                        </div>

                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    )
}