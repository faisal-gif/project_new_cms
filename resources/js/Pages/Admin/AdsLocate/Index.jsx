import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'

function Index({ ads_locates, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const [type, setType] = useState(() => filters.type || '');

  // Debounce Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        route('admin.ads.locate.index'),
        { search, status, type, page: 1 },
        { preserveState: true, replace: true }
      );
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // Filter Status langsung jalan
  useEffect(() => {
    router.get(
      route('admin.ads.locate.index'),
      { search, status, type, page: 1 },
      { preserveState: true, replace: true }
    );
  }, [status]);

  // Filter Status langsung jalan
  useEffect(() => {
    router.get(
      route('admin.ads.locate.index'),
      { search, status, type, page: 1 },
      { preserveState: true, replace: true }
    );
  }, [type]);

  function getStatusBadge(status) {
    switch (status) {
      case "active":
      case '1':
      case true:
        return <span className="badge badge-success badge-soft">Active</span>;

      case "inactive":
      case "0":
      case false:
        return <span className="badge badge-error badge-soft">Inactive</span>;

      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  }

  function getTypeBadge(type) {
    switch (type) {
      case "mobile":
      case 'm':
        return <span className="badge badge-primary badge-soft">Mobile</span>;

      case "desktop":
      case "d":
        return <span className="badge badge-warning badge-soft">Desktop</span>;

      case "testimonial":
      case "t":
        return <span className="badge badge-error badge-soft">Testimonial</span>;

      default:
        return <span className="badge badge-neutral">{type}</span>;
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
                  <h1 className="text-3xl font-bold text-foreground">Daftar Ads Locate</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>Ads Locate</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Button Tambah User */}
                  <Link href={route('admin.ads.locate.create')} className="btn btn-primary rounded-lg">
                    <Plus size={16} /> Tambah Ads Locate
                  </Link>

                  {/* Field Search And Filter */}
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-80">
                      <InputWithPrefix
                        prefix={<Search size={16} />}
                        placeholder="Search Ads Locate..."
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
                          { label: "Inactive", value: "0" },
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
                {/* DESKTOP VERSION (Table Mode) */}
                <div className=" overflow-x-auto">
                  <table className="table table-zebra">

                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ads_locates.data.map((ads_locate, index) => (
                        <tr key={ads_locate.id}>
                          <th>{index + 1}</th>
                          <td>{ads_locate.name}</td>
                          <td>
                            {getTypeBadge(ads_locate.type)}
                          </td>
                          <td>
                            {getStatusBadge(ads_locate.status)}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('admin.ads.locate.edit', ads_locate)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
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
              <PaginationDaisy data={ads_locates} />
              {/* End Pagination */}


            </div>


          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index