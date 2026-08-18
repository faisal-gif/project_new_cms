import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ ads_locates, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const [type, setType] = useState(() => filters.type || '');
  const INDEX_ROUTE = route('admin.daerah.adsLocate.index');
  // Debounce Search
  const isFirstRender = useRef(true);

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
    // Lewati eksekusi pada render pertama
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      router.get(
        INDEX_ROUTE,
        { search, status, type, page: 1 },
        {
          preserveState: true,
          preserveScroll: true, // Tambahan: Mencegah scroll melompat ke atas saat ketik
          replace: true
        }
      );
    }, 400);

    // Cleanup function untuk menghapus timeout jika user mengetik lagi 
    // atau jika komponen dilepas (unmount) sebelum 400ms selesai
    return () => clearTimeout(timeout);
  }, [search]);

  // Filter Status langsung jalan
  useEffect(() => {
    router.get(
      INDEX_ROUTE,
      { search, status, type, page: 1 },
      { preserveState: true, replace: true }
    );
  }, [status]);

  // Filter Status langsung jalan
  useEffect(() => {
    router.get(
      INDEX_ROUTE,
      { search, status, type, page: 1 },
      { preserveState: true, replace: true }
    );
  }, [type]);

  function getStatusBadge(status) {
    switch (status) {
      case "active":
      case '1':
      case 1:
      case true:
        return <Badge className="bg-green-300 text-green-700">Active</Badge>;

      case "inactive":
      case "0":
      case 0:
      case false:
        return <Badge className="bg-destructive">Inactive</Badge>;

      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  function getTypeBadge(type) {
    switch (type) {
      case "mobile":
      case 'm':
        return <Badge className="bg-primary">Mobile</Badge>;

      case "desktop":
      case "d":
        return <Badge className="bg-amber-500 text-white">Desktop</Badge>;

      case "testimonial":
      case "t":
        return <Badge variant="destructive">Testimonial</Badge>;

      default:
        return <Badge variant="secondary">{type}</Badge>;
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
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Ads Locate' }]} />
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Button Tambah User */}
                  {hasPermission('create ads daerah location') && (
                    <Button asChild className="rounded-lg">
                      <Link href={route('admin.daerah.adsLocate.create')}>
                        <Plus size={16} /> Tambah Ads Locate
                      </Link>
                    </Button>
                  )}


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
                  <Table>

                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads_locates.data.map((ads_locate, index) => (
                        <TableRow key={ads_locate.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{ads_locate.name}</TableCell>
                          <TableCell>
                            {getTypeBadge(ads_locate.type)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(ads_locate.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {hasPermission('edit ads daerah location') && (
                                <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                  <Link href={route('admin.daerah.adsLocate.edit', ads_locate)}>Edit</Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>

                  </Table>
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