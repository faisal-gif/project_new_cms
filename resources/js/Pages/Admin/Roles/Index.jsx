import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Trash2, Plus } from 'lucide-react';
import Card from '@/Components/Card';
import PaginationDaisy from '@/Components/PaginationDaisy';
import { Badge } from '@/Components/ui/badge';

export default function Index({ roles }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            destroy(route('admin.roles.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Role" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className=" space-y-6">

                        <div className='flex flex-row justify-between items-center'>
                            {/* start Header */}
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Daftar Role</h1>
                            </div>
                            {/* end Header */}

                            {/* start breadcrumbs */}
                            <div className="breadcrumbs text-sm">
                                <ul>
                                    <li><a>Home</a></li>
                                    <li>Role</li>
                                </ul>
                            </div>
                            {/* end breadcrumbs */}

                        </div>

                        {/* Start Head */}
                        <Card>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                {/* Button Tambah User */}
                                <Link href={route('admin.roles.create')} className="btn btn-primary rounded-lg">
                                    <Plus size={16} /> Tambah Role
                                </Link>


                            </div>
                        </Card>
                        {/* End Head */}

                        {/* Start Table */}
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nama Role</th>
                                            <th>Total Permission</th>
                                            <th className="text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.data.map((role) => (
                                            <tr key={role.id}>
                                                <td>{role.id}</td>
                                                <td className="font-semibold uppercase">{role.name}</td>
                                                <td>
                                                    <Badge className="bg-neutral">
                                                        {role.permissions.length} akses
                                                    </Badge>
                                                </td>
                                                <td className="flex justify-end gap-2">
                                                    <Link href={route('admin.roles.edit', role.id)} className="btn btn-warning btn-outline btn-sm">
                                                        <Edit size={16} />
                                                    </Link>
                                                   
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                        {/* End Table */}

                        {/* Start Pagination */}
                        <PaginationDaisy data={roles} />
                        {/* End Pagination */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}