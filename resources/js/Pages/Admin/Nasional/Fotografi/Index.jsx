import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import { useAuthorization } from '@/Hooks/useAuthorization'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search, Camera, ExternalLink } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Select from "react-select";

function Index({ galleries, writers, categories, filters }) {
  const [search, setSearch] = useState(() => filters?.search || '');
  const [status, setStatus] = useState(() => filters?.status || '');
  const [writer, setWriter] = useState(() => filters?.writer || '');
  const [category, setCategory] = useState(() => filters?.category || '');

  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.nasional.fotografi.index');

  const { auth } = usePage().props;
  const userPermissions = auth.permissions || [];
  const { hasAnyRole } = useAuthorization();

  // 2. Buat helper function
  const hasPermission = (permissions) => {
    if (Array.isArray(permissions)) {
      return permissions.some(permission => userPermissions.includes(permission));
    }
    return userPermissions.includes(permissions);
  };

  useEffect(() => {
    // Lewati initial load (hindari double fetch)
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;

    // Jika search berubah → debounce
    if (search !== filters?.search) {
      timeout = setTimeout(() => {
        router.get(
          INDEX_ROUTE,
          { search, status, writer, category, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    }
    // Jika filter dropdown berubah → langsung fetch
    else {
      router.get(
        INDEX_ROUTE,
        { search, status, writer, category, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, status, writer, category]);

  function handleReset() {
    setSearch('');
    setStatus('');
    setWriter('');
    setCategory('');

    router.get(
      INDEX_ROUTE,
      { search: '', status: '', writer: '', category: '', page: 1 },
      { preserveState: true, replace: true }
    );
  }

  // URL publik galeri: https://timesindonesia.co.id/foto/{id}/{slug-judul}
  const createSlug = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const galleryUrl = (g) => `https://timesindonesia.co.id/foto/${g.gal_id}/${createSlug(g.gal_title)}`;

  function getStatusBadge(status) {
    switch (status) {
      case "pending":
      case '0':
      case 0:
        return <Badge variant="secondary">Pending</Badge>;
      case "Review":
      case '2':
      case 2:
        return <Badge className={"bg-yellow-300 text-yellow-700"}>Review</Badge>;
      case "On Pro":
      case '3':
      case 3:
        return <Badge variant="destructive">OnPro</Badge>;
      case "Publish":
      case '1':
      case 1:
        return <Badge className={"bg-green-300 text-green-700"}>Publish</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  function getHeadlineBadge(status) {
    switch (status) {
      case '1':
      case 1:
        return <Badge>ON</Badge>;
      case '0':
      case 0:
      case null:
        return <Badge variant="secondary">OFF</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }


  return (
    <>
      <Head title="Gallery Management" />
      <AuthenticatedLayout>
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="space-y-6">
              <div className='flex flex-col md:flex-row md:justify-between md:items-center'>
                {/* start Header */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar Fotografi Jurnalistik</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Fotografi Jurnalistik' }]} />
                {/* end breadcrumbs */}
              </div>

              {/* Start Head */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Button Tambah Galeri */}
                {hasPermission('create gallery nasional') && (
                  <Button asChild className="rounded-lg">
                    <Link href={route('admin.nasional.fotografi.create')}>
                      <Plus size={16} /> Tambah Galeri
                    </Link>
                  </Button>
                )}

                {hasPermission('view report gallery nasional') && (
                  <Button asChild variant="success" className="rounded-lg">
                    <Link href={route('admin.nasional.fotografi.report.index')}>
                      Report Galeri
                    </Link>
                  </Button>
                )}
              </div>
              {/* End Head */}

              {/* Start Filter */}
              <Card>
                {/* Field Search And Filter */}
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
                  {hasAnyRole(['super admin', 'admin', 'editor']) && (
                    <div className="w-full md:w-48">
                      <Select
                        options={writers}
                        value={writers?.find(w => w.value === writer) || null}
                        placeholder="Pewarta"
                        onChange={(e) => setWriter(e?.value || '')}
                        isClearable
                      />
                    </div>
                  )}

                  <div className="w-full md:w-48">
                    <Select
                      options={categories}
                      value={categories?.find(c => c.value === category) || null}
                      placeholder="Kategori"
                      onChange={(e) => setCategory(e?.value || '')}
                      isClearable
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <InputSelect
                      value={status}
                      placeholder='Status'
                      onChange={(e) => setStatus(e.target.value)}
                      options={[
                        { label: "All Status", value: "" },
                        { label: "Pending", value: "0" },
                        { label: "Review", value: "2" },
                        { label: "On Pro", value: "3" },
                        { label: "Publish", value: "1" },
                      ]}
                    />
                  </div>

                  {/* RESET BUTTON */}
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
              {/* End Filter */}

              {/* Start Table */}
              <Card padding="p-0">
                {/* MOBILE VERSION (Card Mode) */}
                <div className="md:hidden flex flex-col gap-4 p-4">
                  {galleries.data.length > 0 ? (
                    galleries.data.map((g) => (
                      <div key={g.gal_id} className="border rounded-xl p-4 bg-background shadow-sm flex flex-col gap-3">

                        {/* Header Mobile Card */}
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            {g.cover_image ? (
                              <img src={g.cover_image.gi_image} alt="cover" className="h-16 w-16 rounded-lg object-cover bg-muted" />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                                <Camera className="h-6 w-6 text-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base line-clamp-2 leading-tight mb-1">{g.gal_title}</p>
                            <p className="text-sm text-gray-500">{g.gal_pewarta || '-'}</p>
                          </div>
                        </div>

                        {/* Detail Mobile Card */}
                        <div className="text-sm space-y-2 mt-1 border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Status:</span>
                            {getStatusBadge(g.gal_status)}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Headline:</span>
                            {getHeadlineBadge(g.gal_headline)}
                          </div>
                          <p><span className="font-medium">Kategori:</span> {g.kanal?.title || '-'}</p>
                          <p><span className="font-medium">Tgl Publish:</span> {g.gal_datepub ? formatDateTime(g.gal_datepub) : '-'}</p>
                        </div>

                        {/* Actions Mobile Card */}
                        <div className="flex gap-2 mt-2 pt-2 border-t">
                          <Button asChild variant="ghost" size="sm" className="flex-1">
                            <a href={galleryUrl(g)} target="_blank" rel="noreferrer">
                              <ExternalLink size={14} /> Lihat
                            </a>
                          </Button>
                          {hasPermission('edit gallery nasional') && (
                            <Button asChild size="sm" variant="outline" className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                              <Link href={route('admin.nasional.fotografi.edit', g.gal_id)}>Edit</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-foreground/50">Tidak ada galeri ditemukan.</div>
                  )}
                </div>

                {/* DESKTOP VERSION (Table Mode) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead className="w-[60px]">Cover</TableHead>
                        <TableHead>#ID</TableHead>
                        <TableHead>Pewarta</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tanggal Publish</TableHead>
                        <TableHead>HL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {galleries.data.length > 0 ? (
                        galleries.data.map((g) => (
                          <TableRow key={g.gal_id}>
                            <TableCell>
                              {g.cover_image ? (
                                <img src={g.cover_image.gi_image} alt="cover" className="h-10 w-12 rounded object-cover bg-muted" />
                              ) : (
                                <div className="h-10 w-12 rounded bg-muted flex items-center justify-center">
                                  <Camera className="h-4 w-4 text-foreground/40" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{g.gal_id}</TableCell>
                            <TableCell>{g.gal_pewarta || '-'}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={g.gal_title}>{g.gal_title}</TableCell>
                            <TableCell>{g.kanal?.title || '-'}</TableCell>
                            <TableCell>{g.gal_datepub ? formatDateTime(g.gal_datepub) : '-'}</TableCell>
                            <TableCell>
                              {getHeadlineBadge(g.gal_headline)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(g.gal_status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button asChild variant="ghost" size="sm">
                                  <a href={galleryUrl(g)} target="_blank" rel="noreferrer" title="Lihat di situs">
                                    <ExternalLink size={14} /> Lihat
                                  </a>
                                </Button>
                                {hasPermission('edit gallery nasional') && (
                                  <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                    <Link href={route('admin.nasional.fotografi.edit', g.gal_id)}>Edit</Link>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-foreground/50">
                            Tidak ada galeri ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
              {/* End Table */}

              {/* Start Pagination */}
              <PaginationDaisy data={galleries} />
              {/* End Pagination */}

            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index