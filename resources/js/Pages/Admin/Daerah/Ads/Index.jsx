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

function Index({ ads_daerah, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const [type, setType] = useState(() => filters.type || '');
  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.daerah.ads.index');




  useEffect(() => {
    // Skip initial load
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;

    // Debounce hanya untuk search
    if (search !== filters.search) {
      timeout = setTimeout(() => {
        router.get(
          INDEX_ROUTE,
          { search, status, type, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    } else {
      // status & type langsung fetch
      router.get(
        INDEX_ROUTE,
        { search, status, type, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, status, type]);

  function getStatusBadge(status) {
    switch (status) {
      case "active":
      case '1':
      case 1:
      case true:
        return <Badge className="bg-green-300 text-green-700">Active</Badge>;

      case "inactive":
      case "2":
      case 2:
      case false:
        return <Badge className="bg-destructive">Inactive</Badge>;

      default:
        return <Badge className="bg-neutral">{status}</Badge>;
    }
  }

  function getTypeBadge(type) {
    switch (type) {
      case "mobile":
      case 'm':
        return <Badge className="bg-primary">Mobile</Badge>;

      case "desktop":
      case "d":
        return <Badge className="bg-warning">Desktop</Badge>;

      case "testimonial":
      case "t":
        return <Badge className="bg-error">Testimonial</Badge>;

      default:
        return <Badge className="bg-neutral">{type}</Badge>;
    }
  }



  return (
    <>
      <Head title="Ads Locate Management" />
      <AuthenticatedLayout >
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


            <div className=" space-y-6">
              <div className='flex flex-row justify-between items-center'>
                {/* start Header */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar Ads Daerah</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>Ads Daerah</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Button Tambah User */}
                  <Link href={route('admin.daerah.ads.create')} className="btn btn-primary rounded-lg">
                    <Plus size={16} /> Tambah Ads Daerah
                  </Link>

                  {/* Field Search And Filter */}
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-80">
                      <InputWithPrefix
                        prefix={<Search size={16} />}
                        placeholder="Search Ads Daerah..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <InputSelect
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        options={[
                          { label: "All", value: "" },
                          { label: "Active", value: "1" },
                          { label: "Inactive", value: "2" },
                        ]}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <InputSelect
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        options={[
                          { label: "All", value: "" },
                          { label: "Desktop", value: "d" },
                          { label: "Mobile", value: "m" },
                          { label: "Testimonial", value: "t" },
                        ]}
                      />
                    </div>
                  </div>

                </div>
              </Card>
              {/* End Head */}

              {/* Start Table */}
              <Card>
                <div className="md:hidden flex flex-col gap-4">
                  {/* Contoh data, ganti dengan data.map(...) */}
                  {ads_daerah.data.map((ad) => (
                    <div key={ad.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                      {/* Header (Nama + Status) */}
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className='flex flex-col gap-2'>
                          <p className="font-semibold text-sm line-clamp-1 md:line-clamp-none">{ad.title}</p>
                          <p className="text-sm">{getTypeBadge(ad.type)}</p>
                          <p className='text-xs text-gray-500'>{ad.ads_locate.name}</p>
                        </div>

                        {getStatusBadge(ad.status)}
                      </div>

                      
                      {/* Detail */}
                      <div className="text-sm space-y-1"> 
                        <p><span className="font-medium">Date Start:</span> {formatDate(ad.datestart)}</p>
                        <p><span className="font-medium">Date End:</span> {formatDate(ad.dateend)}</p>
                      </div>




                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link href={route('admin.daerah.ads.edit', ad)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
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
                        <th>Judul</th>
                        <th>Date Start</th>
                        <th>Date End</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ads_daerah.data.map((ad, index) => (
                        <tr key={ad.id}>
                          <th>{index + 1}</th>
                          <td className='flex flex-col gap-2'>
                            <strong>{ad.title}</strong>
                            {getTypeBadge(ad.type)}
                            <small>{ad.ads_locate.name}</small>
                          </td>
                          <td>{formatDate(ad.datestart)}</td>
                          <td>{formatDate(ad.dateend)}</td>
                          <td>
                            {getStatusBadge(ad.status)}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('admin.daerah.ads.edit', ad)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
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
              <PaginationDaisy data={ads_daerah} />
              {/* End Pagination */}


            </div>


          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index