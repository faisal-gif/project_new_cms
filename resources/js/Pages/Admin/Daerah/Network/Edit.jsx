import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputSelect from '@/Components/InputSelect'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React, { useEffect } from 'react'

function Edit({ network }) {

    const { data, setData, put, processing, errors, reset } = useForm({
        name: network.name || '',
        domain: network.domain || '',
        title: network.title || 'TIMES _DAERAH_',
        tagline: network.tagline || 'Media Online No 1 Pembangun Ketahanan Informasi di _DAERAH_',
        keyword: network.keyword || 'Berita, Terkini, terlengkap, politik, bisnis, olahraga, bola, entertainment, gosip, lifestyle, tekno, otomotif, liga, ketahanan informasi',
        description: network.description || 'Media Online No 1 Pembangun Ketahanan Informasi di _DAERAH_, Menyajikan Berita Terkini Seputar Berita Politik, Bisnis, Olahraga, Artis, Hukum, yang membangun, menginspirasi, dan berpositif thinking berdasarkan jurnalisme positif.',
        analytics: network.analytics || '',
        gverify: network.gverify || '',
        fb: network.fb || '',
        tw: network.tw || '',
        ig: network.ig || '',
        yt: network.yt || '',
        gp: network.gp || '',
        logo: network.logo || '',
        logo_m: network.logo_m || '',
        img_socmed: network.img_socmed || '',
        is_main: network.is_main || '',
        is_web: network.is_web || '',
        status: network.status || '',
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
        put(route('admin.daerah.network.update', network));

    };


    return (
        <>
            <Head title="Edit Network" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Network</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Network</li>
                                        <li>Edit Network</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>


                            <form onSubmit={submit} className='space-y-6'>
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Detail Network</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            {/* Form fields will go here */}
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
                                                <InputLabel
                                                    htmlFor="name"
                                                    value="Nama"
                                                    className='mb-2 label-text font-bold'
                                                />
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
                                                <InputLabel
                                                    htmlFor="domain"
                                                    value="Domain"
                                                    className='mb-2 font-bold'
                                                />
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
                                                <InputLabel
                                                    htmlFor="title"
                                                    value="Judul"
                                                    className='mb-2 font-bold'
                                                />
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
                                                <InputLabel
                                                    htmlFor="tagline"
                                                    value="Tagline"
                                                    className='mb-2 font-bold'
                                                />
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
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Social Media</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="analytics"
                                                    value="Analytics ID"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="analytics"
                                                    name="analytics"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.analytics}
                                                    onChange={(e) => setData('analytics', e.target.value)}
                                                    autoComplete="analytics"
                                                />
                                                <InputError message={errors.analytics} className="mt-2" />
                                            </div>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="gverify"
                                                    value="Google Verify"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="gverify"
                                                    name="gverify"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.gverify}
                                                    onChange={(e) => setData('gverify', e.target.value)}
                                                    autoComplete="gverify"
                                                />
                                                <InputError message={errors.gverify} className="mt-2" />
                                            </div>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="fb"
                                                    value="Facebook"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="fb"
                                                    name="fb"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.fb}
                                                    onChange={(e) => setData('fb', e.target.value)}
                                                    autoComplete="fb"
                                                />
                                                <InputError message={errors.fb} className="mt-2" />
                                            </div>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="tw"
                                                    value="Twiter"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="tw"
                                                    name="tw"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.tw}
                                                    onChange={(e) => setData('tw', e.target.value)}
                                                    autoComplete="tw"
                                                />
                                                <InputError message={errors.tw} className="mt-2" />
                                            </div>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="ig"
                                                    value="Instagram"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="ig"
                                                    name="ig"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.ig}
                                                    onChange={(e) => setData('ig', e.target.value)}
                                                    autoComplete="ig"
                                                />
                                                <InputError message={errors.ig} className="mt-2" />
                                            </div>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="yt"
                                                    value="Youtube"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="yt"
                                                    name="yt"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.yt}
                                                    onChange={(e) => setData('yt', e.target.value)}
                                                    autoComplete="yt"
                                                />
                                                <InputError message={errors.ig} className="mt-2" />
                                            </div>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="gp"
                                                    value="Google Plus"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="gp"
                                                    name="gp"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.gp}
                                                    onChange={(e) => setData('gp', e.target.value)}
                                                    autoComplete="gp"
                                                />
                                                <InputError message={errors.gp} className="mt-2" />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Image</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="logo"
                                                    value="Logo Desktop"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="logo"
                                                    name="logo"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.logo}
                                                    onChange={(e) => setData('logo', e.target.value)}
                                                    autoComplete="logo"
                                                />
                                                <InputError message={errors.logo} className="mt-2" />
                                            </div>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="logo_m"
                                                    value="Logo Mobile"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="logo_m"
                                                    name="logo_m"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.logo_m}
                                                    onChange={(e) => setData('logo_m', e.target.value)}
                                                    autoComplete="logo_m"
                                                />
                                                <InputError message={errors.logo_m} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="img_socmed"
                                                    value="Image Sosmed"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="img_socmed"
                                                    name="img_socmed"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.img_socmed}
                                                    onChange={(e) => setData('img_socmed', e.target.value)}
                                                    autoComplete="img_socmed"
                                                />
                                                <InputError message={errors.img_socmed} className="mt-2" />
                                            </div>
                                        </div>
                                    </Card>

                                </div>

                                <div className='flex flex-row justify-end mt-2'>
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
        </>
    )
}

export default Edit