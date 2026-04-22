import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputImage from '@/Components/InputImage'
import InputLabel from '@/Components/InputLabel'
import InputSelect from '@/Components/InputSelect'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

function Create() {

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: '',
        image: '',
        region: '',
        bio: '',
        date_join: '',
        status: '',

    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.nasional.writer.store'));

    };


    return (
        <>
            <Head title="Tambah Writer" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Writer</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Penulis Nasional</li>
                                        <li>Tambah Penulis Nasional</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                    {/* Form fields will go here */}
                                    <div className="lg:col-span-3">
                                        <InputSelect
                                            label="Status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            options={[
                                                { label: "Active", value: "1" },
                                                { label: "Inactive", value: "0" },
                                            ]}
                                        />
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    <div className="lg:col-span-3">
                                        <InputSelect
                                            label="Type"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            options={[
                                                { label: "TI Journalist", value: "1" },
                                                { label: "AJP Journalist", value: "2" },
                                            ]}
                                        />
                                        <InputError message={errors.type} className="mt-2" />
                                    </div>

                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel
                                            htmlFor="date_join"
                                            value="Tanggal Bergabung"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="date_join"
                                            name="date_join"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.date_join}
                                            onChange={(e) => setData('date_join', e.target.value)}
                                            autoComplete="date_join"
                                        />
                                        <InputError message={errors.date_join} className="mt-2" />
                                    </div>



                                    <div className='lg:col-span-3'>
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

                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel
                                            htmlFor="region"
                                            value="Wilayah"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="region"
                                            name="region"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.region}
                                            onChange={(e) => setData('region', e.target.value)}
                                            autoComplete="region"
                                        />
                                        <InputError message={errors.region} className="mt-2" />
                                    </div>

                                    <div className='lg:col-span-6 w-full'>

                                        <InputTextarea
                                            label={"bio"}
                                            id="bio"
                                            name="bio"
                                            maxLength={255}
                                            placeholder='Isi Bio disini'
                                            value={data.bio}
                                            onChange={(e) => setData('bio', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.bio} className="mt-2" />

                                    </div>

                                    <div className="lg:col-span-6 w-full">

                                        <InputImage
                                            label='Image'
                                            enableCrop={false}
                                            id="image"
                                            name="image"
                                            value={data.image}
                                            targetHeight={800}
                                            targetWidth={600}
                                            onChange={(file) => setData('image', file)}
                                        />
                                        <InputError message={errors.image} className="mt-2" />
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

export default Create