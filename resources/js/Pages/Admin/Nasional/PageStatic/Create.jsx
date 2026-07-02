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
        name: '',
        description: '',
        keyword: [],
        isi: '',
    });

  
    const submit = (e) => {
        e.preventDefault();
        post(route('admin.nasional.page-static.store'));
    };


    return (
        <div>
            <Head title="Tambah Page Static" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Page Static</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Nasional</li>
                                        <li>Page Static</li>
                                        <li>Tambah Page Static</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                              
                                {/* Card Nama, Deskripsi & Tag */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <CaptionsIcon className='w-6 h-6' /> Nama & Deskripsi
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="name"
                                                value="Name"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="name"
                                                name="name"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                autoComplete="name"
                                            />
                                            <InputError message={errors.name} className="mt-2" />
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
                                                value={data.keyword}
                                                onChange={(e) => setData('keyword', e)}
                                            />
                                            <InputError message={errors.keyword} className="mt-2" />
                                        </div>
                                    </div>

                                </Card>
                                {/* Card Konten Berita */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <NotebookPenIcon className='w-6 h-6' /> Isi Page Static
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="content"
                                                value="Isi Page Static"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <InputEditor
                                                value={data.isi}
                                                onChange={(e) => setData('isi', e)}
                                            />
                                            <InputError message={errors.isi} className="mt-2" />
                                        </div>


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