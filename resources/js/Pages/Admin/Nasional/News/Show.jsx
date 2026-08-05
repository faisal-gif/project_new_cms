import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarIcon,
    FolderIcon,
    TagIcon,
    UserIcon,
    ArrowLeftIcon,
    EyeIcon,
    ShoppingBagIcon,
    RotateCwIcon
} from 'lucide-react';
import React from 'react';
import { formatDateTimeLong } from '@/Utils/formatter';
import { Badge } from '@/Components/ui/badge';

export default function Show({ news }) {

    return (
        <div>
            <Head title={`Detail: ${news.news_title}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            {/* Header & Breadcrumbs */}
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
                                <div className="flex items-center gap-3">
                                    {/* Sesuaikan route index Anda */}
                                    <Link href={route('admin.nasional.news.index')} className="btn btn-circle btn-ghost btn-sm">
                                        <ArrowLeftIcon className="w-5 h-5" />
                                    </Link>
                                    <h1 className="text-3xl font-bold text-foreground">Detail Berita</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><Link href="/">Beranda</Link></li>
                                        <li><Link href={route('admin.nasional.news.index')}>Berita Nasional</Link></li>
                                        <li>Detail</li>
                                    </ul>
                                </div>
                            </div>

                            <Card>
                                <article className="flex flex-col space-y-8 p-4">

                                    {/* Judul & Meta Informasi */}
                                    <header className="border-b pb-6">
                                        <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                                            {news.news_title}
                                        </h2>
                                        {news.news_subtitle && (
                                            <h3 className="text-2xl text-gray-600 mt-2 font-medium">
                                                {news.news_subtitle}
                                            </h3>
                                        )}

                                        <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-600">
                                            <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                                                <UserIcon className="w-4 h-4 text-primary" />
                                                {news.writer?.name || news.news_writer || 'Penulis Tidak Diketahui'}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                {formatDateTimeLong(news.news_datepub)} WIB
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <FolderIcon className="w-4 h-4 text-gray-400" />
                                                {news.kanal?.catnews_title || 'Tanpa Kanal'}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <EyeIcon className="w-4 h-4 text-gray-400" />
                                                Dilihat
                                            </span>
                                        </div>
                                    </header>

                                    {/* Gambar Thumbnail */}

                                    {news.news_image_new && (
                                        <figure className="flex flex-col w-full my-6">

                                            {/* Foto Utama */}
                                            <img
                                                src={news.news_image_new}
                                                alt={news.news_caption || news.news_title}
                                                className="w-full h-auto max-h-[600px] object-cover rounded-xl shadow-sm"
                                            />

                                            {/* Caption di Bawah Foto */}
                                            {news.news_caption && (
                                                <figcaption className="w-full mt-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                                                    <span className="font-bold text-gray-900 block mb-1">
                                                       Caption Foto
                                                    </span>
                                                    <p className="leading-relaxed italic">
                                                        {news.news_caption}
                                                    </p>
                                                </figcaption>
                                            )}

                                        </figure>
                                    )}


                                    {/* Isi Konten Berita */}
                                    {/* Menggunakan Tailwind Typography (prose) untuk styling otomatis tag HTML */}
                                    <div
                                        className="prose prose-lg max-w-none prose-img:rounded-xl prose-a:text-primary"
                                        dangerouslySetInnerHTML={{ __html: news.news_content }}
                                    />

                                    {/* Tags */}
                                    {news.tags && news.tags.length > 0 && (
                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <TagIcon className="w-5 h-5 text-gray-400" />
                                                <span className="font-semibold text-gray-700 text-sm">Tags:</span>
                                                {news.tags.map((tag) => (
                                                    // Sesuaikan tag.name dengan field di tabel tags Anda
                                                    <Badge key={tag.id} className="badge badge-outline badge-md">
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Produk Affiliate (Kanal Commerce) */}
                                    {news.commerce && (
                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <ShoppingBagIcon className="w-5 h-5 text-primary" />
                                                <span className="font-semibold text-gray-700">Produk Affiliate</span>
                                                {news.commerce.platform && (
                                                    <Badge className="badge badge-sm badge-primary">
                                                        {news.commerce.platform}
                                                    </Badge>
                                                )}
                                                <Badge className={`badge badge-sm ${news.commerce.crawl_status === 'success' ? 'badge-success' : news.commerce.crawl_status === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                                                    {news.commerce.crawl_status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                {news.commerce.product_image && (
                                                    <img
                                                        src={news.commerce.product_image}
                                                        alt={news.commerce.product_title || 'Produk'}
                                                        className="w-32 h-32 object-cover rounded-lg shadow-sm shrink-0"
                                                    />
                                                )}
                                                <div className="flex flex-col gap-2 min-w-0">
                                                    {news.commerce.product_title && (
                                                        <p className="font-semibold text-gray-900">{news.commerce.product_title}</p>
                                                    )}
                                                    {news.commerce.product_description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">{news.commerce.product_description}</p>
                                                    )}
                                                    <a
                                                        href={news.commerce.resolved_url || news.commerce.affiliate_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer nofollow"
                                                        className="text-sm text-primary underline break-all"
                                                    >
                                                        {news.commerce.resolved_url || news.commerce.affiliate_link}
                                                    </a>
                                                    {news.commerce.crawl_status === 'failed' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => router.post(route('admin.nasional.news.recrawl', news.news_id))}
                                                            className="btn btn-sm btn-outline btn-warning w-fit mt-1"
                                                        >
                                                            <RotateCwIcon className="w-4 h-4" /> Crawl Ulang
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                                        <Link
                                            href={route('admin.nasional.news.edit', news.news_id)}
                                            className="btn btn-primary"
                                        >
                                            Edit Berita
                                        </Link>
                                    </div>

                                </article>
                            </Card>

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    );
}