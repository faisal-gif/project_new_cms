import Card from '@/Components/Card'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'
import EventForm from './Partials/EventForm'

function Edit({ event, public_url }) {
    // "2026-07-20 14:30:00" -> "2026-07-20T14:30" untuk input datetime-local
    const forInput = (v) => (v ? String(v).replace(' ', 'T').substring(0, 16) : '');

    const form = useForm({
        name: event.name || '',
        category: event.category || 'event',
        description: event.description || '',
        starts_at: forInput(event.starts_at),
        ends_at: forInput(event.ends_at),
        quota: event.quota ?? 0,
        enabled: event.enabled === true || event.enabled === 1,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('admin.kopi-times.events.update', event.id));
    };

    return (
        <>
            <Head title="Edit Event" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Kopi Times</li>
                                        <li>Event</li>
                                        <li>Edit</li>
                                    </ul>
                                </div>
                            </div>

                            <Card>
                                <EventForm
                                    form={form}
                                    submit={submit}
                                    public_url={public_url}
                                    submitLabel="Perbarui Event"
                                    lockedSlug={event.slug}
                                />
                            </Card>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Edit
