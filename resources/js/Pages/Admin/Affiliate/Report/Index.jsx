import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import InputLabel from '@/Components/InputLabel'
import TextInput from '@/Components/TextInput'
import { Button } from '@/Components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatRupiah } from '@/Utils/formatter'
import { Head, Link, router } from '@inertiajs/react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import React, { useState } from 'react'
import Select from 'react-select'

/**
 * Rekap periode. Pos internal (KITA AI) HANYA boleh tampil di sini — tidak pernah
 * di aplikasi publik.
 */
export default function Index({ filters, rekap, perSitus = [], perAfiliator, invarian, situsLabel, routePrefix = '' }) {
    const [f, setF] = useState(filters)

    const terapkan = () => router.get(route(`admin.${routePrefix}affiliate-report.index`), f, { preserveState: true })

    const adaMasalah = invarian.total_timpang.length > 0 || invarian.batch_campur.length > 0

    return (
        <>
            <Head title="Laporan Afiliasi" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-bold text-foreground">Laporan Afiliasi</h1>
                                {/* Dibuka dari menu AJP / Kopi Times -> tersaring otomatis. */}
                                {situsLabel && (
                                    <span className="text-sm bg-muted border border-border rounded-full px-3 py-1">{situsLabel}</span>
                                )}
                            </div>
                            <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi' }, { label: 'Laporan' }]} />
                        </div>

                        {adaMasalah && (
                            <Card>
                                <div className="flex items-start gap-3 text-sm text-red-700">
                                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <strong>Ketimpangan data terdeteksi.</strong>
                                        {invarian.total_timpang.length > 0 && (
                                            <div>{invarian.total_timpang.length} batch nominalnya tidak sama dengan jumlah komisinya
                                                (#{invarian.total_timpang.map((r) => r.id).join(', #')}).</div>
                                        )}
                                        {invarian.batch_campur.length > 0 && (
                                            <div>{invarian.batch_campur.length} batch berisi komisi lebih dari satu afiliator
                                                (#{invarian.batch_campur.map((r) => r.payout_id).join(', #')}).</div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        <Card>
                            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                                <div>
                                    <InputLabel value="Dari" className="mb-2 font-bold" />
                                    <TextInput type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} />
                                </div>
                                <div>
                                    <InputLabel value="Sampai" className="mb-2 font-bold" />
                                    <TextInput type="date" value={f.end_date} onChange={(e) => setF({ ...f, end_date: e.target.value })} />
                                </div>
                                <Button onClick={terapkan}>Terapkan</Button>
                                <div className="sm:ml-auto">
                                    <Button asChild variant="outline" className="gap-2">
                                        <Link href={route(`admin.${routePrefix}affiliate-report.fraud`)}>
                                            <ShieldAlert className="w-4 h-4" /> Deteksi Kecurangan
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <div className="text-xs text-muted-foreground">Pemasukan kotor</div>
                                <div className="text-2xl font-bold">{formatRupiah(rekap.kotor)}</div>
                                <div className="text-xs text-muted-foreground mt-1">{rekap.jumlah_pembayaran} pembayaran berkomisi</div>
                            </Card>
                            <Card>
                                <div className="text-xs text-muted-foreground">Total komisi keluar</div>
                                <div className="text-2xl font-bold text-red-700">{formatRupiah(rekap.total_keluar)}</div>
                            </Card>
                            <Card>
                                <div className="text-xs text-muted-foreground">Net kantor</div>
                                <div className="text-2xl font-bold text-green-700">{formatRupiah(rekap.net_kantor)}</div>
                                <div className="text-xs text-muted-foreground mt-1">kotor − komisi, tidak pernah jadi baris</div>
                            </Card>
                        </div>

                        <Card title={<span className="text-xl font-semibold">Rincian Pos</span>}>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                {[
                                    ['Tier 1 — perekrut (20%)', rekap.tier1],
                                    ['Tier 2 — upline (5%)', rekap.tier2],
                                    ['Internal — KITA AI (10%)', rekap.kita_ai],
                                    ['Tertahan (unassigned)', rekap.tertahan],
                                ].map(([label, nilai]) => (
                                    <div key={label} className="bg-muted rounded-lg p-4 border border-border">
                                        <div className="text-xs text-muted-foreground">{label}</div>
                                        <div className="text-lg font-bold mt-1">{formatRupiah(nilai)}</div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Pos internal adalah angka internal — jangan pernah ditampilkan di aplikasi publik.
                            </p>
                        </Card>

                        {/* Satu afiliator bisa merekrut ke beberapa situs, jadi rinciannya
                            dipecah per situs dengan barisan total di bawah. */}
                        <Card title={<span className="text-xl font-semibold">Rekap per Situs</span>}>
                            <div className="overflow-x-auto mt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Situs</TableHead>
                                            <TableHead className="text-center">Pembayaran</TableHead>
                                            <TableHead className="text-right">Kotor</TableHead>
                                            <TableHead className="text-right">Tier 1</TableHead>
                                            <TableHead className="text-right">Tier 2</TableHead>
                                            <TableHead className="text-right">KITA AI</TableHead>
                                            <TableHead className="text-right">Tertahan</TableHead>
                                            <TableHead className="text-right">Keluar</TableHead>
                                            <TableHead className="text-right">Net Kantor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {perSitus.length === 0 && (
                                            <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                Tidak ada transaksi pada periode ini.
                                            </TableCell></TableRow>
                                        )}
                                        {perSitus.map((s) => (
                                            <TableRow key={s.situs ?? 'kosong'}>
                                                <TableCell className="font-medium">{s.label}</TableCell>
                                                <TableCell className="text-center">{s.jumlah_pembayaran}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(s.kotor)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(s.tier1)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(s.tier2)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(s.kita_ai)}</TableCell>
                                                <TableCell className="text-right text-orange-700">{formatRupiah(s.tertahan)}</TableCell>
                                                <TableCell className="text-right text-red-700">{formatRupiah(s.total_keluar)}</TableCell>
                                                <TableCell className="text-right font-semibold text-green-700">{formatRupiah(s.net_kantor)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {perSitus.length > 0 && (
                                            <TableRow className="bg-muted font-bold">
                                                <TableCell>TOTAL</TableCell>
                                                <TableCell className="text-center">{rekap.jumlah_pembayaran}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(rekap.kotor)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(rekap.tier1)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(rekap.tier2)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(rekap.kita_ai)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(rekap.tertahan)}</TableCell>
                                                <TableCell className="text-right">{formatRupiah(rekap.total_keluar)}</TableCell>
                                                <TableCell className="text-right text-green-700">{formatRupiah(rekap.net_kantor)}</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>

                        <Card title={<span className="text-xl font-semibold">25 Afiliator Teratas</span>}>
                            <div className="overflow-x-auto mt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Afiliator</TableHead>
                                            <TableHead>Kode</TableHead>
                                            <TableHead className="text-center">Jumlah Baris</TableHead>
                                            <TableHead className="text-right">Total Komisi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {perAfiliator.length === 0 && (
                                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                Belum ada komisi pada periode ini.
                                            </TableCell></TableRow>
                                        )}
                                        {perAfiliator.map((r, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{r.nama}</TableCell>
                                                <TableCell className="font-mono text-xs">{r.kode}</TableCell>
                                                <TableCell className="text-center">{r.jumlah}</TableCell>
                                                <TableCell className="text-right font-semibold">{formatRupiah(r.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
