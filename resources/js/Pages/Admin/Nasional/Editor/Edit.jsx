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

function Edit({ editor }) {


    const { data, setData, post, processing, errors, reset } = useForm({
        name: editor?.editor_name || '',
        image: null,
        description: editor?.editor_description || '',
        status: editor.status !== undefined ? String(editor.status) : '',

        _method: 'put',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.nasional.editor.update', editor.editor_id));

    };


    return (
        <>
            <Head title="Edit Editor Nasional" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Editor Nasional</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Editor Nasional</li>
                                        <li>Edit Editor Nasional</li>
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



                                    <div className='lg:col-span-6 w-full'>


                                        <InputTextarea
                                            label={"description"}
                                            id="description"
                                            name="description"
                                            maxLength={255}
                                            placeholder='Isi Deskripsi Editor disini'
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.description} className="mt-2" />

                                    </div>

                                    <div className="lg:col-span-6 w-full">
                                        <InputLabel
                                            value="Foto Editor"
                                            className='mb-2 label-text font-bold'
                                        />

                                        {/* Tampilkan preview gambar lama jika ada, dan user belum memilih gambar baru */}
                                        {editor.editor_image && !data.editor_image && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-2">Foto Saat Ini:</p>
                                                <img
                                                    src={editor.editor_image}
                                                    alt="Current Profile"
                                                    className="h-32 w-32 object-cover rounded-lg border"
                                                />
                                            </div>
                                        )}
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
                                            Simpan Perubahan
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