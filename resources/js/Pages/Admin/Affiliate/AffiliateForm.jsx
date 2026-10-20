import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import { Button } from '@/Components/ui/button'
import { Check, Copy, InfoIcon, LinkIcon, UserIcon, WalletIcon } from 'lucide-react'
import React, { useState } from 'react'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'

const STATUS = [
    { value: 'pending', label: 'Pending — belum menghasilkan komisi' },
    { value: 'active', label: 'Active — menghasilkan atribusi & komisi' },
    { value: 'suspended', label: 'Suspended — atribusi baru dihentikan' },
    { value: 'inactive', label: 'Inactive — tidak dipakai lagi' },
]

const METODE = [
    { value: 'bank', label: 'Transfer Bank' },
    { value: 'ewallet', label: 'E-Wallet' },
]

/**
 * Form afiliator, dipakai Create dan Edit.
 *
 * Catatan: kode referral TIDAK dibuat ulang saat mengedit — URL publik yang sudah
 * tersebar bergantung padanya.
 */
// `upline` hanya untuk ditampilkan; sejak penanda tier2_eligible dipakai, rantainya
// diturunkan aplikasi publik dan tidak lagi dipilih admin di form ini.
export default function AffiliateForm({ data, setData, errors, processing, onSubmit, upline = null, referralBase, submitLabel, routePrefix = '' }) {
    const [disalin, setDisalin] = useState(false)

    const salinLink = () => {
        navigator.clipboard.writeText(referralBase + data.code)
        setDisalin(true)
        setTimeout(() => setDisalin(false), 2000)
    }

    // Cari akun member di tabel wartawan untuk ditautkan sebagai user_id.
    const cariUser = (input) => {
        if (!input || input.length < 3) return Promise.resolve([])
        return fetch(route(`admin.${routePrefix}affiliate.search-user`, { q: input }), { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .catch(() => [])
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">

            <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><UserIcon className="w-6 h-6" /> Identitas Afiliator</span>}>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
                    <div className="lg:col-span-3">
                        <InputLabel htmlFor="name" value="Nama" className="mb-2 font-bold" />
                        <TextInput id="name" className="block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="lg:col-span-3">
                        <InputLabel htmlFor="email" value="Email (opsional)" className="mb-2 font-bold" />
                        <TextInput id="email" type="email" className="block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <p className="text-xs text-muted-foreground mt-1">Dipakai aplikasi publik untuk menolak self-referral.</p>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="lg:col-span-3">
                        <InputLabel htmlFor="phone" value="Telepon (opsional)" className="mb-2 font-bold" />
                        <TextInput id="phone" className="block w-full" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>

                    {/*
                        Satu-satunya hal yang admin tentukan soal tingkat kedua. Dulu di sini
                        ada dropdown untuk memilih upline; sekarang admin hanya menentukan
                        SIAPA YANG BERHAK, dan rantainya diturunkan aplikasi publik dari data
                        referral — karena hanya data itu yang tahu siapa mengundang siapa.
                    */}
                    <div className="lg:col-span-6">
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                            <input
                                type="checkbox"
                                className="checkbox mt-0.5"
                                checked={!!data.tier2_eligible}
                                onChange={(e) => setData('tier2_eligible', e.target.checked)}
                            />
                            <span>
                                <span className="font-bold">Akun ini boleh menerima komisi 5% dari jaringannya</span>
                                <span className="mt-1 block text-xs text-muted-foreground">
                                    Dicentang: setiap member yang mendaftar lewat link akun ini, lalu disetujui
                                    jadi afiliator, otomatis menjadi jaringannya — dan akun ini memperoleh 5%
                                    dari setiap pendaftar yang dibawa orang-orang itu. Komisi 20% dari pendaftar
                                    langsungnya tetap berjalan, dicentang atau tidak.
                                </span>
                                <span className="mt-1 block text-xs text-muted-foreground">
                                    Tidak dicentang: jaringannya tidak terbentuk, jadi tidak ada komisi 5% untuk
                                    akun ini. Berlaku untuk pengajuan yang masuk SETELAH dicentang.
                                </span>
                            </span>
                        </label>
                        <InputError message={errors.tier2_eligible} className="mt-2" />
                    </div>

                    {/* Rantai yang sudah terbentuk, ditampilkan saja — tidak lagi bisa diubah di sini. */}
                    {upline && (
                        <div className="lg:col-span-6">
                            <InputLabel value="Upline saat ini" className="mb-1 font-bold" />
                            <p className="text-sm">
                                {upline.name} <span className="font-mono text-xs text-muted-foreground">({upline.code})</span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Diturunkan dari akun yang mengundang orang ini. Penerima komisi 5% dari jaringan
                                akun ini.
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><LinkIcon className="w-6 h-6" /> Kode & Akun</span>}>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
                    <div className="lg:col-span-3">
                        <InputLabel htmlFor="code" value="Kode Referral" className="mb-2 font-bold" />
                        <TextInput
                            id="code"
                            className="block w-full font-mono tracking-wider"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        />
                        <InputError message={errors.code} className="mt-2" />

                        <div className="mt-3 flex items-center gap-2 bg-muted p-3 rounded-lg border border-border">
                            <span className="text-xs break-all flex-1">{referralBase}{data.code}</span>
                            <Button type="button" size="sm" variant="outline" onClick={salinLink} className="gap-1 shrink-0">
                                {disalin ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                {disalin ? 'Tersalin' : 'Salin'}
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <InputLabel value="Tautkan Akun Member (opsional)" className="mb-2 font-bold" />
                        <AsyncSelect
                            isClearable
                            cacheOptions
                            defaultOptions={data.user_option ? [data.user_option] : []}
                            loadOptions={cariUser}
                            value={data.user_option || null}
                            placeholder="Ketik minimal 3 huruf nama / email..."
                            noOptionsMessage={() => 'Ketik minimal 3 huruf'}
                            onChange={(v) => setData({ ...data, user_id: v?.value ?? null, user_option: v })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Hanya perlu bila afiliator ingin login ke portal. Ia harus mendaftar dulu di aplikasi publik.
                        </p>
                        <InputError message={errors.user_id} className="mt-2" />
                    </div>
                </div>
            </Card>

            <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><WalletIcon className="w-6 h-6" /> Pencairan</span>}>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
                    <div className="lg:col-span-2">
                        <InputLabel value="Metode" className="mb-2 font-bold" />
                        <Select
                            options={METODE}
                            value={METODE.find((m) => m.value === data.payout_method) || null}
                            onChange={(v) => setData('payout_method', v?.value)}
                        />
                        <InputError message={errors.payout_method} className="mt-2" />
                    </div>

                    <div className="lg:col-span-2">
                        <InputLabel htmlFor="bank_name" value="Nama Bank / E-Wallet" className="mb-2 font-bold" />
                        <TextInput id="bank_name" className="block w-full" value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value)} />
                        <InputError message={errors.bank_name} className="mt-2" />
                    </div>

                    <div className="lg:col-span-2">
                        <InputLabel htmlFor="bank_account_number" value="Nomor Rekening" className="mb-2 font-bold" />
                        <TextInput id="bank_account_number" className="block w-full" value={data.bank_account_number} onChange={(e) => setData('bank_account_number', e.target.value)} />
                        <InputError message={errors.bank_account_number} className="mt-2" />
                    </div>

                    <div className="lg:col-span-3">
                        <InputLabel htmlFor="bank_account_name" value="Nama Pemilik Rekening" className="mb-2 font-bold" />
                        <TextInput id="bank_account_name" className="block w-full" value={data.bank_account_name} onChange={(e) => setData('bank_account_name', e.target.value)} />
                        <InputError message={errors.bank_account_name} className="mt-2" />
                    </div>

                    <div className="lg:col-span-6 flex gap-3 text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3">
                        <InfoIcon className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>Nomor dan nama pemilik rekening wajib terisi sebelum batch pencairan pertama dibuat.</span>
                    </div>
                </div>
            </Card>

            <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><InfoIcon className="w-6 h-6" /> Status & Catatan</span>}>
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
                    <div className="lg:col-span-3">
                        <InputLabel value="Status" className="mb-2 font-bold" />
                        <Select
                            options={STATUS}
                            value={STATUS.find((s) => s.value === data.status) || null}
                            onChange={(v) => setData('status', v?.value)}
                        />
                        <InputError message={errors.status} className="mt-2" />
                    </div>

                    <div className="lg:col-span-6">
                        <InputTextarea label="Catatan Admin" value={data.note || ''} onChange={(e) => setData('note', e.target.value)} />
                        <InputError message={errors.note} className="mt-2" />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="px-8">{submitLabel}</Button>
            </div>
        </form>
    )
}
