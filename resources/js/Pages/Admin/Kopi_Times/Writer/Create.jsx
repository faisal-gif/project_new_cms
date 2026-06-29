import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputPhoneNumber from '@/Components/InputPhoneNumber'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React, { useState } from 'react'
import Select from "react-select";

function Create({ paket }) {
    const [isCustomMode, setIsCustomMode] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        status: '1',
        instansi: '',
        kategori: '',
        phone: '',
        provinsi: '',
        kota: '',
        alamat: '',
        paket_berita: null,
        quota_news: '',
        date_exp: '',
    });

    // 1. Format data Paket Berita (Sesuaikan label jika paket custom/null)
    const paketOptions = paket ? paket.map(paket => ({
        value: paket.id,
        // Jika kuota null, tampilkan label berbeda
        label: paket.quota === null
            ? `⭐ ${paket.name} (Input Manual)`
            : `${paket.name} (Kuota: ${paket.quota} | Masa Aktif: ${paket.period} ${paket.jenis_periode})`,
        paketDetail: paket
    })) : [];

    // 2. Logika Reactive: Hitung preview ATAU buka form
    const handlePaketChange = (selectedOption) => {
        if (!selectedOption) {
            setIsCustomMode(false);
            setData(prevData => ({ ...prevData, paket_berita: null, quota_news: '', date_exp: '' }));
            return;
        }

        const pkg = selectedOption.paketDetail;

        // Cek apakah ini paket "Custom" (mengandalkan quota yang bernilai null)
        if (pkg.quota === null) {
            setIsCustomMode(true); // Buka kunci input
            setData(prevData => ({
                ...prevData,
                paket_berita: selectedOption.value,
                quota_news: '', // Kosongkan agar bisa diisi manual
                date_exp: ''    // Kosongkan agar bisa diisi manual
            }));
        } else {
            setIsCustomMode(false); // Kunci kembali input
            let expDate = new Date();

            // Kalkulasi tanggal
            if (pkg.jenis_periode && pkg.period) {
                switch (pkg.jenis_periode.toLowerCase()) {
                    case 'hari':
                        expDate.setDate(expDate.getDate() + pkg.period);
                        break;
                    case 'minggu':
                        expDate.setDate(expDate.getDate() + (pkg.period * 7));
                        break;
                    case 'bulan':
                        expDate.setMonth(expDate.getMonth() + pkg.period);
                        break;
                    case 'tahun':
                        expDate.setFullYear(expDate.getFullYear() + pkg.period);
                        break;
                    default:
                        break;
                }
            }

            setData(prevData => ({
                ...prevData,
                paket_berita: selectedOption.value,
                quota_news: pkg.quota,
                date_exp: expDate.toISOString().split('T')[0]
            }));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.kopi-times.writer.store'));
    };

    return (
        <>
            <Head title="Tambah Penulis Kopi Times" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Penulis Kopi Times</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Kopi Times</li>
                                        <li>Penulis</li>
                                        <li>Tambah Penulis</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}
                            </div>

                            {/* START: Main Form */}

                            <form onSubmit={submit} className='space-y-8'>
                                {/* SECTION 1: INFORMASI AKUN */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informasi Akun</h2>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="name" value="Nama Lengkap" className='mb-2 font-bold' />
                                                <TextInput id="name" name="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" autoComplete="name" />
                                                <InputError message={errors.name} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="email" value="Email" className='mb-2 font-bold' />
                                                <TextInput id="email" name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 block w-full" autoComplete="email" />
                                                <InputError message={errors.email} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="password" value="Password" className='mb-2 font-bold' />
                                                <InputPassword id="password" name="password" value={data.password} className="mt-1 w-full" autoComplete="new-password" onChange={(e) => setData('password', e.target.value)} />
                                                <InputError message={errors.password} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3 w-full">
                                                <InputLabel htmlFor="status" value="Status" className='mb-2 font-bold' />
                                                <InputSelect id="status" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1" options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]} />
                                                <InputError message={errors.status} className="mt-2" />
                                            </div>

                                        </div>
                                    </div>
                                </Card>
                                {/* SECTION 2: INFORMASI DETAIL */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informasi Detail</h2>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="instansi" value="Instansi" className='mb-2 font-bold' />
                                                <TextInput id="instansi" name="instansi" type="text" value={data.instansi} onChange={(e) => setData('instansi', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.instansi} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3 w-full">
                                                <InputLabel htmlFor="kategori" value="kategori" className='mb-2 font-bold' />
                                                <InputSelect id="kategori"
                                                    value={data.kategori}
                                                    onChange={(e) => setData('kategori', e.target.value)} className="mt-1"
                                                    options={[
                                                        { label: "Praktisi", value: "38" },
                                                        { label: "Dosen", value: "39" },
                                                        { label: "Guru", value: "40" },
                                                        { label: "Mahasiswa", value: "41" },
                                                    ]} />
                                                <InputError message={errors.kategori} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="phone" value="No Tlp/Hp" className='mb-2 font-bold' />
                                                <InputPhoneNumber id="phone" name="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.phone} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="provinsi" value="Provinsi" className='mb-2 font-bold' />
                                                <TextInput id="provinsi" name="provinsi" type="text" value={data.provinsi} onChange={(e) => setData('provinsi', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.provinsi} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="kota" value="Kota" className='mb-2 font-bold' />
                                                <TextInput id="kota" name="kota" type="text" value={data.kota} onChange={(e) => setData('kota', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.kota} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-6">
                                                <InputLabel htmlFor="alamat" value="Alamat Lengkap" className='mb-2 font-bold' />
                                                <TextInput id="alamat" name="alamat" type="text" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.alamat} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-6 w-full">
                                                <InputLabel htmlFor="paket_berita" value="Pilih Paket Berita" className='mb-2 font-bold text-blue-600' />
                                                <Select
                                                    id="paket_berita"
                                                    options={paketOptions}
                                                    isClearable
                                                    placeholder="-- Cari dan Pilih Paket --"
                                                    onChange={handlePaketChange}
                                                    className="mt-1"
                                                />
                                                <InputError message={errors.paket_berita} className="mt-2" />
                                            </div>

                                            {/* Field Quota News */}
                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="quota_news" value={isCustomMode ? "Quota News (Manual)" : "Quota News (Otomatis)"} className='mb-2 font-bold text-gray-700' />
                                                <TextInput
                                                    id="quota_news"
                                                    type="number"
                                                    value={data.quota_news}
                                                    onChange={(e) => setData('quota_news', e.target.value)}
                                                    readOnly={!isCustomMode} // <-- Kunci jika BUKAN mode custom
                                                    className={`mt-1 block w-full transition-all ${!isCustomMode ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500' : 'bg-white border-blue-400 ring-1 ring-blue-200'}`}
                                                    placeholder={isCustomMode ? "Ketik jumlah kuota..." : "Terisi otomatis..."}
                                                />
                                                <InputError message={errors.quota_news} className="mt-2" />
                                            </div>

                                            {/* Field Date Expired */}
                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="date_exp" value={isCustomMode ? "Tanggal Kadaluarsa (Manual)" : "Tanggal Kadaluarsa (Otomatis)"} className='mb-2 font-bold text-gray-700' />
                                                <TextInput
                                                    id="date_exp"
                                                    type="date"
                                                    value={data.date_exp}
                                                    onChange={(e) => setData('date_exp', e.target.value)}
                                                    readOnly={!isCustomMode} // <-- Kunci jika BUKAN mode custom
                                                    className={`mt-1 block w-full transition-all ${!isCustomMode ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500' : 'bg-white border-blue-400 ring-1 ring-blue-200'}`}
                                                />
                                                <InputError message={errors.date_exp} className="mt-2" />
                                            </div>

                                        </div>
                                    </div>
                                </Card>
                                {/* Action Buttons */}
                                <div className='flex flex-row justify-end mt-8 pt-4'>
                                    <button type="submit" className="btn btn-primary px-8" disabled={processing}>
                                        Simpan Data Penulis
                                    </button>
                                </div>
                            </form>

                            {/* END: Main Form */}

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout >
        </>
    )
}

export default Create