import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import InputImage from '@/Components/InputImage'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

function Create({ desktopLocations = [], mobileLocations = [] }) {

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        datestart: '',
        dateend: '',
        url: '',
        cpc: '',
        cost: '',
        status: '1',
        
        // --- STATE DESKTOP ---
        d_img: null,
        d_format: 'banner', // Default format
        locate_desktop: [], 
        
        // --- STATE MOBILE ---
        m_img: null,
        m_format: 'banner', // Default format
        locate_mobile: [],  
    });

    // 💡 HELPER: Menentukan dimensi berdasarkan platform dan format yang dipilih
    const getDimensions = (platform, format) => {
        if (platform === 'desktop') {
            return format === 'banner' 
                ? { width: 728, height: 90, label: 'Banner Horizontal (728x90)' } 
                : { width: 300, height: 250, label: 'Kotak / Medium Rectangle (300x250)' };
        } else {
            return format === 'banner' 
                ? { width: 320, height: 50, label: 'Mobile Banner (320x50)' } 
                : { width: 300, height: 250, label: 'Mobile Kotak (300x250)' };
        }
    };

    const handleMultiSelect = (e, fieldName) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setData(fieldName, selectedValues);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.nasional.ads.store'));
    };

    // Eksekusi dimensi secara reaktif saat state berubah
    const desktopDim = getDimensions('desktop', data.d_format);
    const mobileDim = getDimensions('mobile', data.m_format);

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Campaign Iklan" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        <div className='flex justify-between items-center'>
                            <h1 className="text-3xl font-bold text-foreground">Tambah Iklan Baru</h1>
                        </div>

                        <form onSubmit={submit} className='space-y-6'>
                            
                            {/* --- KARTU INFORMASI DASAR --- */}
                            <Card>
                                <div className='grid grid-cols-1 lg:grid-cols-6 gap-6'>
                                    <div className='lg:col-span-3'>
                                        <InputLabel htmlFor="title" value="Judul Iklan" className='mb-2 font-bold' />
                                        <TextInput
                                            id="title" type="text" className="block w-full"
                                            value={data.title} onChange={(e) => setData('title', e.target.value)}
                                        />
                                        <InputError message={errors.title} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-3'>
                                        <InputLabel htmlFor="url" value="URL Tujuan" className='mb-2 font-bold' />
                                        <TextInput
                                            id="url" type="url" placeholder="https://..." className="block w-full"
                                            value={data.url} onChange={(e) => setData('url', e.target.value)}
                                        />
                                        <InputError message={errors.url} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-3'>
                                        <InputLabel htmlFor="datestart" value="Tanggal Mulai" className='mb-2 font-bold' />
                                        <TextInput
                                            id="datestart" type="date" className="block w-full"
                                            value={data.datestart} onChange={(e) => setData('datestart', e.target.value)}
                                        />
                                        <InputError message={errors.datestart} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-3'>
                                        <InputLabel htmlFor="dateend" value="Tanggal Selesai" className='mb-2 font-bold' />
                                        <TextInput
                                            id="dateend" type="date" className="block w-full"
                                            value={data.dateend} onChange={(e) => setData('dateend', e.target.value)}
                                        />
                                        <InputError message={errors.dateend} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-2'>
                                        <InputLabel htmlFor="cpc" value="Cost Per Click (CPC)" className='mb-2 font-bold' />
                                        <TextInput
                                            id="cpc" type="number" className="block w-full"
                                            value={data.cpc} onChange={(e) => setData('cpc', e.target.value)}
                                        />
                                        <InputError message={errors.cpc} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-2'>
                                        <InputLabel htmlFor="cost" value="Total Cost" className='mb-2 font-bold' />
                                        <TextInput
                                            id="cost" type="number" className="block w-full"
                                            value={data.cost} onChange={(e) => setData('cost', e.target.value)}
                                        />
                                        <InputError message={errors.cost} className="mt-2" />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <InputSelect
                                            label="Status" value={data.status} onChange={(e) => setData('status', e.target.value)}
                                            options={[ { label: "Aktif", value: "1" }, { label: "Tidak Aktif", value: "0" } ]}
                                        />
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                </div>
                            </Card>

                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                
                                {/* --- KELOMPOK DESKTOP --- */}
                                <Card>
                                    <h2 className="text-xl font-bold mb-4 text-blue-600 border-b pb-2">Platform Desktop</h2>
                                    <div className='space-y-6'>
                                        
                                        {/* Dropdown Pemilihan Format Dinamis */}
                                        <div className='w-full'>
                                            <InputSelect
                                                label="Pilih Format Tampilan Desktop"
                                                value={data.d_format}
                                                onChange={(e) => setData('d_format', e.target.value)}
                                                options={[
                                                    { label: "Banner Horizontal", value: "banner" },
                                                    { label: "Kotak (Medium Rectangle)", value: "box" }
                                                ]}
                                            />
                                        </div>

                                        {/* Komponen Gambar yang Merespon Pilihan Format */}
                                        <div className='w-full bg-slate-50 p-4 rounded border'>
                                            <InputImage
                                                label={`Upload ${desktopDim.label}`}
                                                value={data.d_img}
                                                onChange={(file) => setData('d_img', file)}
                                                targetWidth={desktopDim.width}
                                                targetHeight={desktopDim.height}
                                            />
                                            <InputError message={errors.d_img} className="mt-2" />
                                        </div>

                                        <div className='w-full'>
                                            <InputLabel htmlFor="locate_desktop" value="Pilih Lokasi Tayang Desktop" className='mb-2 font-bold' />
                                            <select
                                                id="locate_desktop" multiple
                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm block w-full"
                                                value={data.locate_desktop}
                                                onChange={(e) => handleMultiSelect(e, 'locate_desktop')}
                                                size="5"
                                            >
                                                {desktopLocations.map((loc) => (
                                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Tahan CTRL/CMD untuk memilih banyak.</p>
                                            <InputError message={errors.locate_desktop} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* --- KELOMPOK MOBILE --- */}
                                <Card>
                                    <h2 className="text-xl font-bold mb-4 text-green-600 border-b pb-2">Platform Mobile</h2>
                                    <div className='space-y-6'>
                                        
                                        {/* Dropdown Pemilihan Format Dinamis */}
                                        <div className='w-full'>
                                            <InputSelect
                                                label="Pilih Format Tampilan Mobile"
                                                value={data.m_format}
                                                onChange={(e) => setData('m_format', e.target.value)}
                                                options={[
                                                    { label: "Mobile Banner", value: "banner" },
                                                    { label: "Kotak (Medium Rectangle)", value: "box" }
                                                ]}
                                            />
                                        </div>

                                        {/* Komponen Gambar yang Merespon Pilihan Format */}
                                        <div className='w-full bg-slate-50 p-4 rounded border'>
                                            <InputImage
                                                label={`Upload ${mobileDim.label}`}
                                                value={data.m_img}
                                                onChange={(file) => setData('m_img', file)}
                                                targetWidth={mobileDim.width}
                                                targetHeight={mobileDim.height}
                                            />
                                            <InputError message={errors.m_img} className="mt-2" />
                                        </div>

                                        <div className='w-full'>
                                            <InputLabel htmlFor="locate_mobile" value="Pilih Lokasi Tayang Mobile" className='mb-2 font-bold' />
                                            <select
                                                id="locate_mobile" multiple
                                                className="border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm block w-full"
                                                value={data.locate_mobile}
                                                onChange={(e) => handleMultiSelect(e, 'locate_mobile')}
                                                size="5"
                                            >
                                                {mobileLocations.map((loc) => (
                                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Tahan CTRL/CMD untuk memilih banyak.</p>
                                            <InputError message={errors.locate_mobile} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className='flex justify-end mt-4'>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={processing}
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Iklan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Create