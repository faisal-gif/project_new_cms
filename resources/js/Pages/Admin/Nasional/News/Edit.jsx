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

function Edit({ news, writers, editors, kanal, fokus }) {
    // Format date untuk input type datetime-local (YYYY-MM-DDThh:mm)
    const formattedDatePub = news.news_datepub ? new Date(news.news_datepub).toISOString().slice(0, 16) : '';

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // Wajib untuk file upload (gambar) saat update di Inertia
        is_code: news.is_code ?? '',
        status: news.news_status ?? '',
        editor: news.editor_id ?? '',
        writer: news.news_writer ?? '',
        writer_id: news.journalist_id ?? '',
        pin: news.pin ?? '',
        keyword_tool: news.keyword_tool ?? '',
        title: news.news_title ?? '',
        description: news.news_description ?? '',
        tag: news.tags_array ?? [], // Data tag lama dari controller
        is_content: news.news_content ?? '',
        is_headline: news.news_headline ?? 0,
        image_thumbnail: '', // Dikosongkan, hanya diisi jika user upload ulang
        image_watermark: false,
        image_caption: news.news_caption ?? '',
        datepub: formattedDatePub,
        locus: news.news_city ?? '',
        focus: news.focnews_id ?? '',
        kanal: news.catnews_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        // Post ke route update, _method: 'PUT' akan menangani perubahannya
        post(route('admin.nasional.news.update', news.news_id));
    };

    return (
        <div>
            <Head title="Edit Berita Nasional" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Edit Berita Nasional</h1>
                                </div>
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Beranda</a></li>
                                        <li>Berita Nasional</li>
                                        <li>Edit Berita</li>
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
                                                    { label: "Publish", value: 1, color: "success" },
                                                    { label: "Review", value: 2, color: "warning" },
                                                    { label: "On Pro", value: 3, color: "error" },
                                                ]}
                                            />
                                            <InputError message={errors.status} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel value="Editor" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={editors.find(e => e.value == data.editor)}
                                                options={editors}
                                                placeholder="Pilih Editor..."
                                                onChange={(val) => setData('editor', val?.value)}
                                            />
                                            <InputError message={errors.editor} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel value="Penulis" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={writers.find(w => w.label === data.writer)}
                                                options={writers}
                                                placeholder="Pilih Penulis..."
                                                onChange={(val) => {
                                                    setData('writer', val?.label);
                                                    setData('writer_id', val?.value); // Set juga writer_id
                                                }}

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

                                {/* Card Konten Berita */}
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
                                            <InputSwitch
                                                label="Headline"
                                                checked={!!data.is_headline}
                                                onChange={(val) => setData("is_headline", val ? 1 : 0)}
                                            />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Gambar Thumbnail */}
                                <Card title={<span className="flex gap-2 items-center text-2xl font-semibold"><ImagesIcon className='w-6 h-6' /> Gambar Thumbnail</span>}>
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            {/* Preview Gambar Lama */}
                                            {news.news_image_new && !data.image_thumbnail && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-semibold mb-2">Gambar Saat Ini:</p>
                                                    <img src={news.news_image_new} alt="Thumbnail" className="w-48 h-auto rounded object-cover border" />
                                                </div>
                                            )}
                                            <InputLabel value="Upload Thumbnail Baru (Opsional)" className='mb-2 label-text font-bold' />
                                            <InputImage
                                                value={data.image_thumbnail}
                                                onChange={(file) => setData('image_thumbnail', file)}
                                            />
                                            <InputError message={errors.image_thumbnail} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <label className="flex items-center gap-2 mt-2">
                                                <Checkbox
                                                    checked={data.image_watermark}
                                                    onChange={(e) => setData('image_watermark', e.target.checked)}
                                                />
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
                                                value={data.kanal ? kanal.find(k => k.value === data.kanal) : null}
                                                options={kanal}
                                                onChange={(val) => setData('kanal', val?.value)}
                                            />
                                            <InputError message={errors.kanal} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-3'>
                                            <InputLabel value="Fokus" className='mb-2 label-text font-bold' />
                                            <Select
                                                value={data.focus ? fokus.find(f => f.value === data.focus) : null}
                                                options={fokus}
                                                onChange={(val) => setData('focus', val?.value)}
                                            />
                                            <InputError message={errors.focus} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-4'>
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        Update Berita Nasional
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