import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import EditorForm from './Partials/EditorForm'

export default function Edit({ editor, users, roles }) {
    return (
        <>
            <Head title="Edit Editor" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <h1 className="text-3xl font-bold text-foreground">Edit Editor</h1>
                            <div className="breadcrumbs text-sm">
                                <ul>
                                    <li><a>Home</a></li>
                                    <li>Editor</li>
                                    <li>Edit</li>
                                </ul>
                            </div>
                        </div>
                        <EditorForm editor={editor} users={users} roles={roles} />
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
