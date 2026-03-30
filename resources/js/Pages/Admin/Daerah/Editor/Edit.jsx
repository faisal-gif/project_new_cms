import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputPhoneNumber from '@/Components/InputPhoneNumber'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

function Edit({ editor }) {

    const { data, setData, put, processing, errors, reset } = useForm({
        name: editor.name || '',
        no_whatsapp: editor.no_whatsapp || '',
        id_ti: editor.id_ti || '',
        status: editor.status || '',

    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.editor.update', editor));

    };


    return (
        <>
            <Head title="Edit Editor" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Editor</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Editor</li>
                                        <li>Edit Editor</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                    {/* Form fields will go here */}
                                    <div className="w-full lg:col-span-6 md:w-60">
                                        <InputSelect
                                            label="Status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            options={[
                                                { label: "Publish", value: "1" },
                                                { label: "Pending", value: "0" },
                                            ]}
                                        />
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    <div className="lg:col-span-2 w-full">
                                        <InputLabel
                                            htmlFor="id_ti"
                                            value="ID Pusat"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="id_ti"
                                            name="id_ti"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.id_ti}
                                            onChange={(e) => setData('id_ti', e.target.value)}
                                            autoComplete="id_ti"
                                        />
                                        <InputError message={errors.id_ti} className="mt-2" />
                                    </div>

                                    <div className='lg:col-span-4'>
                                        <InputLabel
                                            htmlFor="Name"
                                            value="Nama"
                                            className='mb-2 font-bold'
                                        />
                                        <TextInput
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full"
                                            autoComplete="name"
                                        />
                                        <InputError message={errors.name} className="mt-2" />

                                    </div>


                                    <div className='lg:col-span-6 w-full'>
                                        <InputLabel
                                            htmlFor="no_whatsapp"
                                            value="No Whatsapp"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <InputPhoneNumber
                                            id="no_whatsapp"
                                            name="no_whatsapp"
                                            value={data.no_whatsapp}
                                            onChange={(e) => setData('no_whatsapp', e.target.value)}
                                            className="w-full"
                                            autoComplete="no_whatsapp"
                                        />
                                        <InputError message={errors.no_whatsapp} className="mt-2" />
                                    </div>


                                   
                                    <div className=' lg:col-span-6 flex flex-row justify-end mt-4'>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={processing}
                                        >
                                            Simpan
                                        </button>
                                    </div>

                                </form>
                            </Card>

                        </div>

                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Edit