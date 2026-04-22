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

// 1. Terima props 'writer' dari Controller
export default function Edit({ writer }) {

    // 2. Isi state awal dengan data dari database
    const { data, setData, post, processing, errors } = useForm({
        name: writer.name || '',
        type: writer.type ? String(writer.type) : '',
        region: writer.region || '',
        bio: writer.bio || '',
        date_join: writer.datejoin || writer.date_join || '', // Sesuaikan nama kolom DB Anda
        status: writer.status !== undefined ? String(writer.status) : '',
        
        // Biarkan null agar tidak error validasi jika user tidak ganti foto
        image: null, 
        
        // 3. WAJIB ADA: Trick agar Laravel bisa upload file pada proses Update
        _method: 'put', 
    });

    const submit = (e) => {
        e.preventDefault();
        // 4. Arahkan route ke proses update dengan membawa ID writer
        post(route('admin.nasional.writer.update', writer.id));
    };

    return (
        <>
            <Head title="Edit Writer" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Writer</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Penulis Nasional</li>
                                        <li>Edit Penulis Nasional</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}

                            </div>

                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                    
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
                                            label={"Bio"}
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
                                        <InputLabel
                                            value="Foto Penulis"
                                            className='mb-2 label-text font-bold'
                                        />
                                        
                                        {/* Tampilkan preview gambar lama jika ada, dan user belum memilih gambar baru */}
                                        {writer.image && !data.image && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-2">Foto Saat Ini:</p>
                                                <img 
                                                    src={writer.image} 
                                                    alt="Current Profile" 
                                                    className="h-32 w-32 object-cover rounded-lg border"
                                                />
                                            </div>
                                        )}

                                        <InputImage
                                            label='Upload Gambar Baru (Opsional)'
                                            enableCrop={false}
                                            id="image"
                                            name="image"
                                            // Value tetap merujuk ke data.image (null saat pertama kali diload)
                                            value={data.image} 
                                            targetHeight={800}
                                            targetWidth={600}
                                            onChange={(file) => setData('image', file)}
                                        />
                                        <InputError message={errors.image} className="mt-2" />
                                    </div>

                                    <div className=' lg:col-span-6 flex flex-row justify-end mt-4 pt-4 border-t'>
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-8"
                                            disabled={processing}
                                        >
                                            {processing ? 'Memperbarui...' : 'Update'}
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