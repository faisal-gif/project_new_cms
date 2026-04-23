import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

function Edit({ ads_locate }) {

    const { data, setData, put, processing, errors, reset } = useForm({
        name: ads_locate.name || '',
        type: ads_locate.type || '',
        status: ads_locate.status || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.daerah.adsLocate.update',ads_locate));
    };


    return (
        <>
            <Head title="Edit Ads Locate" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Ads Locate</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Ads Locate</li>
                                        <li>Edit Ads Locate</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                    {/* Form fields will go here */}
                                    <div className="lg:col-span-6 w-full md:w-60">
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
                                        <InputSelect
                                            label="Type"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            options={[
                                                { label: "Desktop", value: "d" },
                                                { label: "Mobile", value: "m" },
                                                { label: "Testimonial", value: "t" },
                                            ]}
                                        />
                                        <InputError message={errors.type} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-4'>
                                        <InputLabel
                                            htmlFor="name"
                                            value="Nama"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="name"
                                            name="name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            autoComplete="name"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
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