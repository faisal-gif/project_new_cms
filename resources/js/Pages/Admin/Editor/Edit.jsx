import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import Breadcrumbs from '@/Components/Breadcrumbs';
import { Head } from '@inertiajs/react'
import EditorForm from './Partials/EditorForm'

export default function Edit({ editor, users, roles, nasionals, daerahs }) {
    return (
        <>
            <Head title="Edit Editor" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <h1 className="text-3xl font-bold text-foreground">Edit Editor</h1>
                            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Editor' }, { label: 'Edit' }]} />
                        </div>
                        <EditorForm editor={editor} users={users} roles={roles} nasionals={nasionals} daerahs={daerahs} />
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}
