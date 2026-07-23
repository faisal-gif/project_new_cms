import Card from '@/Components/Card'
import InputSelect from '@/Components/InputSelect'
import InputWithPrefix from '@/Components/InputWithPrefix'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import TextInput from '@/Components/TextInput'
import InputLabel from '@/Components/InputLabel'
import InputError from '@/Components/InputError'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDate } from '@/Utils/formatter'
import { Head, router, useForm } from '@inertiajs/react'
import { Search, Truck, Edit, Package, MapPin } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

function Index({ shipments, filters }) {
    const [search, setSearch] = useState(() => filters.search || '');
    const [statusFilter, setStatusFilter] = useState(() => filters.status || '');
    const isFirst = useRef(true);
    const INDEX_ROUTE = route('admin.kopi-times.shipments.index');

    // Setup Form untuk Update Status & Resi
    const [selectedShipment, setSelectedShipment] = useState(null);
    const { data, setData, put, processing, errors, reset } = useForm({
        status: '',
        tracking_number: '',
    });

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        let timeout = setTimeout(() => {
            router.get(
                INDEX_ROUTE,
                { search, status: statusFilter, page: 1 },
                { preserveState: true, replace: true }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, statusFilter]);

    // Fungsi membuka modal dan mengisi data bawaan
    const openEditModal = (item) => {
        setSelectedShipment(item);
        setData({
            status: item.status,
            tracking_number: item.tracking_number || '',
        });
        document.getElementById('modal_edit_shipment').showModal();
    };

    // Fungsi submit update data
    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('admin.kopi-times.shipments.update', selectedShipment.id), {
            onSuccess: () => {
                document.getElementById('modal_edit_shipment').close();
                reset();
                setSelectedShipment(null);
            },
        });
    };

    function getStatusBadge(status) {
        switch (status) {
            case "pending":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Pending</Badge>;
            case "processing":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Diproses</Badge>;
            case "shipped":
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">Dikirim</Badge>;
            case "delivered":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Diterima</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    }

    return (
        <>
            <Head title="Pengiriman Merchandise" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                        
                        {/* Header */}
                        <div className='flex flex-col md:flex-row justify-between items-center'>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                    <Truck className="w-8 h-8 text-primary" /> Pengiriman Merchandise
                                </h1>
                            </div>
                            <div className="breadcrumbs text-sm">
                                <ul>
                                    <li><a>Home</a></li>
                                    <li>Kopi Times</li>
                                    <li>Merchandise</li>
                                    <li>Pengiriman</li>
                                </ul>
                            </div>
                        </div>

                        {/* Toolbar (Search & Filter) */}
                        <Card>
                            <div className="flex flex-col md:flex-row gap-4 justify-end">
                                <div className="w-full md:w-80">
                                    <InputWithPrefix
                                        prefix={<Search size={16} />}
                                        placeholder="Cari nama, item, resi..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <InputSelect
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        options={[
                                            { label: "Semua Status", value: "" },
                                            { label: "Pending", value: "pending" },
                                            { label: "Diproses", value: "processing" },
                                            { label: "Dikirim", value: "shipped" },
                                            { label: "Diterima", value: "delivered" },
                                        ]}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Table Area */}
                        <Card className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead className="bg-base-200/50">
                                        <tr>
                                            <th className="w-12 text-center">#</th>
                                            <th>Penerima (Wartawan)</th>
                                            <th>Detail Item</th>
                                            <th>Alamat Pengiriman</th>
                                            <th>Status & Resi</th>
                                            <th className="text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shipments.data.map((item, index) => {
                                            const from = shipments.from ?? 1;
                                            return (
                                                <tr key={item.id} className="border-b border-base-200 hover:bg-base-100/50">
                                                    <td className="text-center align-top py-4">{from + index}</td>
                                                    
                                                    {/* User Info */}
                                                    <td className="py-4 align-top">
                                                        <div className="font-bold text-base-content">{item.member?.nama || 'Unknown User'}</div>
                                                        <div className="text-xs text-base-content/60">KT-{item.member?.id}</div>
                                                    </td>

                                                    {/* Item Info */}
                                                    <td className="py-4 align-top">
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <Package className="w-4 h-4 text-primary" />
                                                            {item.item_name}
                                                        </div>
                                                        <div className="text-xs text-base-content/60 mt-1">Order: {formatDate(item.created_at)}</div>
                                                    </td>

                                                    {/* Address */}
                                                    <td className="py-4 align-top max-w-xs">
                                                        <div className="flex items-start gap-1.5 text-sm">
                                                            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-base-content/50" />
                                                            <span className="line-clamp-2" title={item.shipping_address}>
                                                                {item.shipping_address}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status & Resi */}
                                                    <td className="py-4 align-top">
                                                        <div className="mb-1">{getStatusBadge(item.status)}</div>
                                                        <div className="text-xs font-mono font-semibold text-base-content/70">
                                                            Resi: {item.tracking_number || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Action */}
                                                    <td className="py-4 align-top text-right">
                                                        <button 
                                                            onClick={() => openEditModal(item)}
                                                            className="btn btn-sm btn-ghost gap-1.5 text-primary hover:bg-primary/10"
                                                        >
                                                            <Edit className="w-4 h-4" /> Update
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        
                                        {shipments.data.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-8 text-muted-foreground bg-base-200/20">
                                                    Tidak ada data pengiriman ditemukan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Pagination */}
                        {shipments.data.length > 0 && <PaginationDaisy data={shipments} />}

                    </div>
                </div>
            </AuthenticatedLayout>

            {/* MODAL UPDATE STATUS & RESI (Menggunakan DaisyUI Modal) */}
            <dialog id="modal_edit_shipment" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" /> Update Pengiriman
                    </h3>
                    
                    {selectedShipment && (
                        <div className="mb-4 p-3 bg-base-200/50 rounded-lg text-sm">
                            <p><span className="font-semibold">Penerima:</span> {selectedShipment.member?.nama}</p>
                            <p><span className="font-semibold">Item:</span> {selectedShipment.item_name}</p>
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <InputLabel value="Status Pengiriman" className="font-bold mb-1" />
                            <InputSelect
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                options={[
                                    { label: "Pending", value: "pending" },
                                    { label: "Sedang Diproses", value: "processing" },
                                    { label: "Sudah Dikirim", value: "shipped" },
                                    { label: "Telah Diterima", value: "delivered" },
                                ]}
                            />
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Nomor Resi / Kurir" className="font-bold mb-1" />
                            <TextInput
                                type="text"
                                className="w-full block"
                                value={data.tracking_number}
                                onChange={(e) => setData('tracking_number', e.target.value)}
                                placeholder="Contoh: JNT-1234567890"
                            />
                            <InputError message={errors.tracking_number} className="mt-2" />
                            <p className="text-xs text-muted-foreground mt-1">Kosongkan jika resi belum tersedia atau belum dikirim.</p>
                        </div>

                        <div className="modal-action border-t border-base-200 pt-4 mt-6">
                            {/* Tombol batal menutup modal tanpa submit */}
                            <button type="button" className="btn btn-ghost" onClick={() => document.getElementById('modal_edit_shipment').close()}>
                                Batal
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Overlay backdrop agar bisa ditutup dengan klik luar modal */}
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    )
}

export default Index