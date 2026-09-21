import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { Button } from '@/Components/ui/button';
import Card from '@/Components/Card';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarIcon,
    FolderIcon,
    TagIcon,
    UserIcon,
    ArrowLeftIcon,
    EyeIcon,
    MapPinIcon,
    PencilIcon,
    ExternalLinkIcon,
    Globe2Icon
} from 'lucide-react';
import React from 'react';
import { formatDateTimeLong, formatNumber } from '@/Utils/formatter';
import { Badge } from '@/Components/ui/badge';

function getStatusBadge(status) {
    switch (Number(status)) {
        case 0:
            return <Badge variant="secondary">Pending</Badge>;
        case 2:
            return <Badge className="bg-yellow-300 text-yellow-700">Review</Badge>;
        case 3:
            return <Badge variant="destructive">OnPro</Badge>;
        case 1:
            return <Badge className="bg-green-300 text-green-700">Publish</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

export default function Show({ news, shareLinks = [] }) {

    const canImportNasional = (usePage().props.auth.permissions || []).includes('import nasional news daerah');

    return (
        <div>
            <Head title={`Detail: ${news.title}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            {/* Header & Breadcrumbs */}
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-4'>
                                <div className="flex items-center gap-3">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={route('admin.daerah.news.index')}>
                                            <ArrowLeftIcon className="w-5 h-5" />
                                        </Link>
                                    </Button>
                                    <h1 className="text-3xl font-bold text-foreground">Detail Berita</h1>
                                </div>
                                <div className="flex items-center gap-3">
                                    {canImportNasional && (
                                        news.news_nasional ? (
                                            <Button disabled size="sm" className="bg-gray-300 text-white border-none cursor-not-allowed hover:bg-gray-300">
                                                <MapPinIcon size={16} /> Telah Di-import ke Nasional
                                            </Button>
                                        ) : (
                                            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                                                <Link href={route('admin.daerah.news.import.nasional', news.id)}>
                                                    <MapPinIcon size={16} /> Import Nasional
                                                </Link>
                                            </Button>
                                        )
                                    )}
                                    <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Berita Daerah' }, { label: 'Detail' }]} />
                                </div>
                            </div>

                            <Card>
                                <article className="flex flex-col space-y-8 p-4">

                                    {/* Judul & Meta Informasi */}
                                    <header className="border-b border-border pb-6">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            {getStatusBadge(news.status)}
                                            {Number(news.is_headline) === 1 && <Badge>Headline</Badge>}
                                            {Number(news.is_editorial) === 1 && <Badge variant="outline">Editorial</Badge>}
                                            {Number(news.is_adv) === 1 && <Badge variant="outline">Advertorial</Badge>}
                                            {news.fokus?.name && (
                                                <Badge variant="outline">{news.fokus.name}</Badge>
                                            )}
                                        </div>
                                        <h2 className="text-4xl font-extrabold text-foreground leading-tight">
                                            {news.title}
                                        </h2>
                                        {news.subtitle && (
                                            <h3 className="text-2xl text-muted-foreground mt-2 font-medium">
                                                {news.subtitle}
                                            </h3>
                                        )}

                                        <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                                                <UserIcon className="w-4 h-4 text-primary" />
                                                {news.writer?.name || 'Penulis Tidak Diketahui'}
                                            </span>
                                            {news.editor?.name && (
                                                <span className="flex items-center gap-2">
                                                    <PencilIcon className="w-4 h-4" />
                                                    {news.editor.name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" />
                                                {formatDateTimeLong(news.datepub)} WIB
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <FolderIcon className="w-4 h-4" />
                                                {news.kanal?.name || 'Tanpa Kanal'}
                                            </span>
                                            {news.locus && (
                                                <span className="flex items-center gap-2">
                                                    <MapPinIcon className="w-4 h-4" />
                                                    {news.locus}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-2">
                                                <EyeIcon className="w-4 h-4" />
                                                {formatNumber(news.views ?? 0)} dilihat
                                            </span>
                                        </div>
                                    </header>

                                    {/* Gambar Thumbnail */}
                                    {news.image && (
                                        <figure className="flex flex-col w-full my-6">
                                            <img
                                                src={news.image}
                                                alt={news.caption || news.title}
                                                className="w-full h-auto max-h-[600px] object-cover rounded-xl shadow-sm"
                                            />
                                            {news.caption && (
                                                <figcaption className="w-full mt-4 text-sm text-muted-foreground bg-muted p-4 rounded-xl border border-border shadow-sm">
                                                    <span className="font-bold text-foreground block mb-1">
                                                        Caption Foto
                                                    </span>
                                                    <p className="leading-relaxed italic">
                                                        {news.caption}
                                                    </p>
                                                </figcaption>
                                            )}
                                        </figure>
                                    )}

                                    {/* Isi Konten Berita */}
                                    <div
                                        className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl prose-a:text-primary"
                                        dangerouslySetInnerHTML={{ __html: news.content }}
                                    />

                                    {/* Tags */}
                                    {news.tags && news.tags.length > 0 && (
                                        <div className="pt-6 border-t border-border">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <TagIcon className="w-5 h-5 text-muted-foreground" />
                                                <span className="font-semibold text-foreground text-sm">Tags:</span>
                                                {news.tags.map((tag) => (
                                                    <Badge key={tag.id} variant="outline">
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Link publik per network — berita daerah bisa tayang di beberapa domain */}
                                    {shareLinks.length > 0 && (
                                        <div className="pt-6 border-t border-border">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Globe2Icon className="w-5 h-5 text-primary" />
                                                <span className="font-semibold text-foreground">
                                                    Tayang di {shareLinks.length} Network
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {shareLinks.map((link) => (
                                                    <a
                                                        key={link.url}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 bg-muted p-3 rounded-xl border border-border text-sm hover:border-primary transition-colors"
                                                    >
                                                        <ExternalLinkIcon className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="font-semibold text-foreground shrink-0">{link.network}</span>
                                                        <span className="text-muted-foreground break-all">{link.url}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
                                        <Button asChild>
                                            <Link href={route('admin.daerah.news.edit', news.id)}>
                                                Edit Berita
                                            </Link>
                                        </Button>
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
