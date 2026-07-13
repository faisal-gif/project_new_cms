import Card from '@/Components/Card'
import Checkbox from '@/Components/Checkbox'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputImage from '@/Components/InputImage'
import InputLabel from '@/Components/InputLabel'
import InputRadioGroup from '@/Components/InputRadioGroup'
import InputSwitch from '@/Components/InputSwitch'
import InputTag from '@/Components/InputTag'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, useForm } from '@inertiajs/react'
import { CaptionsIcon, CopyIcon, DownloadIcon, GlobeIcon, ImagesIcon, InfoIcon, NotebookPenIcon } from 'lucide-react'
import React, { useState } from 'react'
import Select from "react-select";

function Edit({ news, editors, kanal, writerkanal, hasEditor, editor_id }) {

    // 1. Tambahkan 'transform' dari useForm Inertia
    const { data, setData, put, processing, errors, transform } = useForm({
        is_code: news.is_code ?? '',

        // Prioritaskan editor dari database, jika null pakai editor_id dari props (user login)
        editor_id: news.editor_id || editor_id || '',

        title: news.title ?? '',
        description: news.description ?? '',
        content: news.content ?? '',
        headline: news.headline ?? 0,
        datepub: news.datepub,
        city: news.city ?? '',
        caption: news.caption ?? '',

        kanal: writerkanal,

        tags: news.tags ? news.tags.split(',') : [],

        focus: '',
        image_thumbnail: news.image ?? '',
        image_watermark: false,
    });



    const submit = (e) => {
        e.preventDefault();
        // Fungsi put() otomatis akan memanggil transform() di atas sebelum mengirim data
        put(route('admin.kopi-times.news.update', news.id));
    };

    return (
        <div>
            <Head title="Edit Berita Kopi Times" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            {/* Header */}
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Berita Kopi Times</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Beranda</a></li>
                                        <li>Kopi Times</li>
                                        <li><Link href={route('admin.kopi-times.news.index')}>Berita</Link></li>
                                        <li>Edit Berita</li>
                                    </ul>
                                </div>
                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                                {/* Card Informasi Dasar */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><InfoIcon className='w-6 h-6' /> Informasi Dasar</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel value="Editor" className='mb-2 label-text font-bold' />
                                            <Select
                                                // Tambahkan || null agar react-select tidak error 'undefined' jika value kosong
                                                value={editors.find(e => e.value == data.editor_id) || null}
                                                options={editors}
                                                placeholder="Pilih Editor..."
                                                onChange={(val) => setData('editor_id', val?.value)}
                                                isDisabled={hasEditor}
                                            />
                                            <InputError message={errors.editor_id} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel value="Penulis" className='mb-2 label-text font-bold' />
                                            {/* Tambahkan ?. nama untuk mencegah error jika writer null */}
                                            <TextInput className="block w-full" value={news.writer?.nama ?? ''} disabled />
                                        </div>

                                    </div>
                                </Card>

                                {/* Card Judul & Deskripsi */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><CaptionsIcon className='w-6 h-6' /> Judul & Deskripsi</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel value="Judul" className='mb-2 label-text font-bold' />
                                            <TextInput className="mt-1 block w-full" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputTextarea
                                                label={"Deskripsi"}
                                                value={data.description}
                                                className='h-20'
                                                onChange={(e) => setData('description', e.target.value)}
                                                maxLength={255}
                                            />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputTag label="Tag" value={data.tags} onChange={(e) => setData('tags', e)} />
                                            <InputError message={errors.tags} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Konten Berita */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><NotebookPenIcon className='w-6 h-6' /> Konten Berita</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel value="Isi Berita" className='mb-2 label-text font-bold' />
                                            <InputEditor value={data.content} onChange={(e) => setData('content', e)} />
                                            <InputError message={errors.content} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6 grid grid-cols-1 lg:grid-cols-3 gap-4'>
                                            <InputSwitch label="Headline" checked={!!data.headline} onChange={(val) => setData("headline", val ? 1 : 0)} />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Gambar Thumbnail */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><ImagesIcon className='w-6 h-6' /> Gambar Thumbnail Publish</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-6 mt-8'>

                                        {/* Kiri: Thumbnail Berita */}
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Gambar Thumbnail" className='mb-2 label-text font-bold' />
                                            <img
                                                src={data.image_thumbnail || 'https://via.placeholder.com/400x300'}
                                                alt="Thumbnail Preview"
                                                className="w-full max-h-[300px] object-cover rounded-lg border shadow-sm"
                                            />
                                        </div>

                                        {/* Kanan: Foto Penulis & Catatan */}
                                        <div className='lg:col-span-3 flex flex-col space-y-4'>
                                            <div>
                                                <InputLabel value="Foto Penulis" className='mb-2 label-text font-bold' />
                                                <img
                                                    src={news.image2 || 'https://via.placeholder.com/150'}
                                                    alt="Foto Penulis"
                                                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                                                />
                                            </div>

                                            {/* Kotak Catatan / Peringatan */}
                                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3 text-yellow-800 text-sm shadow-sm">
                                                <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <strong>Catatan Editor:</strong> Jika gambar dirasa kurang bagus nanti bisa hubungi publisher untuk memproses gambar.
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bawah: Caption (Full Width) */}
                                        <div className='lg:col-span-6 mt-2'>
                                            <InputTextarea
                                                label={"Caption Thumbnail"}
                                                value={data.caption}
                                                onChange={(e) => setData('caption', e.target.value)}
                                                maxLength={255}
                                            />
                                            <InputError message={errors.caption} className="mt-2" />
                                        </div>

                                    </div>
                                </Card>

                                {/* Card Publish */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><GlobeIcon className='w-6 h-6' /> Finalisasi Publish</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Tanggal Publish" className='mb-2 label-text font-bold' />
                                            <TextInput type="datetime-local" className="mt-1 block w-full" value={data.datepub || ''} onChange={(e) => setData('datepub', e.target.value)} />
                                            <InputError message={errors.datepub} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Lokus" className='mb-2 label-text font-bold' />
                                            <TextInput type="text" className="mt-1 block w-full" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                            <InputError message={errors.city} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="kanal"
                                                value="Kanal"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={data.kanal ? kanal.find(k => k.value == data.kanal) : null}
                                                options={kanal}
                                                placeholder="Pilih Kanal..."
                                                onChange={(val) => setData('kanal', val?.value)}
                                            />
                                            <InputError message={errors.kanal} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-4'>
                                    <button type="submit" className="btn btn-success px-8 text-lg" disabled={processing}>
                                        Edit Berita Sekarang
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    )
}

export default Edit