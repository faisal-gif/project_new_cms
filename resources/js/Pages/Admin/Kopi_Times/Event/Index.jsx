import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import { Switch } from '@/Components/ui/switch'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Copy, Inbox, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const CATEGORY_META = {
    event: { label: 'Event', className: 'bg-blue-200 text-blue-800' },
    public_event: { label: 'Public Event', className: 'bg-green-200 text-green-800' },
    lomba: { label: 'Lomba', className: 'bg-amber-200 text-amber-800' },
};

function Index({ events, filters, public_url }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [category, setCategory] = useState(() => filters.category || '');

    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.kopi-times.events.index');

    const { auth } = usePage().props;
    const userPermissions = auth.permissions || [];
    const can = (permission) => userPermissions.includes(permission);

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }
        let timeout = null;
        if (search !== filters.search) {
            timeout = setTimeout(() => {
                router.get(INDEX_ROUTE, { search, category, page: 1 }, { preserveState: true, replace: true });
            }, 400);
        } else {
            router.get(INDEX_ROUTE, { search, category, page: 1 }, { preserveState: true, replace: true });
        }
        return () => timeout && clearTimeout(timeout);
    }, [search, category]);

    const getCategoryBadge = (cat) => {
        const meta = CATEGORY_META[cat] || { label: cat, className: 'bg-gray-200 text-gray-700' };
        return <Badge className={`${meta.className} hover:opacity-90`}>{meta.label}</Badge>;
    };

    const toggleEnabled = (item) => {
        router.patch(route('admin.kopi-times.events.toggle', item.id), {}, { preserveScroll: true });
    };

    const destroy = (item) => {
        if (item.submissions_count > 0) {
            alert('Event ini sudah punya kiriman dan tidak bisa dihapus. Non-aktifkan saja.');
            return;
        }
        if (confirm(`Hapus event "${item.name}"?`)) {
            router.delete(route('admin.kopi-times.events.destroy', item.id), { preserveScroll: true });
        }
    };

    const copyPublicUrl = (slug) => {
        const url = `${public_url}/kirim-berita/${slug}`;
        navigator.clipboard?.writeText(url);
    };

    return (
        <>
            <Head title="Manajemen Event" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            <div className="flex flex-row justify-between items-center">
                                <h1 className="text-3xl font-bold text-foreground">Daftar Event</h1>
                                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Kopi Times' }, { label: 'Event' }]} />
                            </div>

                            <Card>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    {can('create event kopi-times') ? (
                                        <Button asChild className="rounded-lg">
                                            <Link href={route('admin.kopi-times.events.create')}>
                                                <Plus size={16} /> Buat Event
                                            </Link>
                                        </Button>
                                    ) : <span />}
                                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                        <div className="w-full md:w-80">
                                            <InputWithPrefix
                                                prefix={<Search size={16} />}
                                                placeholder="Cari nama event..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full md:w-48">
                                            <InputSelect
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                options={[
                                                    { label: 'Semua Jenis', value: '' },
                                                    { label: 'Event', value: 'event' },
                                                    { label: 'Public Event', value: 'public_event' },
                                                    { label: 'Lomba', value: 'lomba' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border">
                                                <TableHead className="w-12 text-center">#</TableHead>
                                                <TableHead>Event</TableHead>
                                                <TableHead>Jenis</TableHead>
                                                <TableHead>Periode</TableHead>
                                                <TableHead className="text-center">Kuota</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {events.data.map((item, index) => {
                                                const from = events.from ?? 1;
                                                const used = item.submissions_count ?? 0;
                                                const remaining = Math.max((item.quota ?? 0) - used, 0);
                                                return (
                                                    <TableRow key={item.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                                                        <TableCell className="text-xs text-foreground/50 align-top py-4 text-center">{from + index}</TableCell>
                                                        <TableCell className="py-4 align-top max-w-xs">
                                                            <span className="text-sm font-bold line-clamp-1" title={item.name}>{item.name}</span>
                                                            {item.category === 'public_event' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyPublicUrl(item.slug)}
                                                                    className="mt-1 flex items-center gap-1 text-xs text-primary/80 hover:text-primary max-w-full"
                                                                    title="Salin URL publik"
                                                                >
                                                                    <Copy className="w-3 h-3 shrink-0" />
                                                                    <span className="truncate">{public_url}/kirim-berita/{item.slug}</span>
                                                                </button>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-4 align-top">{getCategoryBadge(item.category)}</TableCell>
                                                        <TableCell className="py-4 align-top text-sm">
                                                            <div className="flex flex-col gap-1">
                                                                <span><span className="text-xs font-semibold uppercase text-foreground/50 block">Mulai</span>{item.starts_at ? formatDateTime(item.starts_at) : '-'}</span>
                                                                <span className="mt-1"><span className="text-xs font-semibold uppercase text-foreground/50 block">Selesai</span>{item.ends_at ? formatDateTime(item.ends_at) : '-'}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 align-top text-center text-sm">
                                                            <div className="font-semibold">{used} / {item.quota}</div>
                                                            <div className="text-xs text-foreground/60">sisa {remaining}</div>
                                                        </TableCell>
                                                        <TableCell className="py-4 align-top text-center">
                                                            <Switch
                                                                checked={!!item.enabled}
                                                                onCheckedChange={() => toggleEnabled(item)}
                                                                disabled={!can('edit event kopi-times')}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-4 align-top text-right whitespace-nowrap">
                                                            {can('view event kopi-times') && item.category === 'public_event' && (
                                                                <Button asChild size="sm" variant="ghost" className="gap-1.5" title="Lihat kiriman">
                                                                    <Link href={route('admin.kopi-times.events.submissions', item.id)}>
                                                                        <Inbox className="w-3.5 h-3.5" /> Kiriman
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                            {can('edit event kopi-times') && (
                                                                <Button asChild size="sm" variant="outline" className="gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                                                    <Link href={route('admin.kopi-times.events.edit', item.id)}>
                                                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                            {can('delete event kopi-times') && (
                                                                <Button type="button" size="sm" variant="ghost" onClick={() => destroy(item)} className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={item.submissions_count > 0} title={item.submissions_count > 0 ? 'Ada kiriman — non-aktifkan saja' : 'Hapus'}>
                                                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {events.data.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan="7" className="text-center py-8 text-gray-500 bg-muted/20">
                                                        Tidak ada event ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>

                            {events.data.length > 0 && <PaginationDaisy data={events} />}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Index
