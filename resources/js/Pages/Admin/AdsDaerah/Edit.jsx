import Card from '@/Components/Card'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputRupiah from '@/Components/InputRupiah'
import InputSelect from '@/Components/InputSelect'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { Calendar1Icon, DollarSignIcon, ImageIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import Select from "react-select";

function Edit({ item, locations, networks }) {

    const { data, setData, put, processing, errors } = useForm({
        title: item.title || '',
        type: item.type || '',
        location: item.locate_id || '',
        datestart: item.datestart || '',
        dateend: item.dateend || '',
        image: item.image || '',
        url: item.url || '',
        cpc: item.cpc || '',
        cost: item.cost || '',
        network: [],
        status: String(item.status),
    });

    /** -----------------------------------------
     *  Prefill Network (react-select)
     * ----------------------------------------*/
    useEffect(() => {
        if (item.networks) {
            const selected = item.networks.map((n) => ({
                value: n.id,
                label: n.name,
            }));
            setData("network", selected);
        }
    }, []);

    /** -----------------------------------------
     *  Submit Edit
     * ----------------------------------------*/
    const submit = (e) => {
        e.preventDefault();
        put(route('admin.ads.daerah.update', item), {
            onBefore: () => {
                setData("network", data.network.map((n) => n.value));
            },
        });
    };


    return (
        <>
            <Head title="Edit Ads Daerah" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Ads Daerah</h1>
                                </div>

                                {/* breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Ads Daerah</li>
                                        <li>Edit</li>
                                    </ul>
                                </div>
                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                                {/* Status & Biaya */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <DollarSignIcon className='w-6 h-6' /> Status & Biaya
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                        <div className="lg:col-span-6 w-full md:w-60">
                                            <InputSelect
                                                label="Status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                options={[
                                                    { label: "Publish", value: 1 },
                                                    { label: "Pending", value: 0 },
                                                ]}
                                            />
                                            <InputError message={errors.status} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="cost"
                                                value="Cost (Biaya Iklan)"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <InputRupiah
                                                id="cost"
                                                name="cost"
                                                value={data.cost}
                                                onChange={(e) => setData('cost', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.cost} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="cpc"
                                                value="Cost Per Click (CPC)"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <InputRupiah
                                                id="cpc"
                                                name="cpc"
                                                value={data.cpc}
                                                onChange={(e) => setData('cpc', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.cpc} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Jadwal Tayang */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <Calendar1Icon className='w-6 h-6' /> Jadwal Tayang
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="datestart"
                                                value="Date Start"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="datestart"
                                                name="datestart"
                                                type="date"
                                                value={data.datestart}
                                                onChange={(e) => setData('datestart', e.target.value)}
                                                autoComplete="datestart"
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.datestart} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="dateend"
                                                value="Date End"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="dateend"
                                                name="dateend"
                                                type="date"
                                                value={data.dateend}
                                                onChange={(e) => setData('dateend', e.target.value)}
                                                autoComplete="dateend"
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.dateend} className="mt-2" />
                                        </div>
                                    </div>

                                </Card>

                                {/* Penempatan Iklan */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <Calendar1Icon className='w-6 h-6' />Penempatan Iklan
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>

                                        <div className="lg:col-span-3 w-full">
                                            <InputSelect
                                                label="Type"
                                                value={data.type}
                                                onChange={(e) => {
                                                    setData('type', e.target.value);
                                                    setData('location', '');
                                                }}
                                                options={[
                                                    { label: "Desktop", value: "d" },
                                                    { label: "Mobile", value: "m" },
                                                    { label: "Testimonial", value: "t" },
                                                ]}
                                            />
                                            <InputError message={errors.type} className="mt-2" />
                                        </div>

                                        <div className="lg:col-span-3 w-full">
                                            <InputSelect
                                                label="Lokasi"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                options={locations[data.type] ?? []}
                                            />
                                            <InputError message={errors.location} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6 w-full'>
                                            <InputLabel
                                                htmlFor="network"
                                                value="Location Publish"
                                                className='mb-2 label-text font-bold'
                                            />

                                            <Select
                                                isMulti
                                                options={networks}
                                                value={data.network}
                                                onChange={(val) => { setData("network", val); }}
                                                className="w-full"
                                                classNamePrefix="select"
                                            />

                                            <InputError message={errors.network} className="mt-2" />
                                        </div>

                                    </div>
                                </Card>

                                {/* Konten Iklan */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <ImageIcon className='w-6 h-6' /> Konten Iklan
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="title"
                                                value="Judul"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="title"
                                                name="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="image"
                                                value="Gambar URL"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="image"
                                                name="image"
                                                type="url"
                                                value={data.image}
                                                onChange={(e) => setData('image', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.image} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="url"
                                                value="URL"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="url"
                                                name="url"
                                                type="url"
                                                value={data.url}
                                                onChange={(e) => setData('url', e.target.value)}
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={errors.url} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Tombol Simpan */}
                                <div className='flex flex-row justify-end mt-4'>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        Update
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

export default Edit
