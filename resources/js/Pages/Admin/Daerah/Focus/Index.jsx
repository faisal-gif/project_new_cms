import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ focus, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.daerah.fokus.index');

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      router.get(
        INDEX_ROUTE,
        { search, status, page: 1 },
        { preserveState: true, replace: true }
      );
    }, 400);

    return () => clearTimeout(timeout);
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


  return (
    <>
      <Head title="Fokus Management" />
      <AuthenticatedLayout >
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


            <div className=" space-y-6">
              <div className='flex flex-row justify-between items-center'>
                {/* start Header */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar Fokus Daerah</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>Daerah</li>
                    <li>Fokus</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Button Tambah User */}
                  <Link href={route('admin.daerah.fokus.create')} className="btn btn-primary rounded-lg">
                    <Plus size={16} /> Tambah Fokus
                  </Link>

                  {/* Field Search And Filter */}
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-80">
                      <InputWithPrefix
                        prefix={<Search size={16} />}
                        placeholder="Search fokus..."
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
                  {focus.data.map((fokus) => (
                    <div key={fokus.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                      {/* Header (Nama + Status) */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-base">{fokus.name}</p>
                          <p className="text-sm text-gray-500">{formatDate(fokus.created_at)}</p>
                        </div>

                        {getStatusBadge(fokus.status)}
                      </div>



                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link href={route('admin.daerah.fokus.edit', fokus)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP VERSION (Table Mode) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="table table-zebra">

                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {focus.data.map((fokus, index) => (
                        <tr key={fokus.id}>
                          <th>{index + 1}</th>
                          <td>{fokus.name}</td>
                          <td>{formatDate(fokus.created_at)}</td>
                          <td>
                            {getStatusBadge(fokus.status)}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('admin.daerah.fokus.edit', fokus)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

              </Card>
              {/* End Table */}

              {/* Start Pagination */}
              <PaginationDaisy data={focus} />
              {/* End Pagination */}


            </div>


          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index