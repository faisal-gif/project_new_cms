import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputPhoneNumber from '@/Components/InputPhoneNumber'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React, { useState, useEffect } from 'react'
import Select from "react-select";

function Edit({ paket, writer }) {
    // 1. Inisialisasi State Custom Mode berdasarkan data paket existing
    // Cari paket yang saat ini dimiliki user, cek apakah kuotanya null
    const existingPackage = paket?.find(p => p.id === writer.package_id);
    const initialCustomMode = existingPackage ? existingPackage.quota === null : false;

    const [isCustomMode, setIsCustomMode] = useState(initialCustomMode);

    // 2. Mapping Data dari Database (writer) ke State Form
    const { data, setData, put, processing, errors } = useForm({
        name: writer.nama || '',               // DB: nama -> Form: name
        email: writer.email || '',
        password: '',                          // Dikosongkan, hanya diisi jika ingin diubah
        status: String(writer.status ?? '1'),  // Pastikan format string untuk select option
        instansi: writer.instansi || '',
        kategori: writer.kategori || '',
        phone: writer.contact || '',           // DB: contact -> Form: phone
        provinsi: writer.prov || '',           // DB: prov -> Form: provinsi
        kota: writer.city || '',               // DB: city -> Form: kota
        alamat: writer.address || '',          // DB: address -> Form: alamat
        paket_berita: writer.package_id || null, // DB: package_id -> Form: paket_berita
        quota_news: writer.quota_news || '',
        date_exp: writer.dateexp ? writer.dateexp.split('T')[0] : '', // Format YYYY-MM-DD
    });

    // 3. Format Data Options untuk react-select
    const paketOptions = paket ? paket.map(p => ({
        value: p.id,
        label: p.quota === null
            ? `⭐ ${p.name} (Input Manual)`
            : `${p.name} (Kuota: ${p.quota} | Masa Aktif: ${p.period} ${p.jenis_periode})`,
        paketDetail: p
    })) : [];

    // Cari option yang sedang terpilih agar react-select menampilkan nilai default
    const selectedPaketOption = paketOptions.find(option => option.value === data.paket_berita) || null;

    // 4. Logika Reactive Paket (Sama seperti Create)
    const handlePaketChange = (selectedOption) => {
        if (!selectedOption) {
            setIsCustomMode(false);
            setData(prevData => ({ ...prevData, paket_berita: null, quota_news: '', date_exp: '' }));
            return;
        }

        const pkg = selectedOption.paketDetail;

        if (pkg.quota === null) {
            setIsCustomMode(true);
            setData(prevData => ({
                ...prevData,
                paket_berita: selectedOption.value,
                quota_news: '',
                date_exp: ''
            }));
        } else {
            setIsCustomMode(false);
            let expDate = new Date();

            if (pkg.jenis_periode && pkg.period) {
                switch (pkg.jenis_periode.toLowerCase()) {
                    case 'hari': expDate.setDate(expDate.getDate() + pkg.period); break;
                    case 'minggu': expDate.setDate(expDate.getDate() + (pkg.period * 7)); break;
                    case 'bulan': expDate.setMonth(expDate.getMonth() + pkg.period); break;
                    case 'tahun': expDate.setFullYear(expDate.getFullYear() + pkg.period); break;
                    default: break;
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

    // 5. Submit Form menggunakan method PUT (Inertia best practice untuk update)
    const submit = (e) => {
        e.preventDefault();
        // Mengarahkan ke route update dengan menyertakan ID writer
        put(route('admin.kopi-times.writer.update', writer.id));
    };

    return (
        <>
            <Head title={`Edit Penulis Kopi Times - ${writer.nama}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Penulis Kopi Times</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Kopi Times</li>
                                        <li>Penulis</li>
                                        <li>Edit Penulis</li>
                                    </ul>
                                </div>
                            </div>

                            <form onSubmit={submit} className='space-y-8'>
                                {/* SECTION 1: INFORMASI AKUN */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informasi Akun</h2>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="name" value="Nama Lengkap" className='mb-2 font-bold' />
                                                <TextInput id="name" name="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" autoComplete="name" />
                                                <InputError message={errors.nama} className="mt-2" /> {/* Sesuaikan dengan error key dari backend jika backend merespon 'nama' */}
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="email" value="Email" className='mb-2 font-bold' />
                                                <TextInput id="email" name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 block w-full" autoComplete="email" />
                                                <InputError message={errors.email} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="password" value="Password (Kosongkan jika tidak diubah)" className='mb-2 font-bold' />
                                                <InputPassword id="password" name="password" value={data.password} placeholder="••••••••" className="mt-1 w-full" autoComplete="new-password" onChange={(e) => setData('password', e.target.value)} />
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
                                                <InputError message={errors.contact} className="mt-2" /> {/* Catatan: error key biasanya mengikuti nama field DB 'contact' */}
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="provinsi" value="Provinsi" className='mb-2 font-bold' />
                                                <TextInput id="provinsi" name="provinsi" type="text" value={data.provinsi} onChange={(e) => setData('provinsi', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.prov} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="kota" value="Kota" className='mb-2 font-bold' />
                                                <TextInput id="kota" name="kota" type="text" value={data.kota} onChange={(e) => setData('kota', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.city} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-6">
                                                <InputLabel htmlFor="alamat" value="Alamat Lengkap" className='mb-2 font-bold' />
                                                <TextInput id="alamat" name="alamat" type="text" value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.address} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-6 w-full">
                                                <InputLabel htmlFor="paket_berita" value="Pilih Paket Berita" className='mb-2 font-bold text-blue-600' />
                                                <Select
                                                    id="paket_berita"
                                                    value={selectedPaketOption} // <-- SANGAT PENTING untuk Form Edit
                                                    options={paketOptions}
                                                    isClearable
                                                    placeholder="-- Cari dan Pilih Paket --"
                                                    onChange={handlePaketChange}
                                                    className="mt-1"
                                                />
                                                <InputError message={errors.package_id} className="mt-2" />
                                            </div>

                                            {/* Field Quota News */}
                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="quota_news" value={isCustomMode ? "Quota News (Manual)" : "Quota News (Otomatis)"} className='mb-2 font-bold text-gray-700' />
                                                <TextInput
                                                    id="quota_news"
                                                    type="number"
                                                    value={data.quota_news}
                                                    onChange={(e) => setData('quota_news', e.target.value)}
                                                    readOnly={!isCustomMode}
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
                                                    readOnly={!isCustomMode}
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
                                        Perbarui Data Penulis
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