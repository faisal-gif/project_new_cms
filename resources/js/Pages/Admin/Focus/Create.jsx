import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
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
        keyword: '',
        description: '',
        img_desktop_list: '',
        img_desktop_news: '',
        img_mobile: '',
        status: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.fokus.store'));

    };


    return (
        <>
            <Head title="Tambah Fokus" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Fokus</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Fokus</li>
                                        <li>Tambah Fokus</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>


                            <form onSubmit={submit} className='space-y-6'>
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Detail Fokus</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

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

                                      
                                            <div className='lg:col-span-4 w-full'>
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
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    autoComplete="name"
                                                />
                                                <InputError message={errors.name} className="mt-2" />
                                            </div>

                                          

                                            <div className='lg:col-span-6 w-full'>
                                                <InputTextarea
                                                    label="Keyword"
                                                    value={data.keyword}
                                                    onChange={(e) => setData('keyword', e.target.value)}
                                                    placeholder="Masukkan keyword Fokus..."
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
                                                    placeholder="Masukkan description Fokus..."
                                                    maxLength={500}
                                                />
                                                <InputError message={errors.description} className="mt-2" />

                                            </div>



                                        </div>
                                    </Card>
                                </div>
                               
                                <div className='space-y-4'>
                                    <h2>
                                        <span className="text-lg font-semibold text-foreground">Image</span>
                                    </h2>
                                    <Card>
                                        <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="img_desktop_list"
                                                    value="Image Desktop List"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="img_desktop_list"
                                                    name="img_desktop_list"
                                                    type="url"
                                                    className="block w-full"
                                                    value={data.img_desktop_list}
                                                    onChange={(e) => setData('img_desktop_list', e.target.value)}
                                                    autoComplete="img_desktop_list"
                                                />
                                                <InputError message={errors.img_desktop_list} className="mt-2" />
                                            </div>
                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="img_desktop_news"
                                                    value="Image Desktop News"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="img_desktop_news"
                                                    name="img_desktop_news"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.img_desktop_news}
                                                    onChange={(e) => setData('img_desktop_news', e.target.value)}
                                                    autoComplete="img_desktop_news"
                                                />
                                                <InputError message={errors.img_desktop_news} className="mt-2" />
                                            </div>

                                            <div className='lg:col-span-3 w-full'>
                                                <InputLabel
                                                    htmlFor="img_mobile"
                                                    value="Image Mobile"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <TextInput
                                                    id="img_mobile"
                                                    name="img_mobile"
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.img_mobile}
                                                    onChange={(e) => setData('img_mobile', e.target.value)}
                                                    autoComplete="img_mobile"
                                                />
                                                <InputError message={errors.img_mobile} className="mt-2" />
                                            </div>
                                        </div>
                                    </Card>

                                </div>

                                <div className='flex flex-row justify-end mt-2'>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        Simpan
                                    </button>
                                </div>

                            </form>


                        </div>

                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Create