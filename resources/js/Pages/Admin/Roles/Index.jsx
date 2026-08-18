import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Edit, Trash2, Plus } from 'lucide-react';
import Card from '@/Components/Card';
import PaginationDaisy from '@/Components/PaginationDaisy';
import { Badge } from '@/Components/ui/badge';

export default function Index({ roles }) {
    const { delete: destroy } = useForm();
    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];

    // 2. Buat helper function
    const hasPermission = (permissions) => {
        if (Array.isArray(permissions)) {
            return permissions.some(permission => userPermissions.includes(permission));
        }
        return userPermissions.includes(permissions);
    };


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

                            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Role' }]} />

                        </div>

                        {/* Start Head */}
                        <Card>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                {/* Button Tambah User */}
                                {hasPermission('create role master') && (
                                    <Button asChild className="rounded-lg">
                                        <Link href={route('admin.roles.create')}>
                                            <Plus size={16} /> Tambah Role
                                        </Link>
                                    </Button>
                                )}

                            </div>
                        </Card>
                        {/* End Head */}

                        {/* Start Table */}
                        <Card>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nama Role</TableHead>
                                            <TableHead>Total Permission</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {roles.data.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell>{role.id}</TableCell>
                                                <TableCell className="font-semibold uppercase">{role.name}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-neutral-700">
                                                        {role.permissions.length} akses
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="flex justify-end gap-2">
                                                    {hasPermission('edit role master') && (
                                                        <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                                            <Link href={route('admin.roles.edit', role.id)}>
                                                                <Edit size={16} />
                                                            </Link>
                                                        </Button>
                                                    )}

                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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