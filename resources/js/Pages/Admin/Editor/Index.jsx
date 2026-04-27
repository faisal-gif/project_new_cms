import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { Pencil, Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ editors, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [status, setStatus] = useState(() => filters.status || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.editors.index');

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
                return <Badge variant="neutral">{status}</Badge>;
        }
    }

    function IndexCell({ item, type, editRoute, addLabel }) {
        if (!item) {
            return (
                <Link
                    href="#"
                    className="btn btn-xs btn-outline btn-primary gap-1"
                >
                    <Plus className="w-3 h-3" /> {addLabel}
                </Link>
            );
        }

        if (type === "daerah") {
            return (
                <div className="rounded-lg border border-base-200 px-2.5 py-2 w-48 bg-base-300">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-medium truncate" title={item.title || item.name}>
                            {item.name || '-'}
                        </span>
                        <Link href={editRoute} className="btn-warning btn-soft btn btn-xs gap-1">
                            <Pencil className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        {getStatusBadge(item.status)}
                        <span className="inline-flex items-center gap-1 text-[10px] text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Terindeks
                        </span>
                    </div>
                </div>
            );
        }

        if (type === "nasional") {
               return (
                <div className="rounded-lg border border-base-200 px-2.5 py-2 w-48 bg-base-300">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-medium truncate" title={item.title || item.editor_name}>
                            {item.editor_name || '-'}
                        </span>
                        <Link href={editRoute} className="btn-warning btn-soft btn btn-xs gap-1">
                            <Pencil className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        {getStatusBadge(item.status)}
                        <span className="inline-flex items-center gap-1 text-[10px] text-success">
                            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Terindeks
                        </span>
                    </div>
                </div>
            ); 
        }

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
                                    <h1 className="text-3xl font-bold text-foreground">Daftar Editor</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Editor</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            {/* Start Head */}
                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    {/* Button Tambah User */}
                                    <Link href={route('admin.editors.create')} className="btn btn-primary rounded-lg">
                                        <Plus size={16} /> Tambah Editor
                                    </Link>

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
                                    {editors.data.map((editor) => (
                                        <div key={editor.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                                            {/* Header (Nama + Status) */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-semibold text-base">{editor.name}</p>
                                                    <p className="text-sm text-gray-500">{editor.email}</p>
                                                </div>

                                                {getStatusBadge(editor.status)}
                                            </div>

                                            {/* Detail */}
                                            <div className="text-sm space-y-1">
                                                <p><span className="font-medium">Masa Berlaku:</span> {formatDate(editor.date_exp)}</p>
                                            </div>

                                            {/* Integration Status (Daerah & Nasional) */}
                                            <div className="grid grid-cols-1 gap-2">
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wide text-base-content/50 mb-1">Daerah</div>
                                                    <IndexCell
                                                        item={editor.daerah}
                                                        type="daerah"
                                                        editRoute={editor.daerah ? route('admin.daerah.editor.edit', editor.daerah.id) : null}
                                                        addLabel="Daerah"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-wide text-base-content/50 mb-1">Nasional</div>
                                                    <IndexCell
                                                        item={editor.nasional}
                                                        type="nasional"
                                                        editRoute={editor.nasional ? route('admin.nasional.editor.edit', editor.nasional.editor_id) : null}
                                                        addLabel="Nasional"
                                                    />
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex items-center justify-between text-xs text-base-content/60 pt-1">
                                                <span>Berlaku s/d {formatDate(editor.date_exp)}</span>
                                                <Link href={route('admin.editors.edit', editor)} className="btn btn-xs btn-warning btn-soft gap-1">
                                                    <Pencil className="w-3 h-3" /> Edit
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* DESKTOP VERSION (Table Mode) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="table table-zebra w-full">
                                        <thead>
                                            <tr className="border-b border-base-200">
                                                <th className="w-12">#</th>
                                                <th className="">Editor</th>
                                                <th className="">Daerah</th>
                                                <th className="">Nasional</th>
                                                <th className="">Status</th>
                                                <th className=" text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {editors.data.map((editor, index) => {
                                                const from = editors.from ?? 1;
                                                return (
                                                    <tr key={editor.id} className="border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors">
                                                        <td className="text-xs text-base-content/50 align-top py-4">{from + index}</td>

                                                        {/* Penulis */}
                                                        <td className="py-4 align-top">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-base-content">{editor.name}</span>
                                                                <span className="text-xs text-base-content/60">{editor.email}</span>
                                                            </div>
                                                        </td>

                                                        {/* Daerah */}
                                                        <td className="py-4 align-top">
                                                            <IndexCell
                                                                item={editor.daerah}
                                                                type="daerah"
                                                                editRoute={editor.daerah ? route('admin.daerah.editor.edit', editor.daerah.id) : null}
                                                                addLabel="Tambah Daerah"
                                                            />
                                                        </td>

                                                        {/* Nasional */}
                                                        <td className="py-4 align-top">
                                                            <IndexCell
                                                                item={editor.nasional}
                                                                type="nasional"
                                                                editRoute={editor.nasional ? route('admin.nasional.editor.edit', editor.nasional.editor_id) : null}
                                                                addLabel="Tambah Nasional"
                                                            />
                                                        </td>

                                                        <td className="py-4 align-top">
                                                            {getStatusBadge(editor.status)}
                                                        </td>

                                                        <td className="py-4 align-top text-right">
                                                            <Link
                                                                href={route('admin.editors.edit', editor)}
                                                                className="btn btn-sm btn-ghost gap-1.5"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" /> Edit
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
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