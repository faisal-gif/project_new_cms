import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Breadcrumbs from '@/Components/Breadcrumbs';
import { Head } from '@inertiajs/react'
import WriterForm from './Partials/WriterForm'

export default function Create({ networks, nasionals, daerahs }) {
    return (
        <>
            <Head title="Tambah Penulis" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <h1 className="text-3xl font-bold text-foreground">Tambah Penulis</h1>
                            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Penulis' }, { label: 'Tambah' }]} />
                        </div>
                        <WriterForm networks={networks} nasionals={nasionals} daerahs={daerahs} />
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
