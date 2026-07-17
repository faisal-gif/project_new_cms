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

function PublishAJP({ news, editors, fokus, hasEditor, editor_id }) {

    const { data, setData, post, processing, errors } = useForm({
        is_code: news.is_code ?? '',
        status: '',
        editor: editor_id,
        keyword_tool: '',
        title: news.title ?? '',
        description: '',
        tag: [],
        is_content: news.content ?? '',
        is_headline: 0,
        image_thumbnail: '',
        image_watermark: false,
        image_caption: '',
        datepub: '',
        locus: news.city ?? '',
        focus: '',

    });

    // Mengumpulkan aset gambar dari pewarta (Berdasarkan struktur DB: image, image2, image3)
    const availableImages = [news.image, news.image2, news.image3]
        .filter(Boolean)
        .map(img => img.startsWith('http') ? img : `/storage/${img}`); // Sesuaikan path storage Anda

    // Fungsi untuk menyalin URL ke clipboard
    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        alert("URL Gambar berhasil disalin!");
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.ajp.news.publish.store', news.id));
    };

    return (
        <div>
            <Head title="Publish Berita AJP" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            {/* Header */}
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Publish Berita AJP</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Beranda</a></li>
                                        <li>AJP</li>
                                        <li><Link href={route('admin.ajp.news.index')}>Berita</Link></li>
                                        <li>Publish Berita</li>
                                    </ul>
                                </div>
                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                                {/* Card Informasi Dasar */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><InfoIcon className='w-6 h-6' /> Informasi Dasar</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>
                                        <div className="lg:col-span-6">
                                            <InputRadioGroup
                                                label="Status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e)}
                                                options={[
                                                    { label: "Publish", value: 1, color: "success" },
                                                    { label: "Review", value: 2, color: "warning" },
                                                ]}
                                            />
                                            <InputError message={errors.status} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel value="Editor" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={editors.find(e => e.value == data.editor)}
                                                options={editors}
                                                placeholder="Pilih Editor..."
                                                onChange={(val) => setData('editor', val?.value)}
                                                isDisabled={hasEditor}
                                            />
                                            <InputError message={errors.editor} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel value="Penulis" className='mb-2 label-text font-bold' />
                                            <TextInput className="block w-full" value={news.writer.nama} disabled />
                                        </div>


                                    </div>
                                </Card>


                                {/* Card Judul & Deskripsi */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><CaptionsIcon className='w-6 h-6' /> Judul & Deskripsi</span>}>
                                    {/* ... Isi form judul Anda tetap sama seperti sebelumnya ... */}
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel value="Judul" className='mb-2 label-text font-bold' />
                                            <TextInput className="mt-1 block w-full" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputTextarea label={"Deskripsi"} value={data.description} className='h-20' onChange={(e) => setData('description', e.target.value)} />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputTag label="Tag" value={data.tag} onChange={(e) => setData('tag', e)} />
                                            <InputError message={errors.tag} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Konten Berita */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><NotebookPenIcon className='w-6 h-6' /> Konten Berita</span>}>
                                    {/* ... Isi form konten Anda tetap sama seperti sebelumnya ... */}
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel value="Isi Berita" className='mb-2 label-text font-bold' />
                                            <InputEditor value={data.is_content} onChange={(e) => setData('is_content', e)} />
                                            <InputError message={errors.is_content} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6 grid grid-cols-1 lg:grid-cols-3 gap-4'>
                                            <InputSwitch label="Headline" checked={!!data.is_headline} onChange={(val) => setData("is_headline", val ? 1 : 0)} />
                                        </div>
                                    </div>
                                </Card>


                                {/* ========================================== */}
                                {/* Card Baru: KUMPULAN FOTO & ASET DARI PEWARTA */}
                                {/* ========================================== */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><ImagesIcon className='w-6 h-6 text-blue-500' /> Aset Foto (Dari Pewarta)</span>}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                        {availableImages.map((url, idx) => (
                                            <div key={idx} className="border rounded-xl p-3 bg-gray-50/80 shadow-sm flex flex-col gap-3">

                                                {/* Preview Gambar */}
                                                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden border">
                                                    <img src={url} alt={`Aset Pewarta ${idx + 1}`} className="w-full h-full object-cover" />
                                                </div>

                                                {/* Action URL & Download */}
                                                <div className="flex flex-col gap-2">
                                                    <InputLabel value={`URL Foto ${idx + 1}`} className="text-xs text-gray-500 font-bold" />
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={url}
                                                        className="w-full text-xs px-2 py-1.5 border-gray-300 rounded bg-white text-gray-600 focus:ring-0"
                                                    />

                                                    <div className="flex gap-2 mt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(url)}
                                                            className="btn btn-sm btn-outline flex-1 gap-1"
                                                        >
                                                            <CopyIcon size={14} /> Copy URL
                                                        </button>

                                                        {/* Attribut download digunakan agar browser langsung mengunduh file */}
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            download={`Aset_Berita_${news.is_code}_${idx + 1}.jpg`}
                                                            className="btn btn-sm btn-primary flex-1 gap-1"
                                                        >
                                                            <DownloadIcon size={14} /> Download
                                                        </a>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}

                                        {availableImages.length === 0 && (
                                            <div className="col-span-3 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                                <ImagesIcon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                                                <p className="text-gray-500 font-medium">Tidak ada foto yang dilampirkan oleh pewarta pada berita ini.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                                {/* ========================================== */}

                                {/* ========================================== */}
                                {/* Card Baru: KUMPULAN CAPTION DARI PEWARTA */}
                                {/* ========================================== */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><CaptionsIcon className='w-6 h-6 text-blue-500' /> Caption Foto (Dari Pewarta)</span>}>
                                    <div className=''>
                                        <InputLabel value="Caption" className='mb-2 label-text font-bold' />
                                        <InputTextarea className="mt-1 block w-full" value={news.caption} readOnly />
                                    </div>
                                </Card>
                                {/* ========================================== */}

                                {/* Card Gambar Thumbnail */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><ImagesIcon className='w-6 h-6' /> Gambar Thumbnail Publish</span>}>
                                    {/* ... Isi form thumbnail Anda tetap sama seperti sebelumnya ... */}
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Upload Thumbnail Baru (Wajib ditarik dari aset atau edit baru)" className='mb-2 label-text font-bold text-blue-600' />
                                            <InputImage existingImage={news.news_image_new} targetWidth={1200} targetHeight={800} value={data.image_thumbnail} onChange={(file) => setData('image_thumbnail', file)} />
                                            <InputError message={errors.image_thumbnail} className="mt-2" />
                                        </div>


                                        <label className="flex items-center gap-2 lg:col-span-6">
                                            <Checkbox
                                                checked={data.image_watermark}
                                                onChange={(e) => setData('image_watermark', e.target.checked)}
                                            />
                                            Apakah ini foto original?
                                        </label>

                                        <div className='lg:col-span-6'>
                                            <InputTextarea label={"Caption Thumbnail"} value={data.image_caption} onChange={(e) => setData('image_caption', e.target.value)} />
                                            <InputError message={errors.image_caption} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Publish */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><GlobeIcon className='w-6 h-6' /> Finalisasi Publish</span>}>
                                    {/* ... Isi form finalisasi Anda tetap sama seperti sebelumnya ... */}
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Tanggal Publish" className='mb-2 label-text font-bold' />
                                            <TextInput type="datetime-local" className="mt-1 block w-full" value={data.datepub} onChange={(e) => setData('datepub', e.target.value)} />
                                            <InputError message={errors.datepub} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Lokus" className='mb-2 label-text font-bold' />
                                            <TextInput type="text" className="mt-1 block w-full" value={data.locus} onChange={(e) => setData('locus', e.target.value)} />
                                            <InputError message={errors.locus} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-4'>
                                    <button type="submit" className="btn btn-success px-8 text-lg" disabled={processing}>
                                        Terbitkan Berita Sekarang
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

export default PublishAJP