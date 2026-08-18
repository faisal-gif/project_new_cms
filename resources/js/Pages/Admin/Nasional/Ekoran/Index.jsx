import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ ekorans, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');

  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.nasional.ekoran.index');

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
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;

    if (search !== filters.search) {
      timeout = setTimeout(() => {
        router.get(
          INDEX_ROUTE,
          { search, status, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    } else {
      router.get(
        INDEX_ROUTE,
        { search, status, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, status]);

  function handleReset() {
    setSearch('');
    setStatus('');

    router.get(
      INDEX_ROUTE,
      { search: '', status: '', page: 1 },
      { preserveState: true, replace: true }
    );
  }

  function getStatusBadge(statusValue) {
    // Berdasarkan tabel ekoran: status tinyint(1) (0 = Draft, 1 = Published)
    switch (statusValue?.toString()) {
      case '0':
        return <Badge variant="secondary">Draft</Badge>;
      case '1':
        return <Badge className="bg-green-300 text-green-700">Published</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  }

  return (
    <>
      <Head title="Manajemen eKoran" />
      <AuthenticatedLayout>
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">

              <div className='flex flex-row justify-between items-center'>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar eKoran</h1>
                </div>
                <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'eKoran' }]} />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {hasPermission('create ekoran nasional') && (
                  <Button asChild className="rounded-lg">
                    <Link href={route('admin.nasional.ekoran.create')}>
                      <Plus size={16} /> Tambah Edisi
                    </Link>
                  </Button>
                )}
              </div>

              {/* Start Filter */}
              <Card>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <div className="w-full md:w-96">
                    <InputWithPrefix
                      prefix={<Search size={16} />}
                      placeholder="Cari Judul atau ID..."
                      className='w-full'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <InputSelect
                      value={status}
                      placeholder='Status'
                      onChange={(e) => setStatus(e.target.value)}
                      options={[
                        { label: "Semua Status", value: "" },
                        { label: "Draft", value: "0" },
                        { label: "Published", value: "1" },
                      ]}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="md:ml-2"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </Card>

              {/* Start Table */}
              <Card>
                {/* MOBILE VERSION */}
                <div className="md:hidden flex flex-col gap-4">
                  {ekorans.data.map((item) => (
                    <div key={item.id} className="border rounded-xl p-4 bg-background shadow-sm">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <p className="font-semibold text-base">{item.title}</p>
                          <p className="text-sm text-gray-500">ID: {item.id}</p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Tanggal Terbit:</span> {formatDateTime(item.datepub)}
                        </p>
                        <p>
                          <span className="font-medium">eMagazine ID:</span> {item.emagazine_id || '-'}
                        </p>
                        <p>
                          <span className="font-medium">Dilihat:</span> {item.views || 0} kali
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4">
                        {hasPermission('edit ekoran nasional') && (
                          <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                            <Link href={route('admin.nasional.ekoran.edit', item.id)}>Edit</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP VERSION */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Judul Edisi</TableHead>
                        <TableHead>Tanggal Terbit</TableHead>
                        <TableHead>eMagz ID</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ekorans.data.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{formatDateTime(item.datepub)}</TableCell>
                          <TableCell>{item.emagazine_id || '-'}</TableCell>
                          <TableCell>{item.views || 0}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {hasPermission('edit ekoran nasional') && (
                                <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                  <Link href={route('admin.nasional.ekoran.edit', item.id)}>Edit</Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Kondisi jika data kosong */}
                      {ekorans.data.length === 0 && (
                        <TableRow>
                          <TableCell colSpan="7" className="text-center py-6 text-gray-500">
                            Tidak ada data eKoran ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Start Pagination */}
              {ekorans.data.length > 0 && <PaginationDaisy data={ekorans} />}

            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index