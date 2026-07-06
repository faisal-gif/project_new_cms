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
    // 1. Inisialisasi State Custom Mode
    const existingPackage = paket?.find(p => p.id === writer.package_id);
    const initialCustomMode = existingPackage ? existingPackage.quota === null : false;
    
    const [isCustomMode, setIsCustomMode] = useState(initialCustomMode);

    // 2. Mapping Data ke State Form
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
        
        // Flag baru untuk menentukan apakah paket ikut diupdate atau tidak
        is_update_package: false, 
        
        paket_berita: writer.package_id || null,
        quota_news: writer.quota_news || '',
        date_exp: writer.dateexp ? writer.dateexp.split('T')[0] : '', 
    });

    // 3. Format Data Options
    const paketOptions = paket ? paket.map(p => ({
        value: p.id,
        label: p.quota === null
            ? `⭐ ${p.name} (Input Manual)`
            : `${p.name} (Kuota: ${p.quota} | Masa Aktif: ${p.period} ${p.jenis_periode})`,
        paketDetail: p
    })) : [];

    const selectedPaketOption = paketOptions.find(option => option.value === data.paket_berita) || null;

    // 4. Logika Handle Toggle Update Paket
    const handleToggleUpdatePackage = (e) => {
        const isChecked = e.target.checked;
        setData('is_update_package', isChecked);
        
        // Jika batal update paket, kembalikan state ke data original dari database
        if (!isChecked) {
            setData(prevData => ({
                ...prevData,
                paket_berita: writer.package_id || null,
                quota_news: writer.quota_news || '',
                date_exp: writer.dateexp ? writer.dateexp.split('T')[0] : '',
                is_update_package: false
            }));
            setIsCustomMode(initialCustomMode);
        }
    };

    // 5. Logika Reactive Paket (Kalkulasi)
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

    // 6. Submit Form
    const submit = (e) => {
        e.preventDefault();
        put(route('admin.ajp.writer.update', writer.id));
    };

    return (
        <>
            <Head title={`Edit Penulis - ${writer.nama}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div><h1 className="text-3xl font-bold text-foreground">Edit Penulis AJP</h1></div>
                            </div>

                            <form onSubmit={submit} className='space-y-8'>
                                {/* SECTION 1: INFORMASI AKUN (Sama seperti kode Anda) */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informasi Akun</h2>
                                        {/* ... (Isi grid input akun sama persis dengan milik Anda) ... */}
                                    </div>
                                </Card>

                                {/* SECTION 2: INFORMASI DETAIL & PAKET */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informasi Detail</h2>
                                        
                                        {/* ... (Isi input instansi, phone, provinsi, kota, alamat sama persis) ... */}

                                        <div className="mt-8 border-t pt-6">
                                            {/* CHECKBOX: Opsi mau update paket atau tidak */}
                                            <div className="flex items-center mb-6">
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

                                            <div className={`grid grid-cols-1 lg:grid-cols-6 gap-4 transition-opacity duration-300 ${!data.is_update_package ? 'opacity-50 pointer-events-none grayscale-[30%]' : 'opacity-100'}`}>
                                                
                                                <div className="lg:col-span-6 w-full">
                                                    <InputLabel htmlFor="paket_berita" value="Pilih Paket Berita" className='mb-2 font-bold text-blue-600' />
                                                    <Select
                                                        id="paket_berita"
                                                        value={selectedPaketOption}
                                                        options={paketOptions}
                                                        isDisabled={!data.is_update_package} // Kunci select jika tidak dicentang
                                                        isClearable
                                                        placeholder="-- Cari dan Pilih Paket --"
                                                        onChange={handlePaketChange}
                                                        className="mt-1"
                                                    />
                                                    <InputError message={errors.package_id} className="mt-2" />
                                                </div>

                                                <div className="lg:col-span-3">
                                                    <InputLabel htmlFor="quota_news" value={isCustomMode ? "Quota News (Manual)" : "Quota News (Otomatis)"} className='mb-2 font-bold text-gray-700' />
                                                    <TextInput
                                                        id="quota_news"
                                                        type="number"
                                                        value={data.quota_news}
                                                        onChange={(e) => setData('quota_news', e.target.value)}
                                                        readOnly={!isCustomMode || !data.is_update_package}
                                                        className={`mt-1 block w-full transition-all ${(!isCustomMode || !data.is_update_package) ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500' : 'bg-white border-blue-400 ring-1 ring-blue-200'}`}
                                                    />
                                                    <InputError message={errors.quota_news} className="mt-2" />
                                                </div>

                                                <div className="lg:col-span-3">
                                                    <InputLabel htmlFor="date_exp" value={isCustomMode ? "Tanggal Kadaluarsa (Manual)" : "Tanggal Kadaluarsa (Otomatis)"} className='mb-2 font-bold text-gray-700' />
                                                    <TextInput
                                                        id="date_exp"
                                                        type="date"
                                                        value={data.date_exp}
                                                        onChange={(e) => setData('date_exp', e.target.value)}
                                                        readOnly={!isCustomMode || !data.is_update_package}
                                                        className={`mt-1 block w-full transition-all ${(!isCustomMode || !data.is_update_package) ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500' : 'bg-white border-blue-400 ring-1 ring-blue-200'}`}
                                                    />
                                                    <InputError message={errors.date_exp} className="mt-2" />
                                                </div>
                                            </div>
                                            {!data.is_update_package && (
                                                <p className="text-sm text-amber-600 mt-2 italic">* Data paket, kuota, dan tanggal kadaluarsa saat ini menggunakan data lama. Centang kotak di atas jika ingin mereset/mengubahnya.</p>
                                            )}
                                        </div>
                                    </div>
                                </Card>

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