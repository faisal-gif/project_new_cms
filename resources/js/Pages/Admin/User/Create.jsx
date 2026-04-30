import Card from '@/Components/Card'
import Checkbox from '@/Components/Checkbox'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'
import Select from 'react-select'

function Create({ writers, editors, roles }) {

    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        username: '',

        email: '',
        password: '',
        status: '',
        id_writer: null,
        id_editor: null,
        id_fotografer: null,
        roles: []
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));

    };

    const handleRoleChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setData('roles', [...data.roles, value]);
        } else {
            setData('roles', data.roles.filter((role) => role !== value));
        }
    };

    return (
        <>
            <Head title="Tambah User" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah User</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>User</li>
                                        <li>Tambah User</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">Akun Editor (Opsional)</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Pilih jika writer berafiliasi dengan akun editor. Kosongkan jika menambah langsung.
                                        </p>
                                        <Select
                                            options={editors}
                                            isClearable // Memungkinkan pengguna menghapus pilihan (tidak ada)
                                            placeholder="Pilih Akun Editor..."
                                            onChange={(e) => setData('id_editor', e ? e.value : null)}
                                        />
                                        <InputError message={errors.id_editor} className="mt-2" />
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">Akun Writer (Opsional)</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Pilih jika akun berafiliasi dengan akun writer. Kosongkan jika menambah langsung.
                                        </p>
                                        <Select
                                            options={writers}
                                            isClearable // Memungkinkan pengguna menghapus pilihan (tidak ada)
                                            placeholder="Pilih Akun Writer..."
                                            onChange={(e) => setData('id_writer', e ? e.value : null)}
                                        />
                                        <InputError message={errors.id_writer} className="mt-2" />
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">Akun Fotografer (Opsional)</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Pilih jika akun berafiliasi dengan akun fotografer. Kosongkan jika menambah langsung.
                                        </p>
                                        <Select
                                            options={writers}
                                            isClearable // Memungkinkan pengguna menghapus pilihan (tidak ada)
                                            placeholder="Pilih Akun Fotografer..."
                                            onChange={(e) => setData('id_fotografer', e ? e.value : null)}
                                        />
                                        <InputError message={errors.id_fotografer} className="mt-2" />
                                    </div>
                                </Card>
                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>


                                    {/* Form fields will go here */}
                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel htmlFor="full_name" value="Nama Lengkap" className='mb-2 font-bold' />
                                        <TextInput
                                            id="full_name"
                                            name="full_name"
                                            type="text"
                                            className="block w-full"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                        />
                                        <InputError message={errors.full_name} className="mt-2" />
                                    </div>

                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel htmlFor="email" value="Email" className='mb-2 font-bold' />
                                        <TextInput
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="block w-full"
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel htmlFor="username" value="Username" className='mb-2 font-bold' />
                                        <TextInput
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            className="block w-full"
                                        />
                                        <InputError message={errors.username} className="mt-2" />
                                    </div>

                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel htmlFor="password" value="Password (Kosongkan jika tidak diubah)" className='mb-2 font-bold text-gray-600' />
                                        <InputPassword
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            className="w-full"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    <div className="lg:col-span-2 w-full">
                                        <InputSelect
                                            label="Status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            options={[
                                                { label: "Publish / Active", value: "1" },
                                                { label: "Pending / Inactive", value: "0" },
                                            ]}
                                        />
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>



                                    {/* --- MANAJEMEN ROLE SPATIE --- */}
                                    <div className="lg:col-span-6 border-t pt-6 mt-2">
                                        <h2 className="text-xl font-semibold mb-2">Tugaskan Role (Jabatan)</h2>
                                        <p className="text-sm text-gray-500 mb-4">Pilih satu atau lebih otoritas untuk pengguna ini.</p>

                                        <div className="flex flex-wrap gap-4">
                                            {roles && roles.map((roleName, index) => (
                                                <label key={index} className="cursor-pointer flex items-center gap-2 p-3 border rounded-lg hover:bg-base-200 transition">
                                                    <Checkbox
                                                        value={roleName}
                                                        checked={data.roles.includes(roleName)}
                                                        onChange={handleRoleChange}
                                                    />
                                                    <span className="capitalize font-medium">{roleName.replace(/-/g, ' ')}</span>
                                                </label>
                                            ))}
                                            {(!roles || roles.length === 0) && (
                                                <span className="text-sm text-red-500 italic">Belum ada role yang dibuat di sistem.</span>
                                            )}
                                        </div>
                                        <InputError message={errors.roles} className="mt-2" />
                                    </div>

                                    <div className=' lg:col-span-6 flex flex-row justify-end mt-4'>
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

                        </div>

                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Create