import Breadcrumbs from '@/Components/Breadcrumbs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import TextInput from '@/Components/TextInput'
import InputLabel from '@/Components/InputLabel'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

// Import Shadcn Modal Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";

function Index({ permissions, categories, filters }) {
  // ===== STATE FILTER & SEARCH =====
  const [search, setSearch] = useState(() => filters.search || '');
  const [category, setCategory] = useState(() => filters.category || '');
  const isFirst = useRef(true);
  const INDEX_ROUTE = route('admin.permissions.index');

  // ===== STATE MODAL (ADD/EDIT FORM) =====
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // ===== STATE ALERT MODAL (DELETE) =====
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);

  const { auth } = usePage().props;
  const userPermissions = auth.permissions || [];

  // 2. Buat helper function
  const hasPermission = (permissions) => {
    if (Array.isArray(permissions)) {
      return permissions.some(permission => userPermissions.includes(permission));
    }
    return userPermissions.includes(permissions);
  };

  // ===== INERTIA FORM =====
  const { data, setData, post, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
    name: '',
    category: ''
  });

  useEffect(() => {
    // Skip initial load
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    let timeout = null;

    if (search !== filters.search) {
      timeout = setTimeout(() => {
        router.get(
          INDEX_ROUTE,
          { search, category, page: 1 },
          { preserveState: true, replace: true }
        );
      }, 400);
    } else {
      router.get(
        INDEX_ROUTE,
        { search, category, page: 1 },
        { preserveState: true, replace: true }
      );
    }

    return () => timeout && clearTimeout(timeout);
  }, [search, category]);

  // ===== HANDLER MODAL FORM =====
  const openAddModal = () => {
    setIsEditMode(false);
    reset();
    setData({
      name: '',
      category: ''
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const openEditModal = (permission) => {
    setIsEditMode(true);
    setSelectedId(permission.id);
    setData({
      name: permission.name,
      category: permission.category || ''
    });
    clearErrors();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => reset(), 300); // Reset form setelah animasi modal selesai
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      put(route('admin.permissions.update', selectedId), {
        onSuccess: () => closeDialog(),
      });
    } else {
      post(route('admin.permissions.store'), {
        onSuccess: () => closeDialog(),
      });
    }
  };


  return (
    <>
      <Head title="Permission Management" />
      <AuthenticatedLayout >
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className=" space-y-6">
              <div className='flex flex-row justify-between items-center'>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Daftar Permission</h1>
                </div>
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Permission' }]} />
              </div>

              {/* Start Head */}
              <Card>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Button Tambah Permission diubah menjadi onClick trigger */}
                  {hasPermission('create permission master') && (
                    <Button onClick={openAddModal} className="rounded-lg">
                      <Plus size={16} /> Tambah Permission
                    </Button>
                  )}

                  {/* Field Search And Filter */}
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-80">
                      <InputWithPrefix
                        prefix={<Search size={16} />}
                        placeholder="Search permission..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <InputSelect
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        options={categories.map((cat) => ({ label: cat.label, value: cat.value }))}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Start Table */}
              <Card>
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Nama Permission</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.data.map((permission, index) => (
                        <TableRow key={permission.id}>
                          <TableCell>{index + 1 + (permissions.current_page - 1) * permissions.per_page}</TableCell>
                          <TableCell className="font-mono text-sm">{permission.name}</TableCell>
                          <TableCell>
                            {permission.category ? (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                {permission.category}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm italic">Uncategorized</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              {hasPermission('edit permission master') && (
                                <Button size="sm" variant="outline" onClick={() => openEditModal(permission)} className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/60 dark:text-amber-400 dark:hover:bg-amber-950/40">
                                  <Edit size={16} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {permissions.data.length === 0 && (
                        <TableRow>
                          <TableCell colSpan="4" className="text-center py-6 text-gray-500">Tidak ada data permission ditemukan.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Start Pagination */}
              <PaginationDaisy data={permissions} />
            </div>
          </div>
        </div>

        {/* ================= SHADCN DIALOG (FORM ADD & EDIT) ================= */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Permission' : 'Tambah Permission Baru'}</DialogTitle>
              <DialogDescription>
                Kelola data otoritas sistem. Pastikan penamaan sesuai dengan standar kode Anda.
              </DialogDescription>
            </DialogHeader>

            {/* Peringatan khusus saat mode Edit */}
            {isEditMode && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-2 text-sm text-yellow-800 flex items-start gap-2">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>Hati-hati! Mengubah nama permission dapat menyebabkan error jika kode <strong>{data.name}</strong> sudah digunakan (hardcoded) di sistem.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <InputLabel htmlFor="category" value="Kategori" />
                <TextInput
                  id="category"
                  type="text"
                  className={`w-full ${errors.category ? 'border-destructive' : ''}`}
                  placeholder="Misal: Nasional, Daerah, Ads"
                  value={data.category}
                  onChange={e => setData('category', e.target.value)}
                  list="category-list"
                />
                {/* Datalist untuk autocomplete kategori yang sudah ada */}
                <datalist id="category-list">
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat.value} />
                  ))}
                </datalist>
                {errors.category && <span className="text-sm text-red-500">{errors.category}</span>}
              </div>

              <div className="space-y-2">
                <InputLabel htmlFor="name" value="Nama Permission" />
                <TextInput
                  id="name"
                  type="text"
                  className={`w-full font-mono text-sm ${errors.name ? 'border-destructive' : ''}`}
                  placeholder="contoh: edit berita nasional"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                />
                {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={closeDialog}>Batal</Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>



      </AuthenticatedLayout>
    </>
  )
}

export default Index