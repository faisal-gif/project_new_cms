import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputRadioGroup from '@/Components/InputRadioGroup'
import InputSelect from '@/Components/InputSelect'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

function Edit({ kanal }) {

    const { data, setData, put, processing, errors, reset } = useForm({
        order: kanal.catnews_order  || '',
        name: kanal.catnews_title  || '',
        slug: kanal.catnews_slug || '',
        keyword: kanal.catnews_keyword || '',
        description: kanal.catnews_description || '',
        status: kanal.catnews_status ,

    });

    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.nasional.kanal.update', kanal.catnews_id));

    };


    return (
        <>
            <Head title="Edit Kanal" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Kanal</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Nasional</li>
                                        <li>Kanal</li>
                                        <li>Edit Kanal</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                    {/* Form fields will go here */}
                                    <div className="lg:col-span-3 w-60">
                                        <InputRadioGroup
                                            label="Status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e)}
                                            options={[
                                                { label: "Pending", value: 0, color: "error" },
                                                { label: "Publish", value: 1, color: "success" },
                                            ]}
                                        />
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-6 w-60'>
                                        <InputLabel
                                            htmlFor="order"
                                            value="Order"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="order"
                                            name="order"
                                            type="number"
                                            className="block w-full"
                                            value={data.order}
                                            onChange={(e) => setData('order', e.target.value)}
                                            autoComplete="number"
                                        />
                                        <InputError message={errors.order} className="mt-2" />
                                    </div>

                                    <div className='lg:col-span-3'>
                                        <InputLabel
                                            htmlFor="name"
                                            value="Nama"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="name"
                                            name="name"
                                            type="text"
                                            className="block w-full"
                                            value={data.name}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setData("name", value);
                                                setData("slug", generateSlug(value));
                                            }}
                                            autoComplete="name"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-3'>
                                        <InputLabel
                                            htmlFor="slug"
                                            value="Slug"
                                            className='mb-2 font-bold'
                                        />
                                        <TextInput
                                            id="slug"
                                            name="slug"
                                            type="text"
                                            value={data.slug}
                                            readOnly
                                            className="block w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                                            autoComplete="slug"
                                        />
                                        <InputError message={errors.slug} className="mt-2" />
                                    </div>
                                    <div className='lg:col-span-6 w-full'>
                                        <InputTextarea
                                            label="Keyword"
                                            value={data.keyword}
                                            onChange={(e) => setData('keyword', e.target.value)}
                                            placeholder="Masukkan keyword kanal..."
                                            maxLength={255}
                                        />
                                        <InputError message={errors.keyword} className="mt-2" />

                                    </div>
                                    <div className='lg:col-span-6 w-full'>
                                        <InputTextarea
                                            label="Description"
                                            value={data.description}
                                            className='h-48'
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Masukkan description kanal..."
                                            maxLength={500}
                                        />
                                        <InputError message={errors.description} className="mt-2" />

                                    </div>
                                    <div className=' lg:col-span-6 flex flex-row justify-end mt-2'>
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