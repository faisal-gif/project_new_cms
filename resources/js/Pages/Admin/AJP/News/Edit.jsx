import Breadcrumbs from '@/Components/Breadcrumbs'
import { Button } from '@/Components/ui/button';
import Card from '@/Components/Card'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPhoneNumber from '@/Components/InputPhoneNumber'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { InfoIcon, NotebookPenIcon, UserCheckIcon } from 'lucide-react'
import React from 'react'

export default function Edit({ news }) {
    // Edit hanya menyunting teks — gambar & pewarta tidak disentuh.
    const { data, setData, put, processing, errors } = useForm({
        title: news.title || '',
        content: news.content || '',
        caption: news.caption || '',
        city: news.city || '',
        narsum: news.narsum || '',
        profesi: news.profesi || '',
        contact: news.contact || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.ajp.news.update', news.id));
    };

    return (
        <div>
            <Head title="Edit Berita AJP" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Berita AJP</h1>
                                </div>
                                <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'AJP' }, { label: 'Berita' }, { label: 'Edit Berita' }]} />
                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                                {/* --- CARD 1: INFORMASI DASAR (Penulis read-only) --- */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <InfoIcon className='w-6 h-6' /> Informasi Dasar
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>
                                        <div className='lg:col-span-6 w-full'>
                                            <InputLabel value="Penulis (Pewarta)" className='mb-2 font-bold text-blue-600' />
                                            <TextInput
                                                type="text"
                                                className="mt-1 block w-full bg-muted"
                                                value={news.writer?.nama || 'Unknown Pewarta'}
                                                disabled
                                                readOnly
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Penulis tidak dapat diubah saat edit.</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* --- CARD 2: INFORMASI NARASUMBER & LOKASI --- */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <UserCheckIcon className='w-6 h-6' /> Informasi Narasumber & Lokasi
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>

                                        <div className='lg:col-span-3'>
                                            <InputLabel htmlFor="narsum" value="Nama Narasumber" className='mb-2 font-bold' />
                                            <TextInput
                                                id="narsum"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.narsum}
                                                onChange={(e) => setData('narsum', e.target.value)}
                                                placeholder="Masukkan nama narasumber..."
                                            />
                                            <InputError message={errors.narsum} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel htmlFor="profesi" value="Profesi Narasumber" className='mb-2 font-bold' />
                                            <TextInput
                                                id="profesi"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.profesi}
                                                onChange={(e) => setData('profesi', e.target.value)}
                                                placeholder="Contoh: Kapolres Malang, Pengamat Politik"
                                            />
                                            <InputError message={errors.profesi} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel htmlFor="contact" value="No Tlp/Hp Narasumber" className='mb-2 font-bold' />
                                            <InputPhoneNumber
                                                id="contact"
                                                value={data.contact}
                                                onChange={(e) => setData('contact', e.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Contoh: 081234xxxx"
                                            />
                                            <InputError message={errors.contact} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel htmlFor="city" value="Kota (Lokus Kejadian)" className='mb-2 font-bold' />
                                            <TextInput
                                                id="city"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder="Contoh: Malang Kota, Jakarta Pusat"
                                            />
                                            <InputError message={errors.city} className="mt-2" />
                                        </div>

                                    </div>
                                </Card>

                                {/* --- CARD 3: KONTEN BERITA --- */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <NotebookPenIcon className='w-6 h-6' /> Konten Berita
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel htmlFor="title" value="Judul Berita" className='mb-2 font-bold' />
                                            <TextInput
                                                id="title"
                                                type="text"
                                                className="mt-1 block w-full text-lg"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="Masukkan judul berita yang menarik..."
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6 mt-2'>
                                            <InputLabel htmlFor="content" value="Isi Berita" className='mb-2 font-bold' />
                                            <InputEditor
                                                value={data.content}
                                                onChange={(val) => setData('content', val)}
                                            />
                                            <InputError message={errors.content} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6 mt-2'>
                                            <InputTextarea
                                                id="caption"
                                                label={"Caption Gambar"}
                                                value={data.caption}
                                                placeholder="Tulis keterangan gambar di sini..."
                                                onChange={(e) => setData('caption', e.target.value)}
                                                className='h-32 mt-1 block w-full'
                                                maxLength={255}
                                            />
                                            <InputError message={errors.caption} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {errors.error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded shadow-sm">
                                        <p className="text-red-700 font-semibold">{errors.error}</p>
                                    </div>
                                )}

                                <div className='flex flex-row justify-end mt-4 pb-12'>
                                    <Button
                                        type="submit" className="px-8 shadow-lg text-lg"
                                        disabled={processing}
                                    >
                                        {processing ? 'Memperbarui Data...' : 'Perbarui Berita AJP'}
                                    </Button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    )
}
