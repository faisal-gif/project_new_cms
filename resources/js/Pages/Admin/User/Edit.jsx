import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import Checkbox from '@/Components/Checkbox'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm, Link } from '@inertiajs/react'
import React from 'react'
import Select from 'react-select'

// Tambahkan props `roles` (semua role tersedia) dan `userRoles` (role yang dimiliki user saat ini)
function Edit({ user, writers, editors, roles, userRoles }) {

    const { data, setData, put, processing, errors } = useForm({
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        status: user.status || '1',
        id_writer: user.id_writer || null,
        id_editor: user.id_editor || null,
        id_fotografer: user.id_fotografer || null,
        // Hapus `role` lama (string), ganti dengan array roles dari Spatie
        roles: userRoles || [] 
    });

    const selectedEditor = editors.find(e => e.value === data.id_editor) || null;
    const selectedWriter = writers.find(w => w.value === data.id_writer) || null;
    const selectedFotografer = writers.find(w => w.value === data.id_fotografer) || null;

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    // Handler untuk Checkbox Role Spatie
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
            <Head title="Edit User" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><Link href={route('dashboard')}>Home</Link></li>
                                        <li><Link href={route('admin.users.index')}>User</Link></li>
                                        <li>Edit User</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">Akun Editor (Opsional)</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Pilih jika user berafiliasi dengan akun editor. Kosongkan jika tidak.
                                        </p>
                                        <Select
                                            options={editors}
                                            isClearable
                                            placeholder="Pilih Akun Editor..."
                                            value={selectedEditor}
                                            onChange={(e) => setData('id_editor', e ? e.value : null)}
                                        />
                                        <InputError message={errors.id_editor} className="mt-2" />
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">Akun Writer (Opsional)</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Pilih jika user berafiliasi dengan akun writer. Kosongkan jika tidak.
                                        </p>
                                        <Select
                                            options={writers}
                                            isClearable
                                            placeholder="Pilih Akun Writer..."
                                            value={selectedWriter}
                                            onChange={(e) => setData('id_writer', e ? e.value : null)}
                                        />
                                        <InputError message={errors.id_writer} className="mt-2" />
                                    </div>
                                </Card>

                                <Card>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold mb-2">Akun Fotografer (Opsional)</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Pilih jika user berafiliasi dengan akun fotografer. Kosongkan jika tidak.
                                        </p>
                                        <Select
                                            options={writers} // Asumsi Anda menggunakan referensi array yang sama, jika ada `fotografers` ganti ini
                                            isClearable
                                            placeholder="Pilih Akun Fotografer..."
                                            value={selectedFotografer}
                                            onChange={(e) => setData('id_fotografer', e ? e.value : null)}
                                        />
                                        <InputError message={errors.id_fotografer} className="mt-2" />
                                    </div>
                                </Card>
                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-6 p-2'>
                                    
                                    {/* --- INFORMASI AKUN --- */}
                                    <div className="lg:col-span-6 border-b pb-2">
                                        <h2 className="text-xl font-semibold">Informasi Akun</h2>
                                    </div>

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


                                    {/* --- SUBMIT BUTTON --- */}
                                    <div className='lg:col-span-6 flex flex-row justify-end mt-4 pt-4 border-t'>
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-8"
                                            disabled={processing}
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
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

export default Edit