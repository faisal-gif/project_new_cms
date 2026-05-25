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
        publisher: '',
        id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.ajp-export.store'));

    };


    return (
        <>
            <Head title="AJP Export" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">AJP Export</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>AJP Export</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                    {/* Form fields will go here */}
                                    <div className="lg:col-span-3">
                                        <InputSelect
                                            label="Publisher"
                                            value={data.publisher}
                                            onChange={(e) => setData('publisher', e.target.value)}
                                            options={[
                                                { label: "Pilih Publisher", value: "" },
                                                { label: "Rochmat Shobirin", value: "6" },
                                                { label: "Sholihin Nur", value: "13" },
                                                { label: "Rizal Dani", value: "27" },
                                                { label: "Lucky Setyo Hendrawan", value: "29" },
                                                { label: "Sofyan Saqi Futaki", value: "30" },
                                                { label: "Ahmad Rizki Mubarok", value: "32" },
                                                { label: "M. Theofany Aulia Anwar", value: "35" },
                                            ]}
                                        />
                                        <InputError message={errors.publisher} className="mt-2" />
                                    </div>



                                    <div className='lg:col-span-3'>
                                        <InputLabel
                                            htmlFor="id_ajp"
                                            value="ID AJP"
                                            className='mb-2 font-bold'
                                        />
                                        <TextInput
                                            id="id"
                                            name="id"
                                            type="text"
                                            value={data.id}
                                            onChange={(e) => setData('id', e.target.value)}
                                            className=" block w-full"
                                            autoComplete="id"
                                        />
                                        <InputError message={errors.id} className="mt-2" />

                                    </div>



                                    <div className=' lg:col-span-6 flex flex-row justify-end mt-4'>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={processing}
                                        >
                                            Export
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