import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ editors, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');
    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.nasional.editor.index');

    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];

    // 2. Buat helper function
    const hasPermission = (permissions) => {
        if (Array.isArray(permissions)) {
            return permissions.some(permission => userPermissions.includes(permission));
        }
        return userPermissions.includes(permissions);
    };

    useEffect(() => {
        // Skip initial load
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        let timeout = null;

        // Search → debounce
        if (search !== filters.search) {
            timeout = setTimeout(() => {
                router.get(
                    INDEX_ROUTE,
                    { search, status, page: 1 },
                    { preserveState: true, replace: true }
                );
            }, 400);
        }
        // Status → langsung request
        else {
            router.get(
                INDEX_ROUTE,
                { search, status, page: 1 },
                { preserveState: true, replace: true }
            );
        }

        return () => timeout && clearTimeout(timeout);
    }, [search, status]);

    function getStatusBadge(status) {
        switch (status) {
            case "pending":
            case '0':
            case 0:
                return <Badge variant="secondary">Inactive</Badge>;
            case "Publish":
            case '1':
            case 1:
                return <Badge className={"bg-green-300 text-green-700"}>Active</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    }



    return (
        <>
            <Head title="Editor Nasional" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


                        <div className=" space-y-6">
                            <div className='flex flex-row justify-between items-center'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Editor Nasional</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Editor Nasional' }]} />
                                {/* end breadcrumbs */}

                            </div>

                            {/* Start Head */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                                    {/* Button Tambah Editor Nasional */}
                                    {hasPermission('create editor nasional') && (
                                        <Button asChild className="rounded-lg">
                                            <Link href={route('admin.nasional.editor.create')}>
                                                <Plus size={16} /> Tambah Editor Nasional
                                            </Link>
                                        </Button>
                                    )}

                                    {/* Field Search And Filter */}
                                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                        <div className="w-full md:w-80">
                                            <InputWithPrefix
                                                prefix={<Search size={16} />}
                                                placeholder="Search Editor..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-48">
                                            <InputSelect
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                options={[
                                                    { label: "Active", value: "1" },
                                                    { label: "Inactive", value: "0" },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </Card>
                            {/* End Head */}

                            {/* Start Table */}
                            <Card>
                                {/* DESKTOP VERSION (Table Mode) */}
                                <div className=" overflow-x-auto">
                                    <Table>

                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>#</TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {editors.data.map((editor, index) => (
                                                <TableRow key={editor.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{editor.editor_name}</TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(editor.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-2">
                                                            {hasPermission('edit editor nasional') && (
                                                                <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                                                <Link href={route('admin.nasional.editor.edit', editor.editor_id)}>Edit</Link>
                                                            </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>

                                    </Table>
                                </div>

                            </Card>
                            {/* End Table */}

                            {/* Start Pagination */}
                            <PaginationDaisy data={editors} />
                            {/* End Pagination */}


                        </div>


                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Index