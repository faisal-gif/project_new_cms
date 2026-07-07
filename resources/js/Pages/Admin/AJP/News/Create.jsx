import Card from '@/Components/Card'
import Checkbox from '@/Components/Checkbox'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputImage from '@/Components/InputImage'
import InputLabel from '@/Components/InputLabel'
import InputPhoneNumber from '@/Components/InputPhoneNumber'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { CaptionsIcon, ImagesIcon, InfoIcon, NotebookPenIcon, UserCheckIcon } from 'lucide-react'
import React from 'react'
import Select from "react-select";

export default function Create({ writers }) {
    // Inisialisasi state form dengan menambahkan field narasumber baru
    const { data, setData, post, processing, errors } = useForm({
        pewarta_id: null,
        title: '',
        content: '',
        image: null,
        image_watermark: false,
        caption: '',
        city: '',
        narsum: '',
        profesi: '',
        contact: '',
    });

    // Format opsi untuk Select Penulis
    const writerOptions = writers ? writers.map(w => ({
        value: w.value,
        label: `${w.label} (Sisa Kuota: ${w.quota_news})`,
    })) : [];

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.ajp.news.store'));
    };

    return (
        <div>
            <Head title="Tambah Berita AJP" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Berita AJP</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Beranda</a></li>
                                        <li>AJP</li>
                                        <li>Berita</li>
                                        <li>Tambah Berita</li>
                                    </ul>
                                </div>
                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                                {/* --- CARD 1: INFORMASI DASAR --- */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <InfoIcon className='w-6 h-6' /> Informasi Dasar
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>
                                        <div className='lg:col-span-6 w-full'>
                                            <InputLabel
                                                htmlFor="pewarta_id"
                                                value="Penulis (Pewarta)"
                                                className='mb-2 label-text font-bold text-blue-600'
                                            />
                                            <Select
                                                id="pewarta_id"
                                                value={writerOptions.find(w => w.value === data.pewarta_id)}
                                                options={writerOptions}
                                                placeholder="-- Pilih Penulis --"
                                                onChange={(val) => setData('pewarta_id', val?.value)}
                                                isClearable
                                            />
                                            <InputError message={errors.pewarta_id} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* --- CARD 2: INFORMASI NARASUMBER & LOKASI (BARU) --- */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <UserCheckIcon className='w-6 h-6' /> Informasi Narasumber & Lokasi
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>

                                        {/* NAMA NARASUMBER */}
                                        <div className='lg:col-span-3'>
                                            <InputLabel htmlFor="narsum" value="Nama Narasumber" className='mb-2 label-text font-bold' />
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

                                        {/* PROFESI NARASUMBER */}
                                        <div className='lg:col-span-3'>
                                            <InputLabel htmlFor="profesi" value="Profesi Narasumber" className='mb-2 label-text font-bold' />
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

                                        {/* NO TLP / HP NARASUMBER */}
                                        <div className='lg:col-span-3'>
                                            <InputLabel htmlFor="contact" value="No Tlp/Hp Narasumber" className='mb-2 label-text font-bold' />
                                            <InputPhoneNumber
                                                id="contact"
                                                value={data.contact}
                                                onChange={(e) => setData('contact', e.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Contoh: 081234xxxx"
                                            />
                                            <InputError message={errors.contact} className="mt-2" />
                                        </div>

                                        {/* KOTA / LOKUS KEJADIAN */}
                                        <div className='lg:col-span-3'>
                                            <InputLabel htmlFor="city" value="Kota (Lokus Kejadian)" className='mb-2 label-text font-bold' />
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
                                            <InputLabel htmlFor="title" value="Judul Berita" className='mb-2 label-text font-bold' />
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
                                            <InputLabel htmlFor="content" value="Isi Berita" className='mb-2 label-text font-bold' />
                                            <InputEditor
                                                value={data.content}
                                                onChange={(val) => setData('content', val)}
                                            />
                                            <InputError message={errors.content} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* --- CARD 4: GAMBAR THUMBNAIL --- */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <ImagesIcon className='w-6 h-6' /> Gambar Thumbnail
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>
                                        <div className='lg:col-span-3'>
                                            <div className='flex flex-col gap-2'>
                                                <div>
                                                    <InputLabel htmlFor="image" value="Upload Thumbnail" className='mb-2 label-text font-bold' />
                                                    <div className='flex items-center justify-center gap-0.5 mt-1'>
                                                        <InputImage
                                                            value={data.image}
                                                            targetHeight={800}
                                                            targetWidth={1200}
                                                            onChange={(file) => setData('image', file)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <InputError message={errors.image} className="mt-2" />
                                        </div>

                                        <label className="flex items-center gap-2 lg:col-span-6">
                                            <Checkbox
                                                checked={data.image_watermark}
                                                onChange={(e) => setData('image_watermark', e.target.checked)}
                                            />
                                            Apakah ini foto original?
                                        </label>

                                        <div className='lg:col-span-6'>
                                            <InputTextarea
                                                id="caption"
                                                label={"Caption Thumbnail"}
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
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-8 shadow-lg text-lg"
                                        disabled={processing}
                                    >
                                        {processing ? 'Menyimpan Data...' : 'Simpan Berita AJP'}
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