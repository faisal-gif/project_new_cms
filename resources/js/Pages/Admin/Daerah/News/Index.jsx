import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Select from "react-select";

function Index({ news, writers, kanals, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const [writer, setWriter] = useState(() => filters.writer || '');
  const [kanal, setKanal] = useState(() => filters.kanal || '');


  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.daerah.news.index');

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
          { search, status, writer, kanal, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    }
    // Jika status berubah → langsung fetch
    else {
      router.get(
        INDEX_ROUTE,
        { search, status, writer, kanal, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, status, writer, kanal]);

  function handleReset() {
    setSearch('');
    setStatus('');
    setWriter('');
    setKanal('');

    router.get(
      INDEX_ROUTE,
      { search: '', status: '', writer: '', kanal: '', page: 1 },
      { preserveState: true, replace: true }
    );
  }


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
        return <Badge variant="neutral">{status}</Badge>;
    }
  }

  function getHeadlineBadge(status) {
    switch (status) {
      case '1':
      case 1:
        return <Badge className="badge badge-primary badge-soft">ON</Badge>;
      case '0':
      case 0:
      case null:
        return <Badge variant="secondary">OFF</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  }


  return (
    <>
      <Head title="News Management" />
      <AuthenticatedLayout >
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


            <div className=" space-y-6">
              <div className='flex flex-row justify-between items-center'>
                {/* start Header */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar News</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>News</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Button Tambah User */}
                <Link href={route('admin.daerah.news.create')} className="btn btn-primary rounded-lg">
                  <Plus size={16} /> Tambah News
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
                      placeholder="Search Title and Id..."
                      className='w-full'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <Select
                      options={writers}
                      placeholder="Penulis"
                      onChange={(e) => setWriter(e.value)} />
                  </div>
                  <div className="w-full md:w-48">
                    <Select
                      options={kanals}
                      placeholder="Kanal"
                      onChange={(e) => setKanal(e.value)} />
                  </div>
                  <div className="w-full md:w-48">
                    <InputSelect
                      value={status}
                      placeholder='Status'
                      onChange={(e) => setStatus(e.target.value)}
                      options={[
                        { label: "All", value: "" },
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
              <Card>
                {/* MOBILE VERSION (Card Mode) */}
                <div className="md:hidden flex flex-col gap-4">
                  {/* Contoh data, ganti dengan data.map(...) */}
                  {news.data.map((n) => (
                    <div key={n.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                      {/* Header */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <p className="font-semibold text-base">{n.title}</p>
                          <p className="text-sm text-gray-500">{n.writer?.name}</p>
                        </div>

                        {getStatusBadge(n.status)}
                      </div>

                      {/* Detail */}
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Kategori:</span> {n.kanal?.name}
                        </p>
                        <p>
                          <span className="font-medium">Tanggal Publish:</span> {formatDateTime(n.datepub)}
                        </p>
                        <p>
                          <span className="font-medium">Headline:</span>{" "}
                          {getHeadlineBadge(n.is_headline)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link href={route('admin.daerah.news.edit', n)} className="btn btn-sm btn-warning btn-outline">Edit</Link>

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
                        <th>Penulis</th>
                        <th>Judul</th>
                        <th>Kanal</th>
                        <th>Tanggal Publish</th>
                        <th>View</th>
                        <th>HL</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.data.map((n, index) => (
                        <tr key={n.id}>
                          <th>{n.id}</th>
                          <td>{n.writer?.name}</td>
                          <td>{n.title}</td>
                          <td>{n.kanal?.name}</td>
                          <td>{n.datepub}</td>
                          <td>{n.view}</td>
                          <td>
                            {getHeadlineBadge(n.is_headline)}
                          </td>
                          <td>
                            {getStatusBadge(n.status)}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('admin.daerah.news.edit', n)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
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
              <PaginationDaisy data={news} />
              {/* End Pagination */}


            </div>


          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index