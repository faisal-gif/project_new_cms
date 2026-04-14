import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { Plus, Search, Camera } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Select from "react-select";

function Index({ galleries, writers, categories, filters }) {
  const [search, setSearch] = useState(() => filters?.search || '');
  const [status, setStatus] = useState(() => filters?.status || '');
  const [writer, setWriter] = useState(() => filters?.writer || '');
  const [category, setCategory] = useState(() => filters?.category || '');

  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.nasional.fotografi.index');

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

  function getStatusBadge(status) {
    switch (status) {
      case "pending":
      case '0':
      case 0:
        return <span className="badge badge-secondary badge-soft">Pending</span>;

      case "review":
      case "Review":
      case '2':
      case 2:
        return <span className="badge badge-warning badge-soft">Review</span>;

      case "on_pro":
      case "On Pro":
      case '3':
      case 3:
        return <span className="badge badge-error badge-soft">OnPro</span>;

      case "publish":
      case "Publish":
      case '1':
      case 1:
        return <span className="badge badge-success badge-soft">Publish</span>;

      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  }

  function getHeadlineBadge(status) {
    switch (status) {
      case '1':
      case 1:
        return <span className="badge badge-primary badge-soft">ON</span>;

      case '0':
      case 0:
      case null:
        return <span className="badge badge-secondary badge-soft">OFF</span>;

      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  }

  return (
    <>
      <Head title="Gallery Management" />
      <AuthenticatedLayout>
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="space-y-6">
              <div className='flex flex-row justify-between items-center'>
                {/* start Header */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar Fotografi Jurnalistik</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Beranda</a></li>
                    <li>Fotografi Jurnalistik</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}
              </div>

              {/* Start Head */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Button Tambah Galeri */}
                <Link href={route('admin.nasional.fotografi.create')} className="btn btn-primary rounded-lg">
                  <Plus size={16} /> Tambah Galeri
                </Link>
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
                  <div className="w-full md:w-48">
                    <Select
                      options={writers}
                      value={writers?.find(w => w.value === writer) || null}
                      placeholder="Pewarta"
                      onChange={(e) => setWriter(e?.value || '')} 
                      isClearable
                    />
                  </div>
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
                  <button
                    type="button"
                    className="btn btn-neutral md:ml-2"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </Card>
              {/* End Filter */}

              {/* Start Table */}
              <Card padding="p-0">
                {/* MOBILE VERSION (Card Mode) */}
                <div className="md:hidden flex flex-col gap-4 p-4">
                  {galleries.data.length > 0 ? (
                    galleries.data.map((g) => (
                      <div key={g.gal_id} className="border rounded-xl p-4 bg-base-100 shadow-sm flex flex-col gap-3">
                        
                        {/* Header Mobile Card */}
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            {g.cover_image ? (
                              <img src={g.cover_image.gi_image} alt="cover" className="h-16 w-16 rounded-lg object-cover bg-base-200" />
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-base-200 flex items-center justify-center">
                                <Camera className="h-6 w-6 text-base-content/40" />
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
                          <Link href={route('admin.nasional.fotografi.edit', g.gal_id)} className="btn btn-sm btn-warning btn-outline flex-1">
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-base-content/50">Tidak ada galeri ditemukan.</div>
                  )}
                </div>

                {/* DESKTOP VERSION (Table Mode) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="bg-base-200">
                        <th className="w-[60px]">Cover</th>
                        <th>#ID</th>
                        <th>Pewarta</th>
                        <th>Judul</th>
                        <th>Kategori</th>
                        <th>Tanggal Publish</th>
                        <th>HL</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {galleries.data.length > 0 ? (
                        galleries.data.map((g) => (
                          <tr key={g.gal_id}>
                            <td>
                              {g.cover_image ? (
                                <img src={g.cover_image.gi_image} alt="cover" className="h-10 w-12 rounded object-cover bg-base-200" />
                              ) : (
                                <div className="h-10 w-12 rounded bg-base-200 flex items-center justify-center">
                                  <Camera className="h-4 w-4 text-base-content/40" />
                                </div>
                              )}
                            </td>
                            <th>{g.gal_id}</th>
                            <td>{g.gal_pewarta || '-'}</td>
                            <td className="max-w-[200px] truncate" title={g.gal_title}>{g.gal_title}</td>
                            <td>{g.kanal?.title || '-'}</td>
                            <td>{g.gal_datepub ? formatDateTime(g.gal_datepub) : '-'}</td>
                            <td>
                              {getHeadlineBadge(g.gal_headline)}
                            </td>
                            <td>
                              {getStatusBadge(g.gal_status)}
                            </td>
                            <td>
                              <div className="flex justify-end gap-2">
                                <Link href={route('admin.nasional.fotografi.edit', g.gal_id)} className="btn btn-sm btn-warning btn-outline">
                                  Edit
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-base-content/50">
                            Tidak ada galeri ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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