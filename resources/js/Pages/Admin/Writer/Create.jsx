import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import WriterForm from './Partials/WriterForm'

export default function Create({ networks }) {
    return (
        <>
            <Head title="Tambah Penulis" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <h1 className="text-3xl font-bold text-foreground">Tambah Penulis</h1>
                            <div className="breadcrumbs text-sm">
                                <ul>
                                    <li><a>Home</a></li>
                                    <li>Penulis</li>
                                    <li>Tambah</li>
                                </ul>
                            </div>
                        </div>
                        <WriterForm networks={networks} />
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
