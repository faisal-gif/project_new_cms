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
import { Head, useForm } from '@inertiajs/react'
import { CaptionsIcon, GlobeIcon, ImagesIcon, InfoIcon, NotebookPenIcon } from 'lucide-react'
import React from 'react'
import Select from "react-select";

function Create({ writers, editors, kanal, fokus }) {

    const { data, setData, post, processing, errors } = useForm({
        is_code: '',
        status: '',
        editor: '', // Menangkap nilai default editor_id dari backend
        writer: '', // Menangkap nilai default writer_id dari backend
        writer_id: '', // Menangkap nilai default writer_id dari backend
        pin: '',
        keyword_tool: '',
        title: '',
        description: '',
        tag: [],
        is_content: '',
        is_headline: '',
        image_thumbnail: '',
        image_watermark: false,
        image_caption: '',
        datepub: '',
        locus: '',
        focus: '',
        kanal: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.nasional.news.store'));
    };


    return (
        <div>
            <Head title="Tambah Berita Nasional" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Berita Nasional</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Beranda</a></li>
                                        <li>Berita Nasional</li>
                                        <li>Tambah Berita</li>
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
                                        <div className="lg:col-span-6">
                                            <InputRadioGroup
                                                label="Status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e)}
                                                options={[
                                                    { label: "Pending", value: 0, color: "secondary" },
                                                    { label: "Review", value: 2, color: "warning" },
                                                    { label: "On Pro", value: 3, color: "error" },
                                                    { label: "Publish", value: 1, color: "success" },
                                                ]}
                                            />

                                            <InputError message={errors.status} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="editor"
                                                value="Editor"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={editors.find(e => e.value === data.editor)}
                                                options={editors}
                                                placeholder="Pilih Editor..."
                                                onChange={(val) => setData('editor', val?.value)}
                                            />
                                            <InputError message={errors.editor} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="writer"
                                                value="Penulis"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={writers.find(w => w.label === data.writer)}
                                                options={writers}
                                                placeholder="Pilih Penulis..."
                                                onChange={(val) => {
                                                    setData('writer', val?.label);
                                                    setData('writer_id', val?.value); // Set juga writer_id
                                                }}
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
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                autoComplete="title"
                                            />
                                            <InputError message={errors.title} className="mt-2" />
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
                                                htmlFor="is_content"
                                                value="Isi Berita"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <InputEditor
                                                value={data.is_content}
                                                onChange={(e) => setData('is_content', e)}
                                            />
                                            <InputError message={errors.is_content} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                                                <InputSwitch
                                                    label="Headline"
                                                    checked={data.is_headline}
                                                    onChange={(val) => setData("is_headline", val ? 1 : 0)}
                                                />

                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Gambar Thumbnail */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <ImagesIcon className='w-6 h-6' /> Gambar Thumbnail
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-3'>
                                            <div id='image_thumbnail' className='flex flex-col gap-2'>
                                                <div>
                                                    <InputLabel
                                                        htmlFor="image_thumbnail"
                                                        value="Thumbnail"
                                                        className='mb-2 label-text font-bold'
                                                    />
                                                    <div className='flex items-center justify-center gap-0.5 mt-1'>
                                                        <InputImage
                                                            value={data.image_thumbnail}
                                                            targetHeight={800}
                                                            targetWidth={1200}
                                                            onChange={(file) => setData('image_thumbnail', file)}
                                                        />

                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={data.image_watermark}
                                                        onChange={(e) => setData('image_watermark', e.target.checked)}
                                                    />
                                                    Apakah ini foto original?
                                                </label>
                                            </div>
                                        </div>
                                        <div className='lg:col-span-6'>
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
                                    </div>
                                </Card>

                                {/* Card Publish */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <GlobeIcon className='w-6 h-6' /> Publish
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="datepub"
                                                value="Tanggal Publish"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="datepub"
                                                name="Tanggal Publish"
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={data.datepub}
                                                onChange={(e) => setData('datepub', e.target.value)}
                                                autoComplete="datepub"
                                            />
                                            <InputError message={errors.datepub} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="lokus"
                                                value="Lokus"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="lokus"
                                                name="Lokus"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.locus}
                                                onChange={(e) => setData('locus', e.target.value)}
                                                autoComplete="locus"
                                            />
                                            <InputError message={errors.locus} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="kanal"
                                                value="Kanal"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={data.kanal ? kanal.find(k => k.value === data.kanal) : null}
                                                options={kanal}
                                                placeholder="Pilih Kanal..."
                                                onChange={(val) => setData('kanal', val?.value)}
                                            />
                                            <InputError message={errors.kanal} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="fokus"
                                                value="Fokus"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={data.focus ? fokus.find(f => f.value === data.focus) : null}
                                                options={fokus}
                                                placeholder="Pilih Fokus..."
                                                onChange={(val) => setData('focus', val?.value)}
                                            />
                                            <InputError message={errors.focus} className="mt-2" />
                                        </div>


                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-4'>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        Simpan Ke Nasional
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