import Card from '@/Components/Card'
import Checkbox from '@/Components/Checkbox'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputImage from '@/Components/InputImage'
import InputLabel from '@/Components/InputLabel'
import InputRadioGroup from '@/Components/InputRadioGroup'
import InputSwitch from '@/Components/InputSwitch'
import InputTag from '@/Components/InputTag'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { CaptionsIcon, GlobeIcon, ImagesIcon, InfoIcon, NotebookPenIcon } from 'lucide-react'
import React from 'react'
import Select from "react-select";

function Edit({ news, writers, editors, networks, kanal, fokus }) {
    // Format datepub untuk input type datetime-local (YYYY-MM-DDThh:mm)
    const formattedDatePub = news.datepub ? new Date(news.datepub).toISOString().slice(0, 16) : '';

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // Wajib untuk file upload via Inertia saat update
        status: news.status ?? '',
        editor: news.editor_id ?? '',
        writer: news.writer_id ?? '',
        pin: news.pin ?? '',
        keyword_tool: news.keyword_tool ?? '',
        title: news.title ?? '',
        description: news.description ?? '',
        // Asumsi data tag dari backend berupa string "tag1,tag2" atau relasi array of object
        tag: news.tags_array ?? [], // Sesuaikan dengan format response backend (e.g. news.tags.map(t => t.name))
        is_content: news.content ?? '',
        is_headline: news.is_headline ?? 0,
        is_editorial: news.is_editorial ?? 0,
        is_adv: news.is_adv ?? 0,
        image_thumbnail: '', // Kosongkan, hanya diisi jika user upload gambar baru
        image_watermark: false,
        image_caption: news.caption ?? '',
        datepub: formattedDatePub,
        locus: news.locus ?? '',
        focus: news.fokus_id ?? '',
        kanal: news.cat_id ?? '',
        // Asumsi relasi network di-load dari backend
        network: news.networks ? news.networks.map(n => n.id) : [],
    });

    const submit = (e) => {
        e.preventDefault();
        // Tetap gunakan post(), Inertia akan membacanya sebagai PUT berkat _method: 'PUT'
        post(route('admin.daerah.news.update', news.id));
    };

    return (
        <div>
            <Head title="Edit News" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit News</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>News</li>
                                        <li>Edit News</li>
                                    </ul>
                                </div>
                            </div>

                            <form onSubmit={submit} className='space-y-6'>
                                {/* Card Informasi Dasar */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><InfoIcon className='w-6 h-6' /> Informasi Dasar</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>
                                        <div className="lg:col-span-6">
                                            <InputRadioGroup
                                                label="Status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e)}
                                                options={[
                                                    { label: "Pending", value: 0, color: "secondary" },
                                                    { label: "Review", value: 2, color: "warning" },
                                                    { label: "On Pro", value: 3, color: "error" },
                                                    { label: "Publish", value: 1, color: "success" },
                                                ]}
                                            />
                                            <InputError message={errors.status} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel value="Editor" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={editors.find(e => e.value === data.editor)}
                                                options={editors}
                                                placeholder="Editors"
                                                onChange={(val) => setData('editor', val?.value)}
                                            />
                                            <InputError message={errors.editor} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel value="Penulis" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={writers.find(w => w.value === data.writer)}
                                                options={writers}
                                                placeholder="Penulis"
                                                onChange={(val) => setData('writer', val?.value)}
                                            />
                                            <InputError message={errors.writer} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Judul & Deskripsi */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><CaptionsIcon className='w-6 h-6' /> Judul & Deskripsi</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel value="Judul" className='mb-2 label-text font-bold' />
                                            <TextInput
                                                className="mt-1 block w-full"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputTextarea
                                                label={"Deskripsi"}
                                                value={data.description}
                                                className='h-20'
                                                onChange={(e) => setData('description', e.target.value)}
                                            />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputTag
                                                label="Tag"
                                                value={data.tag}
                                                onChange={(e) => setData('tag', e)}
                                            />
                                            <InputError message={errors.tag} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Konten */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><NotebookPenIcon className='w-6 h-6' /> Konten Berita</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel value="Isi Berita" className='mb-2 label-text font-bold' />
                                            <InputEditor
                                                value={data.is_content}
                                                onChange={(e) => setData('is_content', e)}
                                            />
                                            <InputError message={errors.is_content} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6 grid grid-cols-1 lg:grid-cols-3 gap-4'>
                                            <InputSwitch label="Headline" checked={!!data.is_headline} onChange={(val) => setData("is_headline", val ? 1 : 0)} />
                                            <InputSwitch label="Editorial" checked={!!data.is_editorial} onChange={(val) => setData("is_editorial", val ? 1 : 0)} />
                                            <InputSwitch label="Advetorial" checked={!!data.is_adv} onChange={(val) => setData("is_adv", val ? 1 : 0)} />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Gambar */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><ImagesIcon className='w-6 h-6' /> Gambar Thumbnail</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        {/* Image 1 */}
                                        <div id='image_thumbnail' className='md:col-span-3 flex flex-col gap-1'>
                                            <div>
                                                <InputLabel
                                                    htmlFor="image_thumbnail"
                                                    value="Upload Thumbnail Baru (Opsional)"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <div className='flex items-center justify-center gap-0.5 mt-1'>
                                                    <InputImage
                                                        existingImage={news.image}
                                                        value={data.image_thumbnail}
                                                        onChange={(file) => setData('image_thumbnail', file)}
                                                    />

                                                </div>
                                            </div>
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <label className="flex items-center gap-2 mt-2">
                                                <Checkbox checked={data.image_watermark} onChange={(e) => setData('image_watermark', e.target.checked)} />
                                                Apakah ini foto original?
                                            </label>
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputTextarea
                                                label={"Caption Thumbnail"}
                                                value={data.image_caption}
                                                onChange={(e) => setData('image_caption', e.target.value)}
                                            />
                                            <InputError message={errors.image_caption} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Publish */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><GlobeIcon className='w-6 h-6' /> Publish</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Tanggal Publish" className='mb-2 label-text font-bold' />
                                            <TextInput
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={data.datepub}
                                                onChange={(e) => setData('datepub', e.target.value)}
                                            />
                                            <InputError message={errors.datepub} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Lokus" className='mb-2 label-text font-bold' />
                                            <TextInput
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.locus}
                                                onChange={(e) => setData('locus', e.target.value)}
                                            />
                                            <InputError message={errors.locus} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Kanal" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={kanal.find(k => k.value === data.kanal)}
                                                options={kanal}
                                                onChange={(val) => setData('kanal', val?.value)}
                                            />
                                            <InputError message={errors.kanal} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Fokus" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={fokus.find(f => f.value === data.focus)}
                                                options={fokus}
                                                onChange={(val) => setData('focus', val?.value)}
                                            />
                                            <InputError message={errors.focus} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputLabel value="Network" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={networks.filter(n => data.network?.includes(n.value))}
                                                options={networks}
                                                isMulti
                                                onChange={(vals) => setData('network', vals ? vals.map(v => v.value) : [])}
                                            />
                                            <InputError message={errors.network} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-4'>
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        Update Data
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    )
}

export default Edit