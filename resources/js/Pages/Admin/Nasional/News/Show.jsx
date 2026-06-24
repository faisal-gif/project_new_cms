import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import { Head, Link } from '@inertiajs/react';
import {
    CalendarIcon,
    FolderIcon,
    TagIcon,
    UserIcon,
    ArrowLeftIcon,
    EyeIcon
} from 'lucide-react';
import React from 'react';
import { formatDateTimeLong } from '@/Utils/formatter';

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
                                                {news.kanal?.name || 'Tanpa Kanal'}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <EyeIcon className="w-4 h-4 text-gray-400" />
                                                Dilihat
                                            </span>
                                        </div>
                                    </header>

                                    {/* Gambar Thumbnail */}
                                    {news.news_image_new && (
                                        <figure className="w-full">
                                            <img
                                                src={news.news_image_new} // Pastikan php artisan storage:link sudah dijalankan
                                                alt={news.news_caption || news.news_title}
                                                className="w-full max-h-[600px] object-cover rounded-xl shadow-sm"
                                            />
                                            {news.news_caption && (
                                                <figcaption className="text-sm text-center text-gray-500 mt-3 italic">
                                                    {news.news_caption}
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
                                                    <span key={tag.id} className="badge badge-outline badge-md">
                                                        {tag.name}
                                                    </span>
                                                ))}
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