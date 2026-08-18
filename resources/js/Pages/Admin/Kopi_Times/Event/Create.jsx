import Breadcrumbs from '@/Components/Breadcrumbs'
import Card from '@/Components/Card'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'
import EventForm from './Partials/EventForm'

function Create({ public_url }) {
    const form = useForm({
        name: '',
        category: 'event',
        description: '',
        starts_at: '',
        ends_at: '',
        quota: 0,
        enabled: false,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.kopi-times.events.store'));
    };

    return (
        <>
            <Head title="Tambah Event" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <h1 className="text-3xl font-bold text-foreground">Tambah Event</h1>
                                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Kopi Times' }, { label: 'Event' }, { label: 'Tambah' }]} />
                            </div>

                            <Card>
                                <EventForm form={form} submit={submit} public_url={public_url} submitLabel="Simpan Event" />
                            </Card>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Create
