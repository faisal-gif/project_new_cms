import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputSelect from '@/Components/InputSelect'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

function Create() {

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        keyword: '',
        description: '',
        status: '',

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
        post(route('admin.daerah.kanal.store'));

    };


    return (
        <>
            <Head title="Tambah User" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Kanal</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Daerah</li>
                                        <li>Kanal</li>
                                        <li>Tambah Kanal</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                    {/* Form fields will go here */}
                                    <div className="lg:col-span-2 w-full">
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

                                    <div className='lg:col-span-2'>
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
                                    <div className='lg:col-span-2'>
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

export default Create