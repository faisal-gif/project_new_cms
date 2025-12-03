import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'

function Index({ users, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');

  // Debounce Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        route('admin.users.index'),
        { search, status, page: 1 },
        { preserveState: true, replace: true }
      );
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // Filter Status langsung jalan
  useEffect(() => {
    router.get(
      route('admin.users.index'),
      { search, status, page: 1 },
      { preserveState: true, replace: true }
    );
  }, [status]);

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

  function getRoleBadge(status) {
    switch (status) {
      case 1:
        return <span className="badge badge-primary badge-soft">Admin</span>;

      case 3:
        return <span className="badge badge-warning badge-soft">Editor</span>;

      case 2:
        return <span className="badge badge-secondary badge-soft">Publisher</span>;

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
                  <h1 className="text-3xl font-bold text-foreground">Daftar User</h1>
                </div>
                {/* end Header */}

                {/* start breadcrumbs */}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><a>Home</a></li>
                    <li>User</li>
                  </ul>
                </div>
                {/* end breadcrumbs */}

              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Button Tambah User */}
                  <Link href={route('admin.users.create')} className="btn btn-primary rounded-lg">
                    <Plus size={16} /> Tambah User
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
                  {users.data.map((user) => (
                    <div key={user.id} className="border rounded-xl p-4 bg-base-100 shadow-sm">

                      {/* Header (Nama + Status) */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-base">{user.full_name}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>

                        {getStatusBadge(user.status)}
                      </div>

                      {/* Detail */}
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Role:</span> {getRoleBadge(user.role)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link href={route('admin.users.edit', user)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
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
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.data.map((user, index) => (
                        <tr key={user.id}>
                          <th>{index + 1}</th>
                          <td>{user.full_name}</td>
                          <td>@{user.username}</td>
                          <td>{user.email}</td>
                          <td>{getRoleBadge(user.role)}</td>
                          <td>
                            {getStatusBadge(user.status)}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <Link href={route('admin.users.edit', user)} className="btn btn-sm btn-warning btn-outline">Edit</Link>
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
              <PaginationDaisy data={users} />
              {/* End Pagination */}


            </div>


          </div>
        </div>
      </AuthenticatedLayout>
    </>
  )
}

export default Index