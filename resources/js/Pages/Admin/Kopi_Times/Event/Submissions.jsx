import Card from '@/Components/Card'
import PaginationDaisy from '@/Components/PaginationDaisy'
import { Badge } from '@/Components/ui/badge'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime } from '@/Utils/formatter'
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import React from 'react'

function statusBadge(status) {
    // 0 = menunggu review redaksi (pending). Selain itu sudah diproses.
    if (status === 0 || status === '0') {
        return <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-300">Menunggu Review</Badge>;
    }
    return <Badge className="bg-green-200 text-green-800 hover:bg-green-300">Diproses</Badge>;
}

function Submissions({ event, submissions }) {
    return (
        <>
            <Head title={`Kiriman — ${event.name}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Kiriman Event</h1>
                                    <p className="text-sm text-base-content/60 mt-1">{event.name}</p>
                                </div>
                                <Link href={route('admin.kopi-times.events.index')} className="btn btn-ghost btn-sm gap-1.5">
                                    <ArrowLeft className="w-4 h-4" /> Kembali
                                </Link>
                            </div>

                            <Card>
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra w-full">
                                        <thead>
                                            <tr className="border-b border-base-200">
                                                <th className="w-12 text-center">#</th>
                                                <th>Judul</th>
                                                <th>Narasumber</th>
                                                <th>Kota</th>
                                                <th>Kontak</th>
                                                <th className="text-center">Status</th>
                                                <th>Tanggal</th>
                                                <th className="text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.data.map((item, index) => {
                                                const from = submissions.from ?? 1;
                                                return (
                                                    <tr key={item.id} className="border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors">
                                                        <td className="text-xs text-base-content/50 py-4 text-center">{from + index}</td>
                                                        <td className="py-4 max-w-xs"><span className="text-sm font-semibold line-clamp-2" title={item.title}>{item.title}</span></td>
                                                        <td className="py-4 text-sm">{item.narsum || '-'}</td>
                                                        <td className="py-4 text-sm">{item.city || '-'}</td>
                                                        <td className="py-4 text-sm">{item.contact || '-'}</td>
                                                        <td className="py-4 text-center">{statusBadge(item.status)}</td>
                                                        <td className="py-4 text-sm">{item.created ? formatDateTime(item.created) : '-'}</td>
                                                        <td className="py-4 text-right">
                                                            <Link href={route('admin.kopi-times.news.publish', item.id)} className="btn btn-sm btn-ghost gap-1.5">
                                                                <ClipboardCheck className="w-3.5 h-3.5" /> Review
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {submissions.data.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-8 text-gray-500 bg-base-200/20">
                                                        Belum ada kiriman untuk event ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {submissions.data.length > 0 && <PaginationDaisy data={submissions} />}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Submissions
