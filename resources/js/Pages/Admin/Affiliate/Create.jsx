import Breadcrumbs from '@/Components/Breadcrumbs'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'
import AffiliateForm from './AffiliateForm'

export default function Create({ initialData, referralBase, routePrefix = '' }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        code: initialData?.code || '',
        tier2_eligible: false,
        user_id: null,
        user_option: null, // hanya untuk tampilan AsyncSelect, tidak divalidasi server
        payout_method: 'bank',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        status: 'pending',
        note: '',
    })

    const submit = (e) => {
        e.preventDefault()
        post(route(`admin.${routePrefix}affiliate.store`))
    }

    return (
        <div>
            <Head title="Tambah Afiliator" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <h1 className="text-3xl font-bold text-foreground">Tambah Afiliator</h1>
                                <Breadcrumbs items={[{ label: 'Beranda' }, { label: 'Afiliasi', href: route(`admin.${routePrefix}affiliate.index`) }, { label: 'Tambah' }]} />
                            </div>

                            <AffiliateForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={submit}
                                referralBase={referralBase}
                                routePrefix={routePrefix}
                                submitLabel="Simpan Afiliator"
                            />
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    )
}
