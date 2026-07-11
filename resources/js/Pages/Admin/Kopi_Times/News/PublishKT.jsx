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

function PublishKT({ news, editors, fokus, hasEditor, editor_id }) {

    const { data, setData, post, processing, errors } = useForm({
        is_code: news.is_code ?? '',
        status: 2,
        editor: editor_id,
        keyword_tool: '',
        title: news.title ?? '',
        description: '',
        tag: [],
        is_content: news.content ?? '',
        is_headline: 0,
        image_thumbnail: news.image ?? '',
        image_watermark: false,
        image_caption: news.caption ?? '',
        datepub: '',
        locus: news.city ?? '',
        focus: '',

    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.kopi-times.news.publish.store', news.is_code));
    };

    return (
        <div>
            <Head title="Publish Berita Kopi Times" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            {/* Header */}
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Publish Berita Kopi Times</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Beranda</a></li>
                                        <li>Kopi Times</li>
                                        <li><Link href={route('admin.kopi-times.news.index')}>Berita</Link></li>
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

                                {/* Card Gambar Thumbnail */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><ImagesIcon className='w-6 h-6' /> Gambar Thumbnail Publish</span>}>
                                    {/* ... Isi form thumbnail Anda tetap sama seperti sebelumnya ... */}
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-3'>
                                            <img src={data.image_thumbnail} alt="Thumbnail Preview" className="w-full h-80 object-cover rounded-lg border" />
                                        </div>


                                     

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

export default PublishKT