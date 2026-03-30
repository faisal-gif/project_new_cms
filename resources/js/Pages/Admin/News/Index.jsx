import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Select from "react-select";

function Index({ news, writers, kanals, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [writer, setWriter] = useState(() => filters.writer || '');

  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.news.index');

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
          { search, writer, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    }
    // Jika status berubah → langsung fetch
    else {
      router.get(
        INDEX_ROUTE,
        { search, writer, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, writer]);

  function handleReset() {
    setSearch('');
    // setStatus(''); // Uncomment jika ada state status
    setWriter('');
    // setKanal(''); // Uncomment jika ada state kanal

    router.get(
      INDEX_ROUTE,
      { search: '', writer: '', page: 1 },
      { preserveState: true, replace: true }
    );
  }

  function getStatusBadge(status) {
    switch (status) {
      case "pending":
      case '0':
      case 0:
        return <span className="badge badge-secondary badge-soft">Pending</span>;
      case "Review":
      case '2':
      case 2:
        return <span className="badge badge-warning badge-soft">Review</span>;
      case "On Pro":
      case '3':
      case 3:
        return <span className="badge badge-error badge-soft">OnPro</span>;
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
      <Head title="News Management" />
      <AuthenticatedLayout>
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="space-y-6">
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
                <Link href={route('admin.news.create')} className="btn btn-primary rounded-lg">
                  <Plus size={16} /> Tambah News
                </Link>
              </div>
              {/* End Head */}

              {/* Start Filter */}
              <Card>
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
                      onChange={(e) => setWriter(e.value)} 
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

              {/* Start Table / Card Container */}
              <Card>
                {/* MOBILE VERSION (Card Mode) */}
                <div className="md:hidden flex flex-col gap-4">
                  {news.data.map((n) => (
                    <div key={n.id} className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
                      <div className="card-body p-4 sm:p-5 gap-0">
                        
                        {/* Header: Title & Status */}
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <h3 className="card-title text-base leading-snug font-bold">
                            {n.title}
                          </h3>
                          {/* <div className="flex-shrink-0 mt-1">
                            {getStatusBadge(n.status)}
                          </div> */}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/70 mb-4">
                          <span className="font-semibold text-primary">{n.writer?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{formatDateTime(n.datepub)}</span>
                        </div>

                        {/* Categories & Badges */}
                        {/* <div className="flex flex-wrap gap-2 mb-4">
                          <span className="badge badge-ghost badge-sm text-xs">
                            Kanal: {n.kanal?.name || '-'}
                          </span>
                          <span className="badge badge-ghost badge-sm text-xs flex gap-1">
                            Headline: {getHeadlineBadge(n.is_headline)}
                          </span>
                        </div> */}

                        {/* Integration Status (Daerah & Nasional) - Ditambahkan untuk menyamakan dengan tabel desktop */}
                        <div className="bg-base-200/50 rounded-lg p-3 flex flex-col gap-3 mb-4">
                          {/* Daerah */}
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-base-content/80">Distribusi Daerah</span>
                            {n.news_daerah ? (
                              <div className="text-right">
                                <span className="text-[11px] font-bold text-success block">Terindeks</span>
                                <span className="text-[10px] text-base-content/60 truncate max-w-[120px] block">
                                  {n.news_daerah.kanal?.name || 'Daerah'}
                                </span>
                              </div>
                            ) : (
                              <Link
                                href={route('admin.news.import.daerah', n.is_code)}
                                className="btn btn-xs btn-info btn-outline"
                              >
                                + Daerah
                              </Link>
                            )}
                          </div>
                          
                          <div className="border-t border-base-300"></div>
                          
                          {/* Nasional */}
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-base-content/80">Distribusi Nasional</span>
                            <Link
                              href={route('admin.news.import.nasional', n.is_code)}
                              className="btn btn-xs btn-info btn-outline"
                            >
                              + Nasional
                            </Link>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="card-actions justify-end mt-2">
                          <Link href={route('admin.news.edit', n)} className="btn btn-sm btn-warning btn-outline w-full sm:w-auto">
                            Edit News
                          </Link>
                        </div>

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
                        <th>Daerah</th>
                        <th>Nasional</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.data.map((n, index) => (
                        <tr key={n.id}>
                          <th>{n.id}</th>
                          <td>{n.writer?.name}</td>
                          <td>{n.title}</td>
                          <td>
                            {n.news_daerah ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-success">Sudah Terindeks</span>
                                <span className="text-[10px] leading-tight text-gray-600">Judul: {n.news_daerah.title}</span>
                                <span className="badge badge-xs badge-ghost italic">{n.news_daerah.kanal?.name}</span>
                                {getStatusBadge(n.news_daerah.status)}
                              </div>
                            ) : (
                              <Link
                                href={route('admin.news.import.daerah', n.is_code)}
                                className="btn btn-xs btn-info btn-outline"
                              >
                                Tidak Ada
                              </Link>
                            )}
                          </td>
                          <td>
                            <Link
                              href={route('admin.news.import.nasional', n.is_code)}
                              className="btn btn-xs btn-info btn-outline"
                            >
                              Nasional
                            </Link>
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('admin.news.edit', n)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
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