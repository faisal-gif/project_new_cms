import Card from '@/Components/Card'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, CheckCircle, FileText, Instagram, User, Clock, Link as LinkIcon, XCircle, MessageCircle } from 'lucide-react'
import React from 'react'

export default function Show({ addon }) {
    const { data, setData, put, processing } = useForm({
        status: addon.status,
        url_hasil: addon.url_hasil || '',
        keterangan_admin: addon.keterangan_admin || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.ajp.addon-requests.update', addon.id));
    };

    function getStatusBadge(statusValue) {
        switch (statusValue) {
            case 'completed': return <Badge className="bg-green-300 text-green-800 border-none">Completed</Badge>;
            case 'processing': return <Badge className="bg-yellow-300 text-yellow-800 border-none">Processing</Badge>;
            case 'rejected': return <Badge className="bg-red-300 text-red-800 border-none">Rejected</Badge>;
            case 'pending': default: return <Badge variant="secondary">Pending</Badge>;
        }
    }

    return (
        <AuthenticatedLayout>
            <Head
                title={`Proses ${{
                    feed_instagram: 'Feed IG',
                    ekoran: 'Ekoran',
                    wa_channel: 'WA Channel'
                }[addon.jenis_request] || 'Add-on'}`}
            />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className='flex items-center gap-4'>
                        <Link href={route('admin.ajp.addon-requests.index')} className="btn btn-circle btn-ghost bg-base-200">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                {{
                                    feed_instagram: (
                                        <><Instagram className="text-pink-500" /> Proses Feed IG</>
                                    ),
                                    ekoran: (
                                        <><FileText className="text-blue-500" /> Proses Ekoran</>
                                    ),
                                    wa_channel: (
                                        <><MessageCircle className="text-green-500" /> Proses WA Channel</>
                                    )
                                }[addon.jenis_request]}
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Diajukan pada {formatDateTime(addon.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* KOLOM KIRI: DETAIL INFORMASI (Lebar: 2/3) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Card Info Penulis */}
                            <Card>
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2">
                                    <User size={18} /> Detail Pewarta
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                                        <p className="font-semibold">{addon.wartawan?.nama}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{addon.wartawan?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nomor Kontak (WA)</p>
                                        <p className="font-medium">{addon.wartawan?.contact || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Instansi/Media</p>
                                        <p className="font-medium">{addon.wartawan?.instansi || '-'}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Card Konten Berita */}
                            <Card>
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <FileText size={18} /> Naskah Berita
                                    </h3>
                                    <Link
                                        href={route('admin.ajp.news.show', addon.news_id)}
                                        className="btn btn-sm btn-outline btn-primary"
                                        target="_blank" // Buka tab baru opsional
                                    >
                                        Lihat Full Page
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold font-serif leading-tight">
                                            {addon.news?.title}
                                        </h2>
                                        <p className="text-sm text-blue-600 font-mono mt-1">Kode: {addon.news?.is_code}</p>
                                    </div>

                                    {/* Merender HTML konten berita */}
                                    <div className="prose max-w-none prose-sm sm:prose-base text-justify bg-base-200/30 p-4 rounded-xl border border-base-200">
                                        {addon.news?.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: addon.news.content }} />
                                        ) : (
                                            <p className="text-muted-foreground italic">Konten berita tidak tersedia atau kosong.</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                        </div>

                        {/* KOLOM KANAN: FORM AKSI (Lebar: 1/3) */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24 border-primary/20 shadow-md">
                                <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                                    Update Status
                                    {getStatusBadge(addon.status)}
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-5">

                                    <div>
                                        <label className="label"><span className="label-text font-semibold">Tindakan Admin</span></label>
                                        <select
                                            className="select select-bordered w-full"
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                        >
                                            <option value="pending">⏳ Pending (Menunggu)</option>
                                            <option value="processing">⚙️ Processing (Dikerjakan)</option>
                                            <option value="completed">✅ Completed (Publish)</option>
                                            <option value="rejected">❌ Rejected (Tolak)</option>
                                        </select>
                                    </div>

                                    {/* Jika status Completed */}
                                    {data.status === 'completed' && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="label">
                                                <span className="label-text font-semibold flex items-center gap-1">
                                                    <LinkIcon size={14} /> URL Hasil Publish
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                placeholder={addon.jenis_request === 'feed_instagram' ? 'https://instagram.com/p/...' : 'Link PDF/Drive...'}
                                                value={data.url_hasil}
                                                onChange={e => setData('url_hasil', e.target.value)}
                                                required
                                            />
                                            <label className="label">
                                                <span className="label-text-alt text-muted-foreground">Tautan ini akan dilihat oleh pewarta.</span>
                                            </label>
                                        </div>
                                    )}

                                    {/* Jika status Rejected */}
                                    {data.status === 'rejected' && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="label">
                                                <span className="label-text text-error font-semibold flex items-center gap-1">
                                                    <XCircle size={14} /> Alasan Penolakan
                                                </span>
                                            </label>
                                            <textarea
                                                className="textarea textarea-bordered w-full h-24"
                                                placeholder="Contoh: Kualitas resolusi foto terlalu kecil untuk Feed IG..."
                                                value={data.keterangan_admin}
                                                onChange={e => setData('keterangan_admin', e.target.value)}
                                                required
                                            />
                                            <label className="label">
                                                <span className="label-text-alt text-error font-bold bg-error/10 p-2 rounded w-full">
                                                    ⚠️ Kuota akan otomatis di-refund ke akun penulis.
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-base-200">
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-full"
                                            disabled={processing}
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
