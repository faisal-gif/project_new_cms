import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ ekorans, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');

  const isFirst = useRef(true);
  
  // Sesuaikan dengan nama route Laravel Anda, contoh: 'ekoran.index'
  const INDEX_ROUTE = route('admin.nasional.ekoran.index');

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
        return <Badge variant="neutral">Unknown</Badge>;
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
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Beranda</a></li>
                    <li>eKoran</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <Link href={route('admin.nasional.ekoran.create')} className="btn btn-primary rounded-lg">
                  <Plus size={16} /> Tambah Edisi
                </Link>
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

                  <button
                    type="button"
                    className="btn btn-neutral md:ml-2"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
              </Card>

              {/* Start Table */}
              <Card>
                {/* MOBILE VERSION */}
                <div className="md:hidden flex flex-col gap-4">
                  {ekorans.data.map((item) => (
                    <div key={item.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">
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
                        <Link href={route('admin.nasional.ekoran.edit', item.id)} className="btn btn-sm btn-warning btn-outline">
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP VERSION */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Judul Edisi</th>
                        <th>Tanggal Terbit</th>
                        <th>eMagz ID</th>
                        <th>Views</th>
                        <th>Status</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ekorans.data.map((item) => (
                        <tr key={item.id}>
                          <th>{item.id}</th>
                          <td className="font-medium">{item.title}</td>
                          <td>{formatDateTime(item.datepub)}</td>
                          <td>{item.emagazine_id || '-'}</td>
                          <td>{item.views || 0}</td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('admin.nasional.ekoran.edit', item.id)} className="btn btn-sm btn-warning btn-outline">
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Kondisi jika data kosong */}
                      {ekorans.data.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-6 text-gray-500">
                            Tidak ada data eKoran ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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