import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ networks, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.daerah.network.index');

  useEffect(() => {
    // Lewati initial load (hindari double fetch)
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;

    // Jika search berubah → debounce
    if (search !== filters.search) {
      timeout = setTimeout(() => {
        router.get(
          INDEX_ROUTE,
          { search, status, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    }
    // Jika status berubah → langsung fetch
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


  function getIsWebBadge(status) {
    switch (status) {
      case "OFF":
      case '0':
      case true:
        return <Badge variant='secondary'>OFF</Badge>;

      case "ON":
      case "1":
      case false:
        return <Badge className="badge badge-primary badge-soft">ON</Badge>;

      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  }


  return (
    <>
      <Head title="Network Management" />
      <AuthenticatedLayout >
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


            <div className=" space-y-6">
              <div className='flex flex-row justify-between items-center'>
                {/* start Header */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar Network Daerah</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>Network</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Button Tambah User */}
                  <Link href={route('admin.daerah.network.create')} className="btn btn-primary rounded-lg">
                    <Plus size={16} /> Tambah Network
                  </Link>

                  {/* Field Search And Filter */}
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-80">
                      <InputWithPrefix
                        prefix={<Search size={16} />}
                        placeholder="Search user..."
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
                  {networks.data.map((network) => (
                    <div key={network.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-base">{network.title}</p>
                          <p className="text-sm text-gray-500">{network.domain}</p>
                        </div>

                        {getStatusBadge(network.status)}
                      </div>

                      {/* Detail */}
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">City:</span> {network.name}
                        </p>
                        <p>
                          <span className="font-medium">Analytic ID:</span> {network.analytics}
                        </p>
                        <p>
                          <span className="font-medium">Web Status:</span>{" "}
                          {getIsWebBadge(network.is_web)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link href={route('admin.daerah.network.edit', network)} className="btn btn-sm btn-warning btn-outline">Edit</Link>

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
                        <th>Name</th>
                        <th>Domain</th>
                        <th>City</th>
                        <th>Analytic ID</th>
                        <th>Web Status</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {networks.data.map((network, index) => (
                        <tr key={network.id}>
                          <th>{index + 1}</th>
                          <td>{network.title}</td>
                          <td>{network.domain}</td>
                          <td>{network.name}</td>
                          <td>{network.analytics}</td>
                          <td>
                            {getIsWebBadge(network.is_web)}
                          </td>
                          <td>
                            {getStatusBadge(network.status)}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('admin.daerah.network.edit', network)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
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
              <PaginationDaisy data={networks} />
              {/* End Pagination */}


            </div>


          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index