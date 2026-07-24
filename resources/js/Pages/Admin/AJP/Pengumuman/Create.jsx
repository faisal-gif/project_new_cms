import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import React from 'react'

function Create() {
    // Inisialisasi state sesuai dengan request backend PengumumanAjpRequest
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        kategori: 'info', // Default value
        start_date: '',
        end_date: '',
        is_active: true,  // Default aktif
    });

    const submit = (e) => {
        e.preventDefault();
        // Sesuaikan dengan nama route store pengumuman di web kamu
        post(route('admin.ajp.pengumuman.store'));
    };

    return (
        <>
            <Head title="Tambah Pengumuman" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah Pengumuman</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>AJP</li>
                                        <li>Pengumuman</li>
                                        <li>Tambah Pengumuman</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}
                            </div>

                            {/* START: Main Form */}
                            <Card>
                                <form onSubmit={submit} className='grid grid-cols-1 lg:grid-cols-6 gap-4 p-4'>

                                    {/* Field: Title */}
                                    <div className='lg:col-span-6 w-full'>
                                        <InputLabel
                                            htmlFor="title"
                                            value="Judul Pengumuman"
                                            className='mb-2 font-bold'
                                        />
                                        <TextInput
                                            id="title"
                                            name="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Contoh: Maintenance Server Malam Ini"
                                        />
                                        <InputError message={errors.title} className="mt-2" />
                                    </div>

                                    {/* Field: Content (Isi Pengumuman) */}
                                    <div className='lg:col-span-6 w-full'>
                                        <InputLabel
                                            htmlFor="content"
                                            value="Isi Pengumuman"
                                            className='mb-2 font-bold'
                                        />
                                        {/* Menggunakan textarea standar bawaan HTML yang di-styling mirip TextInput */}
                                        <textarea
                                            id="content"
                                            name="content"
                                            rows="4"
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            className="textarea textarea-bordered mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            placeholder="Tulis detail pengumuman di sini..."
                                        />
                                        <InputError message={errors.content} className="mt-2" />
                                    </div>

                                    {/* Field: Kategori */}
                                    <div className="lg:col-span-6 w-full md:w-80">
                                        <InputSelect
                                            label="Kategori"
                                            value={data.kategori}
                                            onChange={(e) => setData('kategori', e.target.value)}
                                            options={[
                                                { label: "Info Biasa", value: "info" },
                                                { label: "Urgent / Penting", value: "urgent" },
                                            ]}
                                        />
                                        <InputError message={errors.kategori} className="mt-2" />
                                    </div>

                                    {/* Field: Start Date */}
                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel
                                            htmlFor="start_date"
                                            value="Waktu Mulai Tayang (Opsional)"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="start_date"
                                            name="start_date"
                                            type="datetime-local" // Menggunakan datetime-local agar bisa set jam
                                            className="mt-1 block w-full"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                        />
                                        <InputError message={errors.start_date} className="mt-2" />
                                    </div>

                                    {/* Field: End Date */}
                                    <div className="lg:col-span-3 w-full">
                                        <InputLabel
                                            htmlFor="end_date"
                                            value="Waktu Berhenti Tayang (Opsional)"
                                            className='mb-2 label-text font-bold'
                                        />
                                        <TextInput
                                            id="end_date"
                                            name="end_date"
                                            type="datetime-local"
                                            className="mt-1 block w-full"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                        />
                                        <InputError message={errors.end_date} className="mt-2" />
                                        <span className="text-xs text-gray-500 mt-1">Kosongkan jika tayang selamanya.</span>
                                    </div>

                                    {/* Field: Status Aktif */}
                                    <div className="lg:col-span-6 w-full mt-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                            />
                                            <div>
                                                <span className="font-bold text-gray-700">Aktifkan Pengumuman Saat Ini Juga</span>
                                                <p className="text-sm text-gray-500">Jika dicentang, pengumuman akan tampil (selama masuk rentang waktu tayang).</p>
                                            </div>
                                        </label>
                                        <InputError message={errors.is_active} className="mt-2" />
                                    </div>

                                    {/* Submit Button */}
                                    <div className='lg:col-span-6 flex flex-row justify-end mt-4 pt-4 border-t border-gray-100'>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={processing}
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan Pengumuman'}
                                        </button>
                                    </div>
                                </form>
                            </Card>
                            {/* END: Main Form */}

                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Create
