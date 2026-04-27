import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputPhoneNumber from '@/Components/InputPhoneNumber'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'
import Select from "react-select";

function Edit({ writer, networks, nasionals, daerahs }) {

    // 1. Inisialisasi useForm dengan data dari DB (props.writer)
    const { data, setData, put, processing, errors } = useForm({
        name: writer.name || '',
        date_exp: writer.date_exp || '', // Pastikan formatnya YYYY-MM-DD dari backend
        no_whatsapp: writer.no_whatsapp || '',
        network_id: writer.network_id || '',
        email: writer.email || '',
        password: '', // Biarkan kosong, hanya diisi jika ingin diubah
        status: writer.status !== undefined ? String(writer.status) : '',
        id_nasional: writer.id_nasional || null,
        id_daerah: writer.id_daerah || null,
    });

    // 2. Helper untuk mencari object terpilih agar react-select bisa menampilkan nilai awalnya
    const selectedNasional = nasionals.find(n => n.value === data.id_nasional) || null;
    const selectedDaerah = daerahs.find(d => d.value === data.id_daerah) || null;
    const selectedNetwork = networks?.find(n => n.value === data.network_id) || null; // Opsional jika networks pakai object

    const submit = (e) => {
        e.preventDefault();
        // 3. Gunakan method PUT untuk update data
        put(route('admin.writers.update', writer.id));
    };

    return (
        <>
            <Head title="Edit Penulis" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Writer</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Penulis</li>
                                        <li>Edit Penulis</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}
                            </div>

                            {/* START: Opsi Pilihan Akun (Nasional / Daerah) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">Akun Nasional (Opsional)</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Pilih jika writer berafiliasi dengan akun nasional. Kosongkan jika menambah langsung.
                                        </p>
                                        <Select
                                            options={nasionals}
                                            value={selectedNasional} // Set nilai terpilih
                                            isClearable
                                            placeholder="Pilih Akun Nasional..."
                                            onChange={(e) => setData('id_nasional', e ? e.value : null)}
                                        />
                                        <InputError message={errors.id_nasional} className="mt-2" />
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">Akun Daerah (Opsional)</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Pilih jika writer berafiliasi dengan akun daerah. Kosongkan jika menambah langsung.
                                        </p>
                                        <Select
                                            options={daerahs}
                                            value={selectedDaerah} // Set nilai terpilih
                                            isClearable
                                            placeholder="Pilih Akun Daerah..."
                                            onChange={(e) => setData('id_daerah', e ? e.value : null)}
                                        />
                                        <InputError message={errors.id_daerah} className="mt-2" />
                                    </div>
                                </Card>
                            </div>
                            {/* END: Opsi Pilihan Akun */}

                            {/* START: Main Form */}
                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                    <div className="lg:col-span-6 w-60">
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

                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel
                                            htmlFor="date_exp"
                                            value="Tanggal Kadaluarsa"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="date_exp"
                                            name="date_exp"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.date_exp}
                                            onChange={(e) => setData('date_exp', e.target.value)}
                                            autoComplete="date_exp"
                                        />
                                        <InputError message={errors.date_exp} className="mt-2" />
                                    </div>

                                    <div className='lg:col-span-3 w-full'>
                                        <InputLabel
                                            htmlFor="network_id"
                                            value="Wilayah"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <Select
                                            options={networks}
                                            value={selectedNetwork} // Jika networks menggunakan react-select juga
                                            id="network_id"
                                            name="network_id"
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('network_id', e ? e.value : '')}
                                        />
                                        <InputError message={errors.network_id} className="mt-2" />
                                    </div>

                                    <div className='lg:col-span-6 w-full'>
                                        <InputLabel
                                            htmlFor="no_whatsapp"
                                            value="Nomor WhatsApp"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <InputPhoneNumber
                                            id="no_whatsapp"
                                            name="no_whatsapp"
                                            value={data.no_whatsapp}
                                            onChange={(e) => setData('no_whatsapp', e.target.value)}
                                            className="w-full"
                                            autoComplete="no_whatsapp"
                                        />
                                        <InputError message={errors.no_whatsapp} className="mt-2" />
                                    </div>

                                    <div className='lg:col-span-3'>
                                        <InputLabel
                                            htmlFor="name"
                                            value="Nama"
                                            className='mb-2 font-bold'
                                        />
                                        <TextInput
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div className='lg:col-span-3'>
                                        <InputLabel
                                            htmlFor="email"
                                            value="Email"
                                            className='mb-2 font-bold'
                                        />
                                        <TextInput
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    <div className='lg:col-span-6 w-full'>
                                        <InputLabel
                                            htmlFor="password"
                                            value="Password"
                                            className='mb-2 font-bold'
                                        />
                                        <InputPassword
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            className="mt-1 w-80 md:w-full"
                                            placeholder="Kosongkan jika tidak ingin mengubah password"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <InputError message={errors.password} className="mt-2" />
                                        <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengubah password.</p>
                                    </div>

                                    <div className='lg:col-span-6 flex flex-row justify-end mt-4'>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={processing}
                                        >
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </Card>
                            {/* END: Main Form */}

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Edit