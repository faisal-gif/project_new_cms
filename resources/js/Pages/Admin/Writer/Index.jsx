import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Pencil, Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ writers, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.writers.index');

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

    function IndexCell({ item, editRoute, addRoute, addLabel }) {
        if (!item) {
            return (
                <Button asChild size="xs" variant="outline" className="gap-1 border-primary text-primary hover:bg-primary/10">
                    <Link href={addRoute || '#'}>
                        <Plus className="w-3 h-3" /> {addLabel}
                    </Link>
                </Button>
            );
        }
        return (
            <div className="rounded-lg border border-border px-2.5 py-2 w-full bg-muted">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium truncate" title={item.title || item.name}>
                        {item.name || '-'}
                    </span>
                    <Button asChild size="xs" variant="outline" className="gap-1 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                        <Link href={editRoute}>
                            <Pencil className="w-3 h-3" />
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center justify-between gap-2">
                    {getStatusBadge(item.status)}
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Terindeks
                    </span>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Writer Management" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


                        <div className=" space-y-6">
                            <div className='flex flex-row justify-between items-center'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Writer</h1>
                                </div>
                                {/* end Header */}

                                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Penulis' }]} />

                            </div>

                            {/* Start Head */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    {/* Button Tambah User */}
                                    {hasPermission('create penulis master') && (
                                        <Button asChild className="rounded-lg">
                                            <Link href={route('admin.writers.create')}>
                                                <Plus size={16} /> Tambah Penulis
                                            </Link>
                                        </Button>
                                    )}

                                    {/* Field Search And Filter */}
                                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                        <div className="w-full md:w-80">
                                            <InputWithPrefix
                                                prefix={<Search size={16} />}
                                                placeholder="Search Writer..."
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
                                {/* MOBILE VERSION (Card Mode) */}
                                <div className="md:hidden flex flex-col gap-4">
                                    {/* Contoh data, ganti dengan data.map(...) */}
                                    {writers.data.map((writer) => (
                                        <div key={writer.id} className="border rounded-xl p-4 bg-background shadow-sm">

                                            {/* Header (Nama + Status) */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold text-base">{writer.name}</p>
                                                    <p className="text-sm text-gray-500">{writer.email}</p>
                                                </div>

                                                {getStatusBadge(writer.status)}
                                            </div>

                                            {/* Detail */}
                                            <div className="text-sm space-y-1">
                                                <p><span className="font-medium">Masa Berlaku:</span> {formatDate(writer.date_exp)}</p>
                                            </div>

                                            {/* Integration Status (Daerah & Nasional) */}
                                            <div className="grid grid-cols-1 gap-2">
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wide text-foreground/50 mb-1">Daerah</div>
                                                    <IndexCell
                                                        item={writer.daerah}
                                                        editRoute={writer.daerah ? route('admin.daerah.writer.edit', writer.daerah.id) : null}
                                                        addRoute={route('admin.writers.edit', writer.id)}
                                                        addLabel="Daerah"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wide text-foreground/50 mb-1">Nasional</div>
                                                    <IndexCell
                                                        item={writer.nasional}
                                                        editRoute={writer.nasional ? route('admin.nasional.writer.edit', writer.nasional.id) : null}
                                                        addRoute={route('admin.writers.edit', writer.id)}
                                                        addLabel="Nasional"
                                                    />
                                                </div>
                                            </div>
                                            {/* Actions */}

                                            <div className="flex items-center justify-between text-xs text-foreground/60 pt-1">
                                                <span>Berlaku s/d {formatDate(writer.date_exp)}</span>
                                                {hasPermission('edit penulis master') && (
                                                    <Button asChild size="xs" variant="outline" className="gap-1 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                                        <Link href={route('admin.writers.edit', writer)}>
                                                            <Pencil className="w-3 h-3" /> Edit
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* DESKTOP VERSION (Table Mode) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border">
                                                <TableHead className="w-12">#</TableHead>
                                                <TableHead className="">Penulis</TableHead>
                                                <TableHead className="">Masa Berlaku</TableHead>
                                                <TableHead className="">Daerah</TableHead>
                                                <TableHead className="">Nasional</TableHead>
                                                <TableHead className="">Status</TableHead>
                                                <TableHead className=" text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {writers.data.map((writer, index) => {
                                                const from = writers.from ?? 1;
                                                return (
                                                    <TableRow key={writer.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                                                        <TableCell className="text-xs text-foreground/50 align-top py-4">{from + index}</TableCell>

                                                        {/* Penulis */}
                                                        <TableCell className="py-4 align-top">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-foreground">{writer.name}</span>
                                                                <span className="text-xs text-foreground/60">{writer.email}</span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4 align-top text-sm text-foreground/80">
                                                            {formatDate(writer.date_exp)}
                                                        </TableCell>

                                                        {/* Daerah */}
                                                        <TableCell className="py-4 align-top">
                                                            <IndexCell
                                                                item={writer.daerah}
                                                                editRoute={writer.daerah ? route('admin.daerah.writer.edit', writer.daerah.id) : null}
                                                                addRoute={route('admin.writers.edit', writer.id)}
                                                                addLabel="Tambah Daerah"
                                                            />
                                                        </TableCell>

                                                        {/* Nasional */}
                                                        <TableCell className="py-4 align-top">
                                                            <IndexCell
                                                                item={writer.nasional}
                                                                editRoute={writer.nasional ? route('admin.nasional.writer.edit', writer.nasional.id) : null}
                                                                addRoute={route('admin.writers.edit', writer.id)}
                                                                addLabel="Tambah Nasional"
                                                            />
                                                        </TableCell>

                                                        <TableCell className="py-4 align-top">
                                                            {getStatusBadge(writer.status)}
                                                        </TableCell>

                                                        <TableCell className="py-4 align-top text-right">
                                                            {hasPermission('edit penulis master') && (
                                                                <Button asChild size="sm" variant="outline" className="gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                                                    <Link href={route('admin.writers.edit', writer)}>
                                                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                            </Card>
                            {/* End Table */}

                            {/* Start Pagination */}
                            <PaginationDaisy data={writers} />
                            {/* End Pagination */}


                        </div>


                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Index