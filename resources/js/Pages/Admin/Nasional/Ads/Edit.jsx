import Card from '@/Components/Card'
import InputAdsImage from '@/Components/InputAdsImage'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React, { useMemo } from 'react'
import Select from 'react-select'

// Asumsi: prop 'ads' dikirim dari backend membawa data AdsNasional saat ini
// beserta relasi locates-nya.
function Edit({ desktopLocations = [], mobileLocations = [], ads, selectedDesktopLocate, selectedMobileLocate }) {
    const { data, setData, post, processing, errors } = useForm({
        // PENTING: Gunakan _method spoofing untuk support multipart/form-data di update
        _method: 'PUT',
        title: ads.title || '',
        datestart: ads.datestart || '',
        dateend: ads.dateend || '',
        url: ads.url || '',
        cpc: ads.cpc || '',
        cost: ads.cost || '',
        status: String(ads.is_status ?? '1'),

        // --- STATE DESKTOP ---
        d_img: null,
        locate_desktop: selectedDesktopLocate, // Langsung gunakan dari Backend

        // --- STATE MOBILE ---
        m_img: null,
        locate_mobile: selectedMobileLocate, // Langsung gunakan dari Backend
    });

    const desktopOptions = useMemo(() => desktopLocations.map(loc => ({
        value: loc.id,
        label: `${loc.name} (${loc.width}x${loc.height})`,
        width: loc.width,
        height: loc.height
    })), [desktopLocations]);

    const mobileOptions = useMemo(() => mobileLocations.map(loc => ({
        value: loc.id,
        label: `${loc.name} (${loc.width}x${loc.height})`,
        width: loc.width,
        height: loc.height
    })), [mobileLocations]);

    const activeDesktopDim = useMemo(() => {
        if (!data.locate_desktop) return { width: 0, height: 0, label: 'Pilih Lokasi Desktop Terlebih Dahulu' };
        const selected = desktopOptions.find(opt => opt.value === data.locate_desktop);
        return selected ? { width: selected.width, height: selected.height, label: `Ukuran Wajib: ${selected.width}x${selected.height}` } : null;
    }, [data.locate_desktop, desktopOptions]);

    const activeMobileDim = useMemo(() => {
        if (!data.locate_mobile) return { width: 0, height: 0, label: 'Pilih Lokasi Mobile Terlebih Dahulu' };
        const selected = mobileOptions.find(opt => opt.value === data.locate_mobile);
        return selected ? { width: selected.width, height: selected.height, label: `Ukuran Wajib: ${selected.width}x${selected.height}` } : null;
    }, [data.locate_mobile, mobileOptions]);

    const submit = (e) => {
        e.preventDefault();
        // Gunakan fungsi post(), Laravel akan membacanya sebagai PUT karena _method: 'PUT'
        post(route('admin.nasional.ads.update', ads.id));
    };

    // Helper untuk default value react-select
    const defaultDesktopOption = desktopOptions.find(opt => opt.value === data.locate_desktop) || null;
    const defaultMobileOption = mobileOptions.find(opt => opt.value === data.locate_mobile) || null;

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Campaign Iklan: ${ads.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        <div className='flex justify-between items-center'>
                            <h1 className="text-3xl font-bold text-foreground">Edit Iklan</h1>
                        </div>

                        <form onSubmit={submit} className='space-y-6'>

                            {/* --- KARTU INFORMASI DASAR --- */}
                            <Card>
                                <div className='grid grid-cols-1 lg:grid-cols-6 gap-6'>
                                    {/* Kolom Input Sama Seperti di Create */}
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
                                            options={[{ label: "Aktif", value: "1" }, { label: "Tidak Aktif", value: "0" }]}
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
                                        <div className='w-full'>
                                            <InputLabel value="Cari & Pilih Lokasi Desktop" className='mb-2 font-bold' />
                                            <Select
                                                options={desktopOptions}
                                                defaultValue={defaultDesktopOption}
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isClearable={true}
                                                placeholder="Ketik untuk mencari lokasi..."
                                                onChange={(selected) => setData('locate_desktop', selected ? selected.value : '')}
                                            />
                                            <InputError message={errors.locate_desktop} className="mt-2" />
                                        </div>

                                        <div className='w-full bg-slate-50 p-4 rounded border'>
                                            {/* Preview Gambar Lama jika ada dan file baru belum di-upload */}
                                            {ads.d_img && !data.d_img && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-500 mb-2">Gambar Saat Ini:</p>
                                                    <img src={ads.d_img} alt="Desktop Preview" className="max-w-full h-auto rounded border" />
                                                </div>
                                            )}

                                            <InputAdsImage
                                                label={ads.d_img ? `${activeDesktopDim.label} (Opsional - Upload untuk mengganti)` : activeDesktopDim.label}
                                                value={data.d_img}
                                                onChange={(file) => setData('d_img', file)}
                                                targetWidth={activeDesktopDim.width}
                                                targetHeight={activeDesktopDim.height}
                                            />
                                            <InputError message={errors.d_img} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* --- KELOMPOK MOBILE --- */}
                                <Card>
                                    <h2 className="text-xl font-bold mb-4 text-green-600 border-b pb-2">Platform Mobile</h2>
                                    <div className='space-y-6'>
                                        <div className='w-full'>
                                            <InputLabel value="Cari & Pilih Lokasi Mobile" className='mb-2 font-bold' />
                                            <Select
                                                options={mobileOptions}
                                                defaultValue={defaultMobileOption}
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isClearable={true}
                                                placeholder="Ketik untuk mencari lokasi..."
                                                onChange={(selected) => setData('locate_mobile', selected ? selected.value : '')}
                                            />
                                            <InputError message={errors.locate_mobile} className="mt-2" />
                                        </div>

                                        <div className='w-full bg-slate-50 p-4 rounded border'>
                                            {ads.m_img && !data.m_img && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-500 mb-2">Gambar Saat Ini:</p>
                                                    <img src={ads.m_img} alt="Mobile Preview" className="max-w-full h-auto rounded border" />
                                                </div>
                                            )}

                                            <InputAdsImage
                                                label={ads.m_img ? `${activeMobileDim.label} (Opsional - Upload untuk mengganti)` : activeMobileDim.label}
                                                value={data.m_img}
                                                onChange={(file) => setData('m_img', file)}
                                                targetWidth={activeMobileDim.width}
                                                targetHeight={activeMobileDim.height}
                                            />
                                            <InputError message={errors.m_img} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className='flex justify-end mt-4'>
                                <button
                                    type="submit"
                                    className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                                    disabled={processing}
                                >
                                    {processing ? 'Memperbarui...' : 'Perbarui Iklan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Edit