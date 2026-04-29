import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Checkbox from '@/Components/Checkbox';
import Card from '@/Components/Card';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';

export default function Create({ permissionsGrouped }) {
    const { data, setData, post, processing } = useForm({
        name: '',
        permissions: [] // Array of permission names
    });

    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        if (e.target.checked) {
            setData('permissions', [...data.permissions, value]);
        } else {
            setData('permissions', data.permissions.filter((p) => p !== value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.roles.store'));
    }

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Role" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="space-y-6">

                        <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                            {/* start Header */}
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Tambah Role</h1>
                            </div>
                            {/* end Header */}

                            {/* start breadcrumbs */}
                            <div className="breadcrumbs text-sm">
                                <ul>
                                    <li><a>Home</a></li>
                                    <li>Role</li>
                                    <li>Tambah Role</li>
                                </ul>
                            </div>
                            {/* end breadcrumbs */}

                        </div>


                        <Card>
                            <InputLabel htmlFor="name" value="Nama Role" />

                            <TextInput
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Nama Role (ex: admin-keuangan)"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />

                        </Card>
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-xl font-semibold mb-4">Pilih Hak Akses:</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Looping Object Group */}
                                {Object.entries(permissionsGrouped).map(([category, perms]) => (
                                    <Card key={category}>
                                        <h3 className="font-bold text-lg mb-3 border-b pb-2">{category}</h3>
                                        <div className="flex flex-col gap-2">
                                            {/* Looping isian permission per group */}
                                            {perms.map(permission => (
                                                <label key={permission.id} className="cursor-pointer flex items-center gap-2">
                                                    <Checkbox
                                                        value={permission.name}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    <span className="text-sm capitalize">{permission.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <button className="btn btn-primary mt-6" disabled={processing}>
                                Simpan Role
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}