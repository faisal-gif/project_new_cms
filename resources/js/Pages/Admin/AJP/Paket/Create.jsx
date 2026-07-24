import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputSelect from '@/Components/InputSelect'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

function Create() {
    const [isCustomQuota, setIsCustomQuota] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        feature: '',
        quota: '',
        feed_instagram: '',
        ekoran: '',
        wa_channel: '',
        price: '',
        period: '',
        jenis_periode: 'bulan',
        popular: false,
        promo: false,
        level: '',
        badge: '',
        flash_sale: false,
        kategori_produk: '',
        status: '1',
        items_lainnya: [],
    });

    // Toggle mode kuota custom (quota dikirim null)
    const handleToggleCustomQuota = (e) => {
        const checked = e.target.checked;
        setIsCustomQuota(checked);
        setData(prev => ({ ...prev, quota: checked ? '' : prev.quota }));
    };

    // --- Repeater Items Lainnya ---
    const addItem = () => {
        setData('items_lainnya', [
            ...data.items_lainnya,
            { nama_item: '', type: '', qty: 1 }
        ]);
    };

    const removeItem = (index) => {
        setData('items_lainnya', data.items_lainnya.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const updated = [...data.items_lainnya];
        updated[index] = { ...updated[index], [field]: value };
        setData('items_lainnya', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.ajp.paket.store'), {
            // Kirim quota null jika mode custom
            transform: (formData) => ({
                ...formData,
                quota: isCustomQuota ? null : formData.quota,
            }),
        });
    };

    return (
        <>
            <Head title="Tambah Paket Berita" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Paket Berita</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>AJP</li>
                                        <li>Paket Berita</li>
                                        <li>Tambah Paket</li>
                                    </ul>
                                </div>
                            </div>

                            <form onSubmit={submit} className='space-y-8'>

                                {/* SECTION 1: INFORMASI PAKET */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Informasi Paket</h2>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="name" value="Nama Paket" className='mb-2 font-bold' />
                                                <TextInput id="name" name="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" placeholder="Contoh: Paket Silver" />
                                                <InputError message={errors.name} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="kategori_produk" value="Kategori Produk" className='mb-2 font-bold' />
                                                <InputSelect id="status" value={data.kategori_produk} onChange={(e) => setData('kategori_produk', e.target.value)} className="mt-1"
                                                    options={[
                                                        { label: "Paket", value: "paket" },
                                                        { label: "Satuan", value: "satuan" }
                                                    ]} />
                                                <InputError message={errors.kategori_produk} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="status" value="Status" className='mb-2 font-bold' />
                                                <InputSelect id="status" value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-1"
                                                    options={[{ label: "Active", value: "1" }, { label: "Inactive", value: "0" }]} />
                                                <InputError message={errors.status} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-6">
                                                <InputTextarea
                                                    label={"Fitur / Deskripsi Paket"}
                                                    onChange={(e) => setData('feature', e.target.value)}
                                                    value={data.feature}
                                                    maxLength={255}
                                                    className="mt-1 block w-full textarea textarea-bordered"
                                                    placeholder="Tulis fitur paket, pisahkan tiap baris jika perlu..."
                                                />

                                                <InputError message={errors.feature} className="mt-2" />
                                            </div>

                                        </div>
                                    </div>
                                </Card>

                                {/* SECTION 2: KUOTA, HARGA & PERIODE */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Kuota, Harga & Periode</h2>

                                        <div className="flex items-center mb-6">
                                            <input
                                                type="checkbox"
                                                id="is_custom_quota"
                                                checked={isCustomQuota}
                                                onChange={handleToggleCustomQuota}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                                            />
                                            <label htmlFor="is_custom_quota" className="ml-3 text-sm font-semibold text-gray-700 cursor-pointer select-none">
                                                Paket Kuota Manual (kuota diisi admin saat menambahkan penulis)
                                            </label>
                                        </div>

                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            <div className="lg:col-span-2">
                                                <InputLabel htmlFor="quota" value={isCustomQuota ? "Kuota (Manual / Null)" : "Kuota Berita"} className='mb-2 font-bold' />
                                                <TextInput
                                                    id="quota"
                                                    type="number"
                                                    value={isCustomQuota ? '' : data.quota}
                                                    onChange={(e) => setData('quota', e.target.value)}
                                                    readOnly={isCustomQuota}
                                                    className={`mt-1 block w-full transition-all ${isCustomQuota ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500' : 'bg-white'}`}
                                                    placeholder={isCustomQuota ? "Diisi saat assign ke penulis" : "Contoh: 10"}
                                                />
                                                <InputError message={errors.quota} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-2">
                                                <InputLabel htmlFor="feed_instagram" value="Feed Instagram" className='mb-2 font-bold' />
                                                <TextInput id="feed_instagram" type="number" value={data.feed_instagram} onChange={(e) => setData('feed_instagram', e.target.value)} className="mt-1 block w-full" placeholder="Contoh: 10" />
                                                <InputError message={errors.feed_instagram} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-2">
                                                <InputLabel htmlFor="ekoran" value="E-Koran" className='mb-2 font-bold' />
                                                <TextInput id="ekoran" type="number" value={data.ekoran} onChange={(e) => setData('ekoran', e.target.value)} className="mt-1 block w-full" placeholder="Contoh: 10" />
                                                <InputError message={errors.ekoran} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-2">
                                                <InputLabel htmlFor="wa_channel" value="WA Channel" className='mb-2 font-bold' />
                                                <TextInput id="wa_channel" type="number" value={data.wa_channel} onChange={(e) => setData('wa_channel', e.target.value)} className="mt-1 block w-full" placeholder="Contoh: 10" />
                                                <InputError message={errors.wa_channel} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-2">
                                                <InputLabel htmlFor="price" value="Harga (Rp)" className='mb-2 font-bold' />
                                                <TextInput id="price" type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} className="mt-1 block w-full" placeholder="0" />
                                                <InputError message={errors.price} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-2">
                                                <InputLabel htmlFor="level" value="Level / Tier" className='mb-2 font-bold' />
                                                <TextInput id="level" type="number" value={data.level} onChange={(e) => setData('level', e.target.value)} className="mt-1 block w-full" placeholder="1" />
                                                <InputError message={errors.level} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="period" value="Masa Aktif" className='mb-2 font-bold' />
                                                <TextInput id="period" type="number" value={data.period} onChange={(e) => setData('period', e.target.value)} className="mt-1 block w-full" placeholder="Contoh: 1" />
                                                <InputError message={errors.period} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="jenis_periode" value="Jenis Periode" className='mb-2 font-bold' />
                                                <InputSelect id="jenis_periode" value={data.jenis_periode} onChange={(e) => setData('jenis_periode', e.target.value)} className="mt-1"
                                                    options={[
                                                        { label: "Hari", value: "hari" },
                                                        { label: "Minggu", value: "minggu" },
                                                        { label: "Bulan", value: "bulan" },
                                                        { label: "Tahun", value: "tahun" },
                                                    ]} />
                                                <InputError message={errors.jenis_periode} className="mt-2" />
                                            </div>

                                        </div>
                                    </div>
                                </Card>

                                {/* SECTION 3: LABEL & PROMOSI */}
                                <Card>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Label & Promosi</h2>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                            <div className="lg:col-span-3">
                                                <InputLabel htmlFor="badge" value="Teks Badge" className='mb-2 font-bold' />
                                                <InputSelect id="badge" value={data.badge} onChange={(e) => setData('badge', e.target.value)} className="mt-1 w-full"
                                                    options={[
                                                        { label: "Kuning", value: "kuning" },
                                                        { label: "Oren", value: "oren" },
                                                        { label: "Hijau", value: "hijau" },
                                                        { label: "Biru", value: "biru" },
                                                    ]} />
                                                <InputError message={errors.badge} className="mt-2" />
                                            </div>

                                            <div className="lg:col-span-3 flex flex-wrap items-center gap-6 pt-8">
                                                <label className="flex items-center cursor-pointer select-none">
                                                    <input type="checkbox" checked={data.popular} onChange={(e) => setData('popular', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                                                    <span className="ml-2 text-sm font-semibold text-gray-700">Populer</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer select-none">
                                                    <input type="checkbox" checked={data.promo} onChange={(e) => setData('promo', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-pink-600" />
                                                    <span className="ml-2 text-sm font-semibold text-gray-700">Promo</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer select-none">
                                                    <input type="checkbox" checked={data.flash_sale} onChange={(e) => setData('flash_sale', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600" />
                                                    <span className="ml-2 text-sm font-semibold text-gray-700">Flash Sale</span>
                                                </label>
                                            </div>

                                        </div>
                                    </div>
                                </Card>

                                {/* SECTION 4: ITEMS LAINNYA (Repeater) */}
                                <Card>
                                    <div>
                                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                                            <h2 className="text-xl font-bold text-gray-800">Items Lainnya</h2>
                                            <button type="button" onClick={addItem} className="btn btn-sm btn-primary btn-outline">
                                                <Plus size={14} /> Tambah Item
                                            </button>
                                        </div>

                                        {data.items_lainnya.length === 0 && (
                                            <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg border border-dashed">
                                                Belum ada item tambahan. Klik "Tambah Item" jika paket ini menyertakan benefit lain.
                                            </p>
                                        )}

                                        <div className="space-y-3">
                                            {data.items_lainnya.map((item, index) => (
                                                <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end p-3 border rounded-lg bg-gray-50">
                                                    <div className="lg:col-span-5">
                                                        <InputLabel value="Nama Item" className='mb-1 text-xs font-bold' />
                                                        <TextInput type="text" value={item.nama_item} onChange={(e) => updateItem(index, 'nama_item', e.target.value)} className="block w-full" placeholder="Contoh: Sertifikat" />
                                                        <InputError message={errors[`items_lainnya.${index}.nama_item`]} className="mt-1" />
                                                    </div>
                                                    <div className="lg:col-span-4">
                                                        <InputLabel value="Type" className='mb-1 text-xs font-bold' />
                                                        <InputSelect id="status" value={item.type} onChange={(e) => updateItem(index, 'type', e.target.value)} className="mt-1"
                                                            options={[
                                                                { label: "Merchandise", value: "merchandise" },
                                                                { label: "Digital Service", value: "digital_service" }
                                                            ]} />
                                                        <InputError message={errors[`items_lainnya.${index}.type`]} className="mt-1" />
                                                    </div>
                                                    <div className="lg:col-span-2">
                                                        <InputLabel value="Qty" className='mb-1 text-xs font-bold' />
                                                        <TextInput type="number" value={item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} className="block w-full" />
                                                        <InputError message={errors[`items_lainnya.${index}.qty`]} className="mt-1" />
                                                    </div>
                                                    <div className="lg:col-span-1">
                                                        <button type="button" onClick={() => removeItem(index)} className="btn btn-sm btn-error btn-outline w-full">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-8 pt-4'>
                                    <button type="submit" className="btn btn-primary px-8" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Paket'}
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
