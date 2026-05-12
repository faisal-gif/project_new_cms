import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputRadioGroup from '@/Components/InputRadioGroup'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import InputImage from '@/Components/InputImage' // <-- Import komponen InputImage
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        keyword: '',
        description: '',
        // Ubah inisialisasi dari string kosong ('') menjadi null untuk handling File
        img_desktop_list: null,
        img_desktop_news: null,
        img_mobile: null,
        status: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.nasional.fokus.store'));
    };

    return (
        <>
            <Head title="Tambah Fokus" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className=" space-y-6">

                            {/* start Header & Breadcrumbs */}
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Fokus Nasional</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Nasional</li>
                                        <li>Fokus</li>
                                        <li>Tambah Fokus</li>
                                    </ul>
                                </div>
                            </div>
                            {/* end Header & Breadcrumbs */}

                            <form onSubmit={submit} className='space-y-6'>

                                {/* --- SECTION: DETAIL FOKUS --- */}
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Detail Fokus</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                            <div className="lg:col-span-6 w-80">
                                                <InputRadioGroup
                                                    label="Status"
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e)}
                                                    options={[
                                                        { label: "Pending", value: 0, color: "error" },
                                                        { label: "Publish", value: 1, color: "success" },
                                                    ]}
                                                />
                                                <InputError message={errors.status} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-6 w-full'>
                                                <InputLabel htmlFor="name" value="Nama" className='mb-2 label-text font-bold' />
                                                <TextInput
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    autoComplete="name"
                                                />
                                                <InputError message={errors.name} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-6 w-full'>
                                                <InputTextarea
                                                    label="Keyword"
                                                    value={data.keyword}
                                                    onChange={(e) => setData('keyword', e.target.value)}
                                                    placeholder="Masukkan keyword Fokus..."
                                                    maxLength={255}
                                                />
                                                <InputError message={errors.keyword} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-6 w-full'>
                                                <InputTextarea
                                                    label="Description"
                                                    value={data.description}
                                                    className='h-48'
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Masukkan description Fokus..."
                                                    maxLength={500}
                                                />
                                                <InputError message={errors.description} className="mt-2" />
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* --- SECTION: IMAGE UPLOAD --- */}
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Image</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

                                            {/* Image Desktop News dengan resolusi 1200x300 */}
                                            <div className='w-full'>
                                                <InputImage
                                                    label="Image Desktop News"
                                                    value={data.img_desktop_news}
                                                    onChange={(file) => setData('img_desktop_news', file)}
                                                    targetWidth={1200}  // Menetapkan lebar target
                                                    targetHeight={300}  // Menetapkan tinggi target
                                                />
                                                <InputError message={errors.img_desktop_news} className="mt-2" />
                                            </div>

                                            {/* Jika Image Desktop List juga menggunakan ukuran yang sama */}
                                            <div className='w-full'>
                                                <InputImage
                                                    label="Image Desktop List"
                                                    value={data.img_desktop_list}
                                                    onChange={(file) => setData('img_desktop_list', file)}
                                                    targetWidth={1200}
                                                    targetHeight={300}
                                                />
                                                <InputError message={errors.img_desktop_list} className="mt-2" />
                                            </div>

                                            {/* Image Mobile */}
                                            <div className='w-full'>
                                                <InputImage
                                                    label="Image Mobile"
                                                    value={data.img_mobile}
                                                    onChange={(file) => setData('img_mobile', file)}
                                                    targetWidth={600}  // Resolusi portrait atau square untuk mobile
                                                    targetHeight={600}
                                                />
                                                <InputError message={errors.img_mobile} className="mt-2" />
                                            </div>

                                        </div>
                                    </Card>
                                </div>

                                {/* --- SUBMIT BUTTON --- */}
                                <div className='flex flex-row justify-end mt-2'>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        {processing ? <span className="loading loading-spinner"></span> : "Simpan"}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Create