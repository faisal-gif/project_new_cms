import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import EditorForm from './Partials/EditorForm'

export default function Create({ users, roles, nasionals, daerahs }) {
    return (
        <>
            <Head title="Tambah Editor" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <h1 className="text-3xl font-bold text-foreground">Tambah Editor</h1>
                            <div className="breadcrumbs text-sm">
                                <ul>
                                    <li><a>Home</a></li>
                                    <li>Editor</li>
                                    <li>Tambah</li>
                                </ul>
                            </div>
                        </div>
                        <EditorForm users={users} roles={roles} nasionals={nasionals} daerahs={daerahs} />
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
