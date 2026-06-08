import Card from '@/Components/Card';
import InputTextarea from '@/Components/InputTextarea';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, User, Edit, Hash,
    Share2, MapPin, Globe, Image as ImageIcon, CheckCircle, XCircle,
    MessageSquare,
    Send
} from 'lucide-react';
import React from 'react';

export default function Show({ news }) {

    // Helper untuk mengecek status distribusi berdasarkan relasi hasOne
    const isDistributedNasional = news.news_nasional !== null;
    const isDistributedDaerah = news.news_daerah !== null;

    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
    });

    const submitNote = (e) => {
        e.preventDefault();
        // Post ke route yang baru kita buat
        post(route('admin.news.notes.store', news.id), {
            preserveScroll: true, // Mencegah halaman melompat ke atas saat submit
            onSuccess: () => reset('content'), // Kosongkan input jika sukses
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Master Preview: ${news.title}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ==========================================
                        HEADER NAVIGATION & ACTIONS
                    ========================================== */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

                        <div className="flex items-center gap-3">
                            <Link
                                href={route('admin.news.index')} // Sesuaikan dengan route index master Anda
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Master Preview</h1>
                                <p className="text-xs text-gray-500 font-mono mt-1">IS_CODE: {news.is_code}</p>
                            </div>
                        </div>

                        {/* TOMBOL ACTIONS MENGARAH KE FORM KUSTOMISASI (GET ROUTE) */}
                        <div className="flex flex-wrap items-center gap-2">

                            {/* ===== ACTION NASIONAL ===== */}
                            {isDistributedNasional ? (
                                <button
                                    disabled
                                    className="btn btn-sm bg-gray-300 text-white border-none cursor-not-allowed"
                                >
                                    <Globe size={16} /> Telah Di-import ke Nasional
                                </button>
                            ) : (
                                <Link
                                    href={route('admin.news.import.nasional', news.is_code)}
                                    className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
                                >
                                    <Globe size={16} /> Import Nasional
                                </Link>
                            )}

                            {/* ===== ACTION DAERAH ===== */}
                            {isDistributedDaerah ? (
                                <button
                                    disabled
                                    className="btn btn-sm bg-gray-300 text-white border-none cursor-not-allowed"
                                >
                                    <MapPin size={16} /> Telah Di-import ke Daerah
                                </button>
                            ) : (
                                <Link
                                    href={route('admin.news.import.daerah', news.is_code)}
                                    className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                >
                                    <MapPin size={16} /> Import Daerah
                                </Link>
                            )}


                        </div>

                    </div>

                    {/* ==========================================
                        MAIN GRID LAYOUT
                    ========================================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ------------------------------------------
                            KIRI: KONTEN ARTIKEL (2/3 Grid) 
                        ------------------------------------------ */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                                {/* Thumbnail / Cover Image */}
                                {news.image_thumbnail ? (
                                    <div className="w-full relative">
                                        <div className="w-full h-64 sm:h-96 bg-gray-100">
                                            <img
                                                src={`${news.image_thumbnail}`} // Sesuaikan path jika pakai folder khusus
                                                alt={news.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.src = 'https://placehold.co/800x400?text=Image+Not+Found'}
                                            />
                                        </div>
                                        {/* Image Caption */}
                                        {news.image_caption && (
                                            <div className="bg-gray-800/70 backdrop-blur-sm text-white text-xs p-2 absolute bottom-0 w-full">
                                                📸 {news.image_caption}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-50 text-gray-400 border-b border-gray-100">
                                        <ImageIcon size={48} className="mb-2" />
                                        <span>Tidak ada gambar thumbnail</span>
                                    </div>
                                )}

                                {/* Judul & Isi Konten */}
                                <div className="p-6 sm:p-8">
                                    <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                                        {news.title}
                                    </h1>

                                    {/* Deskripsi Singkat / Lead */}
                                    {news.description && (
                                        <div className="text-lg text-gray-600 font-medium italic border-l-4 border-blue-500 pl-4 py-1 mb-8">
                                            {news.description}
                                        </div>
                                    )}

                                    {/* Konten Utama HTML (Menggunakan dangerouslySetInnerHTML) */}
                                    <div
                                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: news.content }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ------------------------------------------
                            KANAN: SIDEBAR METADATA (1/3 Grid) 
                        ------------------------------------------ */}
                        <div className="space-y-6">

                            {/* Card Distribusi Jaringan */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                    <Share2 size={16} className="text-blue-500" /> Status Distribusi
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Globe size={18} className={isDistributedNasional ? "text-blue-600" : "text-gray-400"} />
                                            <span className="font-semibold text-sm">Nasional</span>
                                        </div>
                                        {isDistributedNasional ? (
                                            <span className="badge badge-success badge-sm text-white gap-1 px-2 py-3"><CheckCircle size={12} /> Aktif</span>
                                        ) : (
                                            <span className="badge badge-ghost badge-sm text-gray-500 gap-1 px-2 py-3"><XCircle size={12} /> Belum</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} className={isDistributedDaerah ? "text-emerald-600" : "text-gray-400"} />
                                            <span className="font-semibold text-sm">Daerah</span>
                                        </div>
                                        {isDistributedDaerah ? (
                                            <span className="badge badge-success badge-sm text-white gap-1 px-2 py-3"><CheckCircle size={12} /> Aktif</span>
                                        ) : (
                                            <span className="badge badge-ghost badge-sm text-gray-500 gap-1 px-2 py-3"><XCircle size={12} /> Belum</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card Metadata Master */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Data Induk (Master)</h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="text-gray-400 mt-1" size={18} />
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Penulis Asli</p>
                                            <p className="text-gray-800 font-medium">
                                                {/* Membaca dari relasi writer */}
                                                {news.writer ? news.writer.name : 'Unknown Writer'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Tags */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                    <Hash size={16} className="text-gray-500" /> Tags Terlampir
                                </h3>

                                {news.tags && news.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {news.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 hover:bg-blue-100 transition cursor-default"
                                            >
                                                #{tag.name} {/* Sesuaikan dengan nama field di tabel tag jika bukan 'name' */}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Tidak ada tag yang disematkan.</p>
                                )}
                            </div>

                            {/* Card Catatan Internal / Redaksi */}
                            <Card className="border-muted shadow-sm">
                                <CardHeader className="pb-4 px-6 bg-muted/10 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg flex items-center">
                                        <MessageSquare className="w-4 h-4 mr-2" /> Catatan Internal
                                    </CardTitle>
                                    <Badge variant="secondary">{news.notes?.length || 0}</Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Area Daftar Catatan */}
                                    <div className="max-h-[300px] overflow-y-auto p-6 space-y-4 bg-muted/5">
                                        {news.notes && news.notes.length > 0 ? (
                                            news.notes.map((note) => (
                                                <div key={note.id} className="space-y-1.5 bg-background p-3 rounded-lg shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-semibold text-xs text-foreground">
                                                            {note.user?.full_name || 'User'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(note.created_at).toLocaleDateString('id-ID', {
                                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 text-muted-foreground text-sm italic">
                                                Belum ada catatan untuk berita ini.
                                            </div>
                                        )}
                                    </div>

                                    {/* Area Form Input */}
                                    <div className="p-4 border-t bg-background">
                                        <form onSubmit={submitNote} className="space-y-3">
                                            <div className="space-y-1">
                                                <InputTextarea
                                                    placeholder="Tulis catatan revisi atau instruksi..."
                                                    value={data.content}
                                                    onChange={e => setData('content', e.target.value)}
                                                    className="min-h-[80px] resize-none text-sm"
                                                    disabled={processing}
                                                />
                                                {errors.content && <span className="text-xs text-destructive">{errors.content}</span>}
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processing || !data.content.trim()}
                                                className="w-full h-8 text-xs"
                                            >
                                                <Send className="w-3 h-3 mr-2" />
                                                {processing ? 'Mengirim...' : 'Kirim Catatan'}
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}