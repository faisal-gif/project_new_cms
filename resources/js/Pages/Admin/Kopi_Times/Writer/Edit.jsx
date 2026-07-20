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

export default function Edit({ paket, writer }) {
    // 1. Inisialisasi State & Referensi Data Lama
    const existingPackage = paket?.find(p => p.id === writer.package_id);
    const initialCustomMode = existingPackage ? existingPackage.quota === null : false;

    const [isCustomMode, setIsCustomMode] = useState(initialCustomMode);
    const [selectedPackageData, setSelectedPackageData] = useState(existingPackage || null);

    // 2. State Form menggunakan useForm Inertia
    const { data, setData, put, processing, errors } = useForm({
        name: writer.nama || '',
        email: writer.email || '',
        password: '',
        status: String(writer.status ?? '1'),
        instansi: writer.instansi || '',
        phone: writer.contact || '',
        provinsi: writer.prov || '',
        kota: writer.city || '',
        alamat: writer.address || '',
        kategori: writer.kategori || '',

        // Flag Kontrol Paket
        is_update_package: false,
        is_accumulate: false, // Flag baru untuk meneruskan kuota & masa aktif

        paket_berita: writer.package_id || null,
        quota_news: writer.quota_news || '',
        date_exp: writer.dateexp ? writer.dateexp.split('T')[0] : '',
    });

    // 3. Format Options untuk react-select
    const paketOptions = paket ? paket.map(p => ({
        value: p.id,
        label: p.quota === null
            ? `⭐ ${p.name} (Input Manual)`
            : `${p.name} (Kuota: ${p.quota} | Masa Aktif: ${p.period} ${p.jenis_periode})`,
        paketDetail: p
    })) : [];

    const selectedPaketOption = paketOptions.find(option => option.value === data.paket_berita) || null;

    // 4. Fungsi Helper: Kalkulasi Tanggal Kadaluarsa
    const calculateExpDate = (baseDate, period, jenis_periode) => {
        let expDate = new Date(baseDate);
        if (jenis_periode && period) {
            switch (jenis_periode.toLowerCase()) {
                case 'hari': expDate.setDate(expDate.getDate() + period); break;
                case 'minggu': expDate.setDate(expDate.getDate() + (period * 7)); break;
                case 'bulan': expDate.setMonth(expDate.getMonth() + period); break;
                case 'tahun': expDate.setFullYear(expDate.getFullYear() + period); break;
                default: break;
            }
        }
        return expDate.toISOString().split('T')[0];
    };

    // 5. Fungsi Inti: Eksekusi Perhitungan Kuota & Tanggal
    const processPackageCalculation = (pkg, isAccumulateOn) => {
        if (!pkg) return;

        if (pkg.quota === null) {
            // Mode Manual
            setIsCustomMode(true);
            setData(prev => ({
                ...prev,
                paket_berita: pkg.id,
                quota_news: isAccumulateOn ? writer.quota_news : '',
                date_exp: isAccumulateOn && writer.dateexp ? writer.dateexp.split('T')[0] : ''
            }));
        } else {
            // Mode Otomatis
            setIsCustomMode(false);

            // Logika Akumulasi Kuota
            const oldQuota = Number(writer.quota_news) || 0;
            const newQuotaValue = isAccumulateOn ? oldQuota + Number(pkg.quota) : Number(pkg.quota);

            // Logika Akumulasi Tanggal
            let baseDateForCalculation = new Date(); // Default: Hari ini
            if (isAccumulateOn && writer.dateexp) {
                const oldExpDate = new Date(writer.dateexp);
                // Hanya gunakan tanggal lama sebagai base JIKA tanggal lama belum lewat hari ini
                if (oldExpDate > baseDateForCalculation) {
                    baseDateForCalculation = oldExpDate;
                }
            }

            const newExpDateStr = calculateExpDate(baseDateForCalculation, pkg.period, pkg.jenis_periode);

            setData(prev => ({
                ...prev,
                paket_berita: pkg.id,
                quota_news: newQuotaValue,
                date_exp: newExpDateStr
            }));
        }
    };

    // 6. Handle Perubahan Checkbox Utama (Update Paket)
    const handleToggleUpdatePackage = (e) => {
        const isChecked = e.target.checked;

        if (!isChecked) {
            // Reset ke data original dari DB
            setData(prev => ({
                ...prev,
                is_update_package: false,
                is_accumulate: false,
                paket_berita: writer.package_id || null,
                quota_news: writer.quota_news || '',
                date_exp: writer.dateexp ? writer.dateexp.split('T')[0] : ''
            }));
            setIsCustomMode(initialCustomMode);
            setSelectedPackageData(existingPackage);
        } else {
            // Aktifkan mode update, pertahankan pilihan paket yang ada di form
            setData('is_update_package', true);
            if (selectedPackageData) {
                processPackageCalculation(selectedPackageData, data.is_accumulate);
            }
        }
    };

    // 7. Handle Perubahan Checkbox Akumulasi (Meneruskan)
    const handleToggleAccumulate = (e) => {
        const isChecked = e.target.checked;
        setData('is_accumulate', isChecked);

        // Kalkulasi ulang data paket yang sedang terpilih berdasarkan status akumulasi baru
        if (selectedPackageData) {
            processPackageCalculation(selectedPackageData, isChecked);
        }
    };

    // 8. Handle Perubahan Pilihan Select Paket
    const handlePaketChange = (selectedOption) => {
        if (!selectedOption) {
            setSelectedPackageData(null);
            setIsCustomMode(false);
            setData(prev => ({ ...prev, paket_berita: null, quota_news: '', date_exp: '' }));
            return;
        }

        const pkg = selectedOption.paketDetail;
        setSelectedPackageData(pkg);
        processPackageCalculation(pkg, data.is_accumulate);
    };

    // 9. Submit
    const submit = (e) => {
        e.preventDefault();
        // Inertia mengirimkan data.is_update_package & data.is_accumulate secara otomatis
        put(route('admin.kopi-times.writer.update', writer.id));
    };

    return (
        <>
            <Head title={`Edit Penulis - ${writer.nama}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">

                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div><h1 className="text-3xl font-bold text-foreground">Edit Penulis Kopi Times</h1></div>
                            </div>

                            <form onSubmit={submit} className='space-y-8'>
                                {/* --- SECTION 1: INFORMASI AKUN --- */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informasi Akun</h2>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="name" value="Nama Lengkap" className='mb-2 font-bold' />
                                                <TextInput id="name" name="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.nama} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="email" value="Email" className='mb-2 font-bold' />
                                                <TextInput id="email" name="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.email} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel htmlFor="password" value="Password (Kosongkan jika tidak diubah)" className='mb-2 font-bold' />
                                                <InputPassword id="password" name="password" autoComplete="new-password" value={data.password} placeholder="••••••••" className="mt-1 w-full" onChange={(e) => setData('password', e.target.value)} />
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

                                {/* --- SECTION 2: INFORMASI DETAIL & PAKET --- */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informasi Detail</h2>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="instansi" value="Instansi" className='mb-2 font-bold' />
                                                <TextInput id="instansi" name="instansi" type="text" value={data.instansi} onChange={(e) => setData('instansi', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.instansi} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="phone" value="No Tlp/Hp" className='mb-2 font-bold' />
                                                <InputPhoneNumber id="phone" name="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1 block w-full" />
                                                <InputError message={errors.contact} className="mt-2" />
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
                                        </div>

                                        {/* --- AREA MANAJEMEN PAKET --- */}
                                        <div className="mt-8 border-t border-gray-200 pt-6">

                                            {/* CHECKBOX 1: Update Paket Master Switch */}
                                            <div className="flex items-center mb-2">
                                                <input
                                                    type="checkbox"
                                                    id="is_update_package"
                                                    checked={data.is_update_package}
                                                    onChange={handleToggleUpdatePackage}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                                                />
                                                <label htmlFor="is_update_package" className="ml-3 text-lg font-bold text-gray-800 cursor-pointer select-none">
                                                    Perbarui Paket & Kuota?
                                                </label>
                                            </div>

                                            {/* CHECKBOX 2: Meneruskan/Akumulasi (Hanya muncul jika Checkbox 1 aktif) */}
                                            <div className={`flex items-center mb-6 pl-8 transition-all duration-300 ${data.is_update_package ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
                                                <input
                                                    type="checkbox"
                                                    id="is_accumulate"
                                                    checked={data.is_accumulate}
                                                    onChange={handleToggleAccumulate}
                                                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                                />
                                                <label htmlFor="is_accumulate" className="ml-2 text-sm font-semibold text-gray-600 cursor-pointer select-none">
                                                    Teruskan Kuota & Masa Aktif dari paket sebelumnya (Akumulasi)
                                                </label>
                                            </div>

                                            <div className={`grid grid-cols-1 lg:grid-cols-6 gap-4 transition-opacity duration-300 ${!data.is_update_package ? 'opacity-50 pointer-events-none grayscale-[30%]' : 'opacity-100'}`}>

                                                <div className="lg:col-span-6 w-full">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <InputLabel htmlFor="paket_berita" value="Pilih Paket Berita" className='font-bold text-blue-600' />

                                                        {/* Indikator Kuota Lama (Visual Bantuan) */}
                                                        {data.is_update_package && (
                                                            <span className="text-xs font-semibold text-gray-500">
                                                                Sisa Kuota Saat Ini: {writer.quota_news || 0}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Select
                                                        id="paket_berita"
                                                        value={selectedPaketOption}
                                                        options={paketOptions}
                                                        isDisabled={!data.is_update_package}
                                                        isClearable
                                                        placeholder="-- Cari dan Pilih Paket --"
                                                        onChange={handlePaketChange}
                                                        className="mt-1"
                                                    />
                                                    <InputError message={errors.package_id} className="mt-2" />
                                                </div>

                                                <div className="lg:col-span-3">
                                                    <InputLabel htmlFor="quota_news" value={isCustomMode ? "Quota News (Manual)" : "Quota News (Terhitung)"} className='mb-2 font-bold text-gray-700' />
                                                    <TextInput
                                                        id="quota_news"
                                                        type="number"
                                                        value={data.quota_news}
                                                        onChange={(e) => setData('quota_news', e.target.value)}
                                                        readOnly={!isCustomMode || !data.is_update_package}
                                                        className={`mt-1 block w-full transition-all ${(!isCustomMode || !data.is_update_package) ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500 font-bold' : 'bg-white border-blue-400 ring-1 ring-blue-200'}`}
                                                    />
                                                    <InputError message={errors.quota_news} className="mt-2" />
                                                </div>

                                                <div className="lg:col-span-3">
                                                    <InputLabel htmlFor="date_exp" value={isCustomMode ? "Tanggal Kadaluarsa (Manual)" : "Tanggal Kadaluarsa (Terhitung)"} className='mb-2 font-bold text-gray-700' />
                                                    <TextInput
                                                        id="date_exp"
                                                        type="date"
                                                        value={data.date_exp}
                                                        onChange={(e) => setData('date_exp', e.target.value)}
                                                        readOnly={!isCustomMode || !data.is_update_package}
                                                        className={`mt-1 block w-full transition-all ${(!isCustomMode || !data.is_update_package) ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500 font-bold' : 'bg-white border-blue-400 ring-1 ring-blue-200'}`}
                                                    />
                                                    <InputError message={errors.date_exp} className="mt-2" />
                                                </div>
                                            </div>

                                            {!data.is_update_package && (
                                                <p className="text-sm text-amber-600 mt-3 font-medium bg-amber-50 p-2 rounded border border-amber-100">
                                                    💡 Data paket, kuota, dan tanggal kadaluarsa dikunci untuk mencegah perubahan tidak disengaja. Centang kotak <b>"Perbarui Paket"</b> di atas jika ingin memodifikasinya.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-8 pt-4'>
                                    <button type="submit" className="btn btn-primary px-8 shadow-lg" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Perbarui Data Penulis'}
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