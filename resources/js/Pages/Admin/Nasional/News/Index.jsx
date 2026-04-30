import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime, formatNumber } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Check, Download, Link2, Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Select from "react-select";
import { toast } from 'sonner'

function Index({ news, writers, kanals, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const [writer, setWriter] = useState(() => filters.writer || '');
  const [kanal, setKanal] = useState(() => filters.kanal || '');
  const [startDate, setStartDate] = useState(() => filters.start_date || '');
  const [endDate, setEndDate] = useState(() => filters.end_date || '');
  const [copiedId, setCopiedId] = useState(null);
  const { auth } = usePage().props;
  const userPermissions = auth.permissions || [];

  // 2. Buat helper function
  const hasPermission = (permissions) => {
    if (Array.isArray(permissions)) {
      return permissions.some(permission => userPermissions.includes(permission));
    }
    return userPermissions.includes(permissions);
  };


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

  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.nasional.news.index');

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;

    // Gabungkan semua payload filter
    const queryPayload = {
      search,
      status,
      writer,
      kanal,
      start_date: startDate,
      end_date: endDate,
      page: 1
    };

    if (search !== filters.search) {
      timeout = setTimeout(() => {
        router.get(INDEX_ROUTE, queryPayload, { preserveState: true, replace: true });
      }, 400);
    } else {
      router.get(INDEX_ROUTE, queryPayload, { preserveState: true, replace: true });
    }

    return () => timeout && clearTimeout(timeout);

    // Pastikan startDate dan endDate masuk ke dependency array
  }, [search, status, writer, kanal, startDate, endDate]);


  // 3. Update fungsi Reset
  function handleReset() {
    setSearch('');
    setStatus('');
    setWriter('');
    setKanal('');
    setStartDate('');
    setEndDate('');

    router.get(
      INDEX_ROUTE,
      { search: '', status: '', writer: '', kanal: '', start_date: '', end_date: '', page: 1 },
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

  const handleExport = () => {
    // 1. Validasi Wajib Isi Tanggal
    if (!startDate || !endDate) {
      toast.error("Mohon pilih 'Dari Tanggal' dan 'Sampai Tanggal' terlebih dahulu sebelum melakukan export.");
      return; // Hentikan proses
    }

    // 2. Validasi Rentang Waktu (Maksimal 31 Hari)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 31) {
      toast.error("Rentang tanggal terlalu besar. Maksimal export adalah data untuk 31 hari.");
      return; // Hentikan proses
    }

    if (start > end) {
      toast.error("Tanggal awal tidak boleh lebih besar dari tanggal akhir.");
      return;
    }

    // 3. Eksekusi Export jika semua validasi lolos
    const queryParams = new URLSearchParams({
      search: search || '',
      status: status || '',
      writer: writer || '',
      kanal: kanal || '',
      start_date: startDate || '',
      end_date: endDate || ''
    }).toString();

    window.location.href = `${route('admin.nasional.news.export')}?${queryParams}`;
  };

  // 3. Fungsi untuk menyalin link
  const handleCopyLink = (newsItem) => {

    const url = `https://timesindonesia.co.id/${newsItem.kanal?.catnews_slug}/${newsItem.news_id}/${createSlug(newsItem.news_title)}`;

    navigator.clipboard.writeText(url)
      .then(() => {
        // Set state ke ID berita ini agar icon berubah jadi centang
        setCopiedId(newsItem.news_id);

        // Kembalikan ke icon semula setelah 2 detik
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error('Gagal menyalin link: ', err);
        alert('Gagal menyalin link.');
      });
  };


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
                  <h1 className="text-3xl font-bold text-foreground">Daftar Berita Nasional</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Beranda</a></li>
                    <li>Berita Nasional</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex gap-2">
                  {/* Button Tambah */}
                  {hasPermission('create news nasional') && (
                    <Link href={route('admin.nasional.news.create')} className="btn btn-primary rounded-lg">
                      <Plus size={16} /> Tambah Berita
                    </Link>
                  )}

                  {/* Button Export Baru */}
                  <button onClick={handleExport} className="btn btn-success text-white rounded-lg">
                    <Download size={16} /> Export Excel
                  </button>
                </div>
              </div>
              {/* End Head */}

              {/* Start Filter */}
              <Card>
                {/* Field Search And Filter */}
                <div className="flex flex-col gap-4">
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
                        value={writers.find(option => option.value === writer) || null}
                        onChange={(e) => setWriter(e.value)} />
                    </div>
                    <div className="w-full md:w-48">
                      <Select
                        options={kanals}
                        placeholder="Kanal"
                        value={kanals.find(option => option.value === kanal) || null}
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
                  </div>


                  {/* Baris 2: Date Range & Buttons */}
                  <div className="flex flex-col md:flex-row items-end gap-4 w-full md:w-auto mt-2">
                    <div className="w-full md:w-48">
                      <label className="text-xs text-gray-500 mb-1 block">Dari Tanggal</label>
                      <TextInput
                        type="date"
                        className="w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <label className="text-xs text-gray-500 mb-1 block">Sampai Tanggal</label>
                      <TextInput
                        type="date"
                        className="w-full"
                        value={endDate}
                        min={startDate} // Mencegah user memilih end_date sebelum start_date
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>

                    <button type="button" className="btn btn-neutral" onClick={handleReset}>
                      Reset Filter
                    </button>
                  </div>
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
                          <p className="font-semibold text-base">{n.news_title}</p>
                          <p className="text-sm text-gray-500">{n.news_writer}</p>
                        </div>

                        {getStatusBadge(n.news_status)}
                      </div>

                      {/* Detail */}
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Kategori:</span> {n.kanal?.catnews_title}
                        </p>
                        <p>
                          <span className="font-medium">Tanggal Publish:</span> {formatDateTime(n.news_datepub)}
                        </p>
                        <p>
                          <span className="font-medium">Headline:</span>{" "}
                          {getHeadlineBadge(n.news_headline)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        {hasPermission('edit news nasional') && (
                          <Link href={route('admin.nasional.news.edit', n.news_id)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
                        )}
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
                        <th>HL</th>
                        <th>View</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.data.map((n, index) => (
                        <tr key={n.news_id}>
                          <th>{n.news_id}</th>
                          <td>{n.news_writer}</td>
                          <td>{n.news_title}</td>
                          <td>{n.kanal?.catnews_title}</td>
                          <td>{formatDateTime(n.news_datepub)}</td>
                          <td>
                            {getHeadlineBadge(n.news_headline)}
                          </td>
                          <td>
                            {formatNumber(n.view_data?.pageviews)}
                          </td>
                          <td>
                            {getStatusBadge(n.news_status)}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              {hasPermission('edit news nasional') && (
                                <Link href={route('admin.nasional.news.edit', n.news_id)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
                              )}
                              <button
                                onClick={() => handleCopyLink(n)}
                                className="btn btn-primary btn-sm btn-outline"
                                title="Copy Link Berita"
                              >
                                {/* Logic: Jika ID cocok dengan state, tampilkan Centang Hijau. Jika tidak, tampilkan ikon Link. */}
                                {copiedId === n.news_id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Link2 className="w-4 h-4" />
                                )}
                              </button>
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