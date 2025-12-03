import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { PinIcon, PinOffIcon, Plus, PlusIcon, Search, SquarePen } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Select from "react-select";


function Index({ history, filters, optionUser }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [action, setAction] = useState(() => filters.action || '');
  const [user, setUser] = useState(() => filters.user || '');

  // Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        route('admin.history.index'),
        { search, action, user, page: 1 },
        { preserveState: true, replace: true }
      );
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // Filter Status 
  useEffect(() => {
    router.get(
      route('admin.history.index'),
      { search, action, user, page: 1 },
      { preserveState: true, replace: true }
    );
  }, [action]);

  // Filter User
  useEffect(() => {
    router.get(
      route('admin.history.index'),
      { search, action, user, page: 1 },
      { preserveState: true, replace: true }
    );
  }, [user]); 




  function getActionBadge(aksi) {
    switch (aksi) {
      case 'add':
        return <span className="badge badge-primary badge-soft font-semibold"><PlusIcon className='w-3 h-3 ' /> Tambah</span>;
      case 'edit':
        return <span className="badge badge-warning badge-soft font-semibold"><SquarePen className='w-3 h-3' /> Edit</span>;
      case 'pin':
        return <span className="badge badge-secondary badge-soft"><PinIcon className='w-3 h-3' /> Pin</span>;
      case 'unpin':
        return <span className="badge badge-secondary badge-soft"><PinOffIcon className='w-3 h-3' /> Unpin</span>;


      default:
        return <span className="badge badge-neutral badge-soft">Unknown</span>;
    }
  }


  return (
    <>
      <Head title="User Management" />
      <AuthenticatedLayout >
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


            <div className=" space-y-6">
              <div className='flex flex-row justify-between items-center'>
                {/* start Header */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Log Aktivitas</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>History</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-4">

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
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        options={[
                          { label: "Tambah", value: "add" },
                          { label: "Edit", value: "edit" },
                          { label: "Pin", value: "pin" },
                          { label: "Unpin", value: "unpin" },
                        ]}
                      />
                    </div>
                    <div className='w-full md:w-48'>
                      <Select
                        options={optionUser}
                        onChange={(e) => setUser(e.value)} />
                    </div>
                  </div>

                </div>
              </Card>
              {/* End Head */}

              {/* Start Table */}
              <Card>


                {/* DESKTOP VERSION (Table Mode) */}
                <div className="overflow-x-auto">
                  <table className="table table-zebra">

                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>User</th>
                        <th>Aksi</th>
                        <th>Target</th>
                        <th>Tipe</th>

                      </tr>
                    </thead>
                    <tbody>
                      {history.data.map((log, index) => (
                        <tr key={log.id}>
                          <td>{formatDateTime(log.created_at)}</td>
                          <td>{log.user.full_name}</td>
                          <td>{getActionBadge(log.action)}</td>
                          <td>{log.target}</td>
                          <td><span className='badge badge-soft badge-secondary'>
                            {log.tipe}
                          </span></td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>

              </Card>
              {/* End Table */}

              {/* Start Pagination */}
              <PaginationDaisy data={history} />
              {/* End Pagination */}


            </div>


          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index