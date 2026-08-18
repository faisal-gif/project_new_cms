import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Plus, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ users, filters }) {
  const [search, setSearch] = useState(() => filters.search || '');
  const [status, setStatus] = useState(() => filters.status || '');
  const [role, setRole] = useState(() => filters.role || '');
  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.users.index');
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
    // Skip initial load
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;

    // Search → debounce
    if (search !== filters.search) {
      timeout = setTimeout(() => {
        router.get(
          INDEX_ROUTE,
          { search, status, role, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    }
    // Status → langsung request
    else {
      router.get(
        INDEX_ROUTE,
        { search, status, role, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, status, role]);

  function getStatusBadge(status) {
    switch (status) {
      case "active":
      case '1':
      case true:
        return <Badge className="bg-emerald-500 text-white">Active</Badge>;

      case "inactive":
      case "0":
      case false:
        return <Badge className="bg-destructive text-white">Inactive</Badge>;

      default:
        return <Badge className="bg-neutral-700 text-white">{status}</Badge>;
    }
  }

  function getRoleBadge(status) {
    switch (status) {
      case 1:
        return <Badge className="bg-primary text-white">Admin</Badge>;

      case 3:
        return <Badge className="bg-amber-500 text-white">Editor</Badge>;

      case 2:
        return <Badge className="bg-secondary text-black">Publisher</Badge>;

      case 4:
        return <Badge className="bg-destructive text-white">Fotografer</Badge>;

      default:
        return <Badge className="bg-neutral-700 text-white">Unknown</Badge>;
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

                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'User' }]} />

              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Button Tambah User */}
                  {hasPermission('create users master') && (
                    <Button asChild className="rounded-lg">
                      <Link href={route('admin.users.create')}>
                        <Plus size={16} /> Tambah User
                      </Link>
                    </Button>
                  )}

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
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        options={[
                          { label: "All Roles", value: "" },
                          { label: "Admin", value: "1" },
                          { label: "Editor", value: "3" },
                          { label: "Publisher", value: "2" },
                          { label: "Fotografer", value: "4" },
                        ]}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <InputSelect
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        options={[
                          { label: "All Statuses", value: "" },
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
                    <div key={user.id} className="border rounded-xl p-4 bg-background shadow-sm">

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
                      {hasPermission('edit users master') && (
                        <div className="flex gap-2 mt-4">
                          <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                            <Link href={route('admin.users.edit', user)}>Edit</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* DESKTOP VERSION (Table Mode) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>

                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>New Roles</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.data.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>@{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.roles.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                  <Badge key={role.name} className="bg-sky-500 text-white uppercase">
                                    {role.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(user.status)}
                          </TableCell>
                          {hasPermission('edit users master') && (
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                            <Link href={route('admin.users.edit', user)}>Edit</Link>
                          </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>

                  </Table>
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