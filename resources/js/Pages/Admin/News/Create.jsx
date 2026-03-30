import Card from '@/Components/Card'
import Checkbox from '@/Components/Checkbox'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputImage from '@/Components/InputImage'
import InputLabel from '@/Components/InputLabel'

import InputTag from '@/Components/InputTag'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { Calendar1Icon, CaptionsIcon, CopyIcon, DollarSignIcon, EyeIcon, GalleryThumbnails, GlobeIcon, ImageIcon, ImagesIcon, InfoIcon, NotebookPenIcon } from 'lucide-react'
import React, { useState } from 'react'
import Select from "react-select";

function Create({ writers }) {

    const { data, setData, post, processing, errors, reset } = useForm({
        writer: '',
        judul: '',
        description: '',
        image_thumbnail: '',
        image_watermark: true,
        image_caption: '',

        tag: [],
        content: '',
    });

  
    const submit = (e) => {
        e.preventDefault();
        post(route('admin.news.store'));
    };


    return (
        <div>
            <Head title="Tambah News" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah News</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>News</li>
                                        <li>Tambah News</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                                {/* Card Informasi Dasar */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <InfoIcon className='w-6 h-6' /> Informasi Dasar
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>


                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="writer"
                                                value="Penulis"
                                                className='mb-2 label-text font-bold'
                                            />

                                            <Select
                                                value={writers.find(w => w.value === data.writer)}
                                                options={writers}
                                                placeholder="Penulis"
                                                onChange={(val) => setData('writer', val?.value)}
                                            />
                                            <InputError message={errors.writer} className="mt-2" />

                                        </div>
                                    </div>

                                </Card>
                                {/* Card Judul, Deskripsi & Tag */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <CaptionsIcon className='w-6 h-6' /> Judul & Deskripsi
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="judul"
                                                value="Judul"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="judul"
                                                name="judul"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.judul}
                                                onChange={(e) => setData('judul', e.target.value)}
                                                autoComplete="judul"
                                            />
                                            <InputError message={errors.judul} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6'>
                                            <InputTextarea
                                                label={"Deskripsi"}
                                                value={data.description}
                                                placeholder='Masukan Deskripsi Berita'
                                                maxLength={255}
                                                className='h-20'
                                                onChange={(e) => setData('description', e.target.value)}
                                            />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6'>
                                            <InputTag
                                                label="Tag"
                                                value={data.tag}
                                                onChange={(e) => setData('tag', e)}
                                            />
                                            <InputError message={errors.tag} className="mt-2" />
                                        </div>
                                    </div>

                                </Card>
                                {/* Card Konten Berita */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <NotebookPenIcon className='w-6 h-6' /> Konten Berita
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="content"
                                                value="Isi Berita"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <InputEditor
                                                value={data.content}
                                                onChange={(e) => setData('content', e)}
                                            />
                                            <InputError message={errors.content} className="mt-2" />
                                        </div>


                                    </div>

                                </Card>

                                {/* Card Gambar */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <ImagesIcon className='w-6 h-6' /> Gambar
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <div className='grid grid-cols-1 md:grid-col-2 lg:grid-cols-3 gap-4'>
                                                {/* Image 1 */}
                                                <div id='image_thumbnail' className='flex flex-col gap-1'>
                                                    <div>
                                                        <InputLabel
                                                            htmlFor="image_thumbnail"
                                                            value="Thumbnail"
                                                            className='mb-2 label-text font-bold'
                                                        />
                                                        <div className='flex items-center justify-center gap-0.5 mt-1'>
                                                            <InputImage
                                                                value={data.image_thumbnail}
                                                                onChange={(file) => setData('image_thumbnail', file)}
                                                            />

                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={data.image_watermark}
                                            onChange={(e) => setData('image_watermark', e.target.checked)}
                                        />
                                        Apakah ini foto original?
                                    </label>


                                    <div>
                                        <InputTextarea
                                            id="image_caption"
                                            name="Caption Thumbnail"
                                            label={"Caption Thumbnail"}
                                            value={data.image_caption}
                                            onChange={(e) => setData('image_caption', e.target.value)}
                                            autoComplete="image_caption"
                                            maxLength={255}

                                        />


                                        <InputError message={errors.image_caption} className="mt-2" />
                                    </div>
                                </Card>


                                <div className='flex flex-row justify-end mt-4'>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        Simpan
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

export default Create