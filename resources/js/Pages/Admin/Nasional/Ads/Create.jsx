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
        locate_desktop: '', // Berubah dari [] menjadi string kosong
        
        // --- STATE MOBILE ---
        m_img: null,
        locate_mobile: '',  // Berubah dari [] menjadi string kosong
    });

    // 💡 HELPER: Transformasi data dari Database untuk React-Select
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

    // 💡 HELPER: Ambil dimensi secara dinamis dari lokasi yang dipilih
    const activeDesktopDim = useMemo(() => {
        // Jika belum ada yang dipilih (state kosong), kembalikan nilai default
        if (!data.locate_desktop) return { width: 0, height: 0, label: 'Pilih Lokasi Desktop Terlebih Dahulu' };
        
        // Cari opsi yang ID-nya sama persis dengan state
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
        post(route('admin.nasional.ads.store'));
    };

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
                                    {/* Kolom Input Standard */}
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
                                        
                                        <div className='w-full'>
                                            <InputLabel value="Cari & Pilih Lokasi Desktop" className='mb-2 font-bold' />
                                            <Select
                                                // isMulti dihilangkan
                                                options={desktopOptions}
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isClearable={true} // Opsional: Tambahkan fitur hapus pilihan (tanda silang)
                                                placeholder="Ketik untuk mencari lokasi..."
                                                // Jika 'selected' null (karena dihapus), simpan string kosong
                                                onChange={(selected) => setData('locate_desktop', selected ? selected.value : '')}
                                            />
                                            <InputError message={errors.locate_desktop} className="mt-2" />
                                        </div>

                                        {/* Komponen Gambar */}
                                        <div className='w-full bg-slate-50 p-4 rounded border'>
                                            <InputAdsImage
                                                label={activeDesktopDim.label}
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
                                                // isMulti dihilangkan
                                                options={mobileOptions}
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isClearable={true}
                                                placeholder="Ketik untuk mencari lokasi..."
                                                onChange={(selected) => setData('locate_mobile', selected ? selected.value : '')}
                                            />
                                            <InputError message={errors.locate_mobile} className="mt-2" />
                                        </div>

                                        {/* Komponen Gambar */}
                                        <div className='w-full bg-slate-50 p-4 rounded border'>
                                            <InputAdsImage
                                                label={activeMobileDim.label}
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