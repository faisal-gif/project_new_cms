import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import { Button } from '@/Components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDateTime, formatRupiah } from '@/Utils/formatter'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { AlertTriangle, ArrowLeftIcon } from 'lucide-react'
import React from 'react'
import Select from 'react-select'

/**
 * Pratinjau dulu, baru buat. Nominal batch dihitung ulang di server dari komisi yang
 * dikunci — angka di layar ini hanya pratinjau, bukan yang dikirim.
 */
export default function Create({ affiliates, affiliate, commissions, total, filters, rekeningLengkap }) {
    const { data, setData, post, processing, errors } = useForm({
        affiliate_id: filters.affiliate_id || '',
        period_start: filters.period_start || '',
        period_end: filters.period_end || '',
        note: '',
    })

    // Ganti pilihan = muat ulang pratinjau dari server.
    const muatPratinjau = (ubah) => {
        const f = { ...data, ...ubah }
        setData(f)
        router.get(route('admin.affiliate-payout.create'), {
            affiliate_id: f.affiliate_id, period_start: f.period_start, period_end: f.period_end,
        }, { preserveState: true, replace: true })
    }

    const submit = (e) => {
        e.preventDefault()
        post(route('admin.affiliate-payout.store'))
    }

    return (
        <>
            <Head title="Buat Batch Pencairan" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <div className="flex items-center gap-3">
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={route('admin.affiliate-payout.index')}><ArrowLeftIcon className="w-5 h-5" /></Link>
                                </Button>
                                <h1 className="text-3xl font-bold text-foreground">Buat Batch Pencairan</h1>
                            </div>
                            <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi' }, { label: 'Pencairan' }, { label: 'Buat' }]} />
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <Card title={<span className="text-xl font-semibold">Pilih Afiliator & Periode</span>}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <InputLabel value="Afiliator" className="mb-2 font-bold" />
                                        <Select options={affiliates} placeholder="Pilih afiliator..."
                                            value={affiliates.find((a) => String(a.value) === String(data.affiliate_id)) || null}
                                            onChange={(v) => muatPratinjau({ affiliate_id: v?.value ?? '' })} />
                                        <InputError message={errors.affiliate_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Periode Awal (opsional)" className="mb-2 font-bold" />
                                        <TextInput type="date" className="block w-full" value={data.period_start}
                                            onChange={(e) => muatPratinjau({ period_start: e.target.value })} />
                                        <InputError message={errors.period_start} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Periode Akhir (opsional)" className="mb-2 font-bold" />
                                        <TextInput type="date" className="block w-full" value={data.period_end}
                                            onChange={(e) => muatPratinjau({ period_end: e.target.value })} />
                                        <InputError message={errors.period_end} className="mt-2" />
                                    </div>
                                </div>

                                {errors.error && <InputError message={errors.error} className="mt-3" />}
                            </Card>

                            {affiliate && !rekeningLengkap && (
                                <Card>
                                    <div className="flex items-start gap-3 text-sm text-red-700">
                                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <strong>Rekening belum lengkap.</strong> Nomor dan nama pemilik rekening wajib
                                            terisi sebelum batch dibuat.{' '}
                                            <Link href={route('admin.affiliate.edit', affiliate.id)} className="underline">Lengkapi di sini</Link>.
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {affiliate && (
                                <Card title={<span className="text-xl font-semibold">Komisi yang akan ditarik</span>}>
                                    <div className="overflow-x-auto mt-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tanggal</TableHead>
                                                    <TableHead>Member</TableHead>
                                                    <TableHead>Pos</TableHead>
                                                    <TableHead className="text-right">Nominal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {commissions.length === 0 && (
                                                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                        Tidak ada komisi siap cair untuk pilihan ini.
                                                    </TableCell></TableRow>
                                                )}
                                                {commissions.map((c) => (
                                                    <TableRow key={c.id}>
                                                        <TableCell className="text-xs">{formatDateTime(c.created_at)}</TableCell>
                                                        <TableCell className="text-xs">{c.user?.nama || '—'}</TableCell>
                                                        <TableCell className="text-xs uppercase">{c.role}</TableCell>
                                                        <TableCell className="text-right">{formatRupiah(c.amount)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                                        <span className="font-semibold">{commissions.length} komisi</span>
                                        <span className="text-2xl font-bold">{formatRupiah(total)}</span>
                                    </div>

                                    <div className="mt-4">
                                        <InputTextarea label="Catatan (opsional)" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                                    </div>
                                </Card>
                            )}

                            <div className="flex justify-end">
                                <Button type="submit" className="px-8"
                                    disabled={processing || !affiliate || commissions.length === 0 || !rekeningLengkap}>
                                    Buat Batch
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
