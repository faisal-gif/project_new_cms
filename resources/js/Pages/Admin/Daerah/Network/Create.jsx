import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputSelect from '@/Components/InputSelect'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import InputImage from '@/Components/InputImage' // <-- Pastikan import InputImage
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React, { useEffect } from 'react'

function Create() {

    // 1. Ubah inisialisasi file menjadi null agar Inertia mendeteksi multipart/form-data
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        domain: '',
        title: 'TIMES _DAERAH_',
        tagline: 'Media Online No 1 Pembangun Ketahanan Informasi di _DAERAH_',
        keyword: 'Berita, Terkini, terlengkap, politik, bisnis, olahraga, bola, entertainment, gosip, lifestyle, tekno, otomotif, liga, ketahanan informasi',
        description: 'Media Online No 1 Pembangun Ketahanan Informasi di _DAERAH_, Menyajikan Berita Terkini Seputar Berita Politik, Bisnis, Olahraga, Artis, Hukum, yang membangun, menginspirasi, dan berpositif thinking berdasarkan jurnalisme positif.',
        analytics: '',
        gverify: '',
        fb: '',
        tw: '',
        ig: '',
        yt: '',
        gp: '',
        logo: null,       // <-- Diubah ke null
        logo_m: null,     // <-- Diubah ke null
        img_socmed: null, // <-- Diubah ke null
        is_main: '0',     // Berikan default value (misal: '0')
        is_web: '1',      // Berikan default value
        status: '1',      // Berikan default value
    });

    useEffect(() => {
        if (data.name) {
            setData(prev => ({
                ...prev,
                title: `TIMES ${data.name}`,
                tagline: `Media Online No 1 Pembangun Ketahanan Informasi di ${data.name}`,
                description: `Media Online No 1 Pembangun Ketahanan Informasi di ${data.name}, Menyajikan Berita Terkini Seputar Berita Politik, Bisnis, Olahraga, Artis, Hukum, yang membangun, menginspirasi, dan berpositif thinking berdasarkan jurnalisme positif.`,
            }));
        }
    }, [data.name]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.daerah.network.store'));
    };

    return (
        <>
            <Head title="Tambah Network" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Network Daerah</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Network Daerah</li>
                                        <li>Tambah Network Daerah</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}
                            </div>


                            <form onSubmit={submit} className='space-y-6'>
                                {/* --- SECTION: DETAIL NETWORK --- */}
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Detail Network</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            <div className="lg:col-span-2 w-full">
                                                <InputSelect
                                                    label="Status"
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                    options={[
                                                        { label: "Publish", value: "1" },
                                                        { label: "Pending", value: "0" },
                                                    ]}
                                                />
                                                <InputError message={errors.status} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-2 w-full">
                                                <InputSelect
                                                    label="Status Web"
                                                    value={data.is_web}
                                                    onChange={(e) => setData('is_web', e.target.value)}
                                                    options={[
                                                        { label: "On", value: "1" },
                                                        { label: "Off", value: "0" },
                                                    ]}
                                                />
                                                <InputError message={errors.is_web} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-2 w-full">
                                                <InputSelect
                                                    label="Main Web"
                                                    value={data.is_main}
                                                    onChange={(e) => setData('is_main', e.target.value)}
                                                    options={[
                                                        { label: "Yes", value: "1" },
                                                        { label: "No", value: "0" },
                                                    ]}
                                                />
                                                <InputError message={errors.is_main} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
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

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="domain" value="Domain" className='mb-2 font-bold' />
                                                <TextInput
                                                    id="domain"
                                                    name="domain"
                                                    type="text"
                                                    value={data.domain}
                                                    onChange={(e) => setData('domain', e.target.value)}
                                                    className="block w-full"
                                                    autoComplete="domain"
                                                />
                                                <InputError message={errors.domain} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="title" value="Judul" className='mb-2 font-bold' />
                                                <TextInput
                                                    id="title"
                                                    name="title"
                                                    type="text"
                                                    value={data.title}
                                                    readOnly={true}
                                                    className="block w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                                                    autoComplete="title"
                                                />
                                                <InputError message={errors.title} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="tagline" value="Tagline" className='mb-2 font-bold' />
                                                <TextInput
                                                    id="tagline"
                                                    name="tagline"
                                                    type="text"
                                                    value={data.tagline}
                                                    readOnly={true}
                                                    className="block w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                                                    autoComplete="tagline"
                                                />
                                                <InputError message={errors.tagline} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-6 w-full'>
                                                <InputTextarea
                                                    label="Keyword"
                                                    value={data.keyword}
                                                    onChange={(e) => setData('keyword', e.target.value)}
                                                    placeholder="Masukkan keyword Network..."
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
                                                    placeholder="Masukkan description Network..."
                                                    maxLength={500}
                                                />
                                                <InputError message={errors.description} className="mt-2" />
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* --- SECTION: SOCIAL MEDIA --- */}
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Social Media & Analytics</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="analytics" value="Analytics ID" className='mb-2 label-text font-bold' />
                                                <TextInput
                                                    id="analytics"
                                                    name="analytics"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.analytics}
                                                    onChange={(e) => setData('analytics', e.target.value)}
                                                />
                                                <InputError message={errors.analytics} className="mt-2" />
                                            </div>
                                            
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="gverify" value="Google Verify" className='mb-2 label-text font-bold' />
                                                <TextInput
                                                    id="gverify"
                                                    name="gverify"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.gverify}
                                                    onChange={(e) => setData('gverify', e.target.value)}
                                                />
                                                <InputError message={errors.gverify} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="fb" value="Facebook" className='mb-2 label-text font-bold' />
                                                <TextInput
                                                    id="fb"
                                                    name="fb"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.fb}
                                                    onChange={(e) => setData('fb', e.target.value)}
                                                />
                                                <InputError message={errors.fb} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="tw" value="Twitter" className='mb-2 label-text font-bold' />
                                                <TextInput
                                                    id="tw"
                                                    name="tw"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.tw}
                                                    onChange={(e) => setData('tw', e.target.value)}
                                                />
                                                <InputError message={errors.tw} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="ig" value="Instagram" className='mb-2 label-text font-bold' />
                                                <TextInput
                                                    id="ig"
                                                    name="ig"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.ig}
                                                    onChange={(e) => setData('ig', e.target.value)}
                                                />
                                                <InputError message={errors.ig} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="yt" value="Youtube" className='mb-2 label-text font-bold' />
                                                <TextInput
                                                    id="yt"
                                                    name="yt"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.yt}
                                                    onChange={(e) => setData('yt', e.target.value)}
                                                />
                                                <InputError message={errors.yt} className="mt-2" />
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* --- SECTION: IMAGE ASSETS --- */}
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Aset Gambar (Logo & Open Graph)</span>
                                    </h2>
                                    <Card>
                                        {/* Menggunakan grid-cols-3 agar sejajar rapi */}
                                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                                            
                                            <div className='w-full'>
                                                <InputImage
                                                    label="Logo Desktop"
                                                    value={data.logo}
                                                    onChange={(file) => setData('logo', file)}
                                                    // Resolusi persegi panjang pipih ideal untuk header desktop (rasio 3:1 atau 4:1)
                                                    targetWidth={600} 
                                                    targetHeight={150} 
                                                />
                                                <InputError message={errors.logo} className="mt-2" />
                                            </div>
                                            
                                            <div className='w-full'>
                                                <InputImage
                                                    label="Logo Mobile / Favicon"
                                                    value={data.logo_m}
                                                    onChange={(file) => setData('logo_m', file)}
                                                    // Resolusi kotak ideal untuk mobile icon / favicon
                                                    targetWidth={200} 
                                                    targetHeight={200} 
                                                />
                                                <InputError message={errors.logo_m} className="mt-2" />
                                            </div>

                                            <div className='w-full'>
                                                <InputImage
                                                    label="Image Open Graph (Sosmed)"
                                                    value={data.img_socmed}
                                                    onChange={(file) => setData('img_socmed', file)}
                                                    // Resolusi standar Facebook/WA/Twitter Open Graph URL (Rasio 1.91:1)
                                                    targetWidth={1200} 
                                                    targetHeight={630} 
                                                />
                                                <InputError message={errors.img_socmed} className="mt-2" />
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
                                        {processing ? <span className="loading loading-spinner"></span> : "Simpan Network"}
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