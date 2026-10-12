import Breadcrumbs from '@/Components/Breadcrumbs'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'
import AffiliateForm from './AffiliateForm'

export default function Edit({ affiliate, uplines, referralBase, routePrefix = '' }) {
    const { data, setData, put, processing, errors } = useForm({
        name: affiliate.name ?? '',
        email: affiliate.email ?? '',
        phone: affiliate.phone ?? '',
        code: affiliate.code ?? '',
        upline_id: affiliate.upline_id ?? null,
        user_id: affiliate.user_id ?? null,
        // Isi label awal AsyncSelect dari relasi user yang sudah di-eager-load.
        user_option: affiliate.user
            ? { value: affiliate.user.id, label: `${affiliate.user.nama} — ${affiliate.user.email || 'tanpa email'}` }
            : null,
        payout_method: affiliate.payout_method ?? 'bank',
        bank_name: affiliate.bank_name ?? '',
        bank_account_number: affiliate.bank_account_number ?? '',
        bank_account_name: affiliate.bank_account_name ?? '',
        status: affiliate.status ?? 'pending',
        note: affiliate.note ?? '',
    })

    const submit = (e) => {
        e.preventDefault()
        put(route(`admin.${routePrefix}affiliate.update`, affiliate.id))
    }

    return (
        <div>
            <Head title={`Edit: ${affiliate.name}`} />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <h1 className="text-3xl font-bold text-foreground">Edit Afiliator</h1>
                                <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi', href: route(`admin.${routePrefix}affiliate.index`) }, { label: 'Edit' }]} />
                            </div>

                            <AffiliateForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={submit}
                                uplines={uplines}
                                referralBase={referralBase}
                                submitLabel="Simpan Perubahan"
                            />
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    )
}
