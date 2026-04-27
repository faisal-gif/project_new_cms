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

function Create({ nasionals, daerahs }) {

    // Menambahkan state id_nasional dan id_daerah
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        status: '',
        id_nasional: null,
        id_daerah: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.editors.store'));
    };

    return (
        <>
            <Head title="Tambah Editor" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Editor</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Editor</li>
                                        <li>Tambah Editor</li>
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
                                            isClearable // Memungkinkan pengguna menghapus pilihan (tidak ada)
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
                                            isClearable // Memungkinkan pengguna menghapus pilihan (tidak ada)
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
                                            autoComplete="name"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                  

                                    <div className='lg:col-span-6 flex flex-row justify-end mt-4'>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={processing}
                                        >
                                            Simpan
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

export default Create