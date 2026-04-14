import Card from '@/Components/Card'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputSwitch from '@/Components/InputSwitch'
import InputTag from '@/Components/InputTag'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { CaptionsIcon, CopyIcon, EyeIcon, GlobeIcon, ImagesIcon, InfoIcon, NotebookPenIcon } from 'lucide-react'
import React from 'react'
import Select from "react-select";

function ImportNasional({ writers, editors, networks, kanal, fokus, initialData }) {

    
    const { data, setData, post, processing, errors } = useForm({
        is_code: initialData?.is_code || '',
        status: '3',
        editor: initialData?.editor_id || '', // Menangkap nilai default editor_id dari backend
        writer: initialData?.writer || '', // Menangkap nilai default writer_id dari backend
        writer_id: initialData?.writer_id || '', // Menangkap nilai default writer_id dari backend
        pin: '',
        keyword_tool: '',
        title: initialData?.title || '',
        description: initialData?.description || '',
        tag: initialData?.tag || [],
        is_content: initialData?.content || '',
        is_headline: '',
        image_thumbnail: initialData?.image_thumbnail || '',
        image_caption: initialData?.image_caption || '',
        datepub: initialData?.datepub ?? '',
        locus: initialData?.locus || '',
        focus: '',
        kanal: '',
    });


    const submit = (e) => {
        e.preventDefault();
        // Sesuaikan dengan nama route penyimpanan untuk Nasional di web.php kamu
        post(route('admin.news.import.nasional.store'));
    };

    return (
        <div>
            <Head title="Kirim News Nasional" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                        <div className="space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Kirim News Nasional</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>News</li>
                                        <li>Import Nasional</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}
                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                                {/* Card Informasi Dasar */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <InfoIcon className='w-6 h-6' /> Informasi Dasar
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-4'>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="editor"
                                                value="Editor"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={editors.find(e => e.value === data.editor)}
                                                options={editors}
                                                placeholder="Pilih Editor..."
                                                onChange={(val) => setData('editor', val?.value)}
                                            
                                            />
                                            <InputError message={errors.editor} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="writer"
                                                value="Penulis"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={writers.find(w => w.value === data.writer_id)}
                                                options={writers}
                                                placeholder="Pilih Penulis..."
                                                onChange={(val) => setData('writer_id', val?.value)}
                                               isDisabled={true} // Disable input writer karena sudah diambil dari data awal dan tidak bisa diubah
                                            />
                                            <InputError message={errors.writer} className="mt-2" />
                                        </div>

                                    </div>
                                </Card>

                                {/* Card Judul, Deskripsi & Tag */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <CaptionsIcon className='w-6 h-6' /> Judul & Deskripsi
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="judul"
                                                value="Judul"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="judul"
                                                name="judul"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                autoComplete="title"
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6'>
                                            <InputTextarea
                                                label={"Deskripsi"}
                                                value={data.description}
                                                placeholder='Masukan Deskripsi Berita'
                                                maxLength={255}
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
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <NotebookPenIcon className='w-6 h-6' /> Konten Berita
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="is_content"
                                                value="Isi Berita"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <InputEditor
                                                value={data.is_content}
                                                onChange={(e) => setData('is_content', e)}
                                            />
                                            <InputError message={errors.is_content} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                                                <InputSwitch
                                                    label="Headline"
                                                    checked={data.is_headline}
                                                    onChange={(val) => setData("is_headline", val ? 1 : 0)}
                                                />
                                                <InputSwitch
                                                    label="Editorial"
                                                    checked={data.is_editorial}
                                                    onChange={(val) => setData("is_editorial", val ? 1 : 0)}
                                                />
                                                <InputSwitch
                                                    label="Advetorial"
                                                    checked={data.is_adv}
                                                    onChange={(val) => setData("is_adv", val ? 1 : 0)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Gambar Original Wartawan */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <ImagesIcon className='w-6 h-6' /> Gambar Original Wartawan
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <div className='grid grid-cols-1 md:grid-col-2 lg:grid-cols-3 gap-4'>
                                                {/* Image 1 */}
                                                <div id='image_thumbnail' className='w-full'>
                                                    <div>
                                                        <InputLabel
                                                            htmlFor="image_thumbnail"
                                                            value="Image Thumbnail"
                                                            className='mb-2 label-text font-bold'
                                                        />
                                                        <img
                                                            src={initialData?.image_thumbnail || 'https://via.placeholder.com/150'}
                                                            alt="preview"
                                                            className="w-full h-full object-contain rounded-lg"
                                                        />
                                                        <div className='flex items-center justify-center gap-0.5 mt-1'>
                                                            <TextInput
                                                                id="image_1"
                                                                name="Image 1"
                                                                type="text"
                                                                readOnly
                                                                className=" block w-full bg-base-300"
                                                                value={data.image_thumbnail}
                                                                onChange={(e) => setData('image_thumbnail', e.target.value)}
                                                                autoComplete="image_thumbnail"
                                                            />
                                                            <button type='button' className='btn btn-secondary btn-soft'>
                                                                <CopyIcon className='w-5 h-5' />
                                                            </button>
                                                            <button type='button' className='btn btn-secondary btn-soft'>
                                                                <EyeIcon className='w-5 h-5' />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='lg:col-span-6'>
                                                    <InputTextarea
                                                        id="image_caption"
                                                        name="Caption Thumbnail"
                                                        label={"Caption Thumbnail"}
                                                        value={data.image_caption}
                                                        onChange={(e) => setData('image_caption', e.target.value)}
                                                        autoComplete="image_caption"
                                                        maxLength={255}
                                                    />
                                                    <InputError message={errors.image_caption} className="mt-2" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Publish */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <GlobeIcon className='w-6 h-6' /> Publish
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="datepub"
                                                value="Tanggal Publish"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="datepub"
                                                name="Tanggal Publish"
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={data.datepub}
                                                onChange={(e) => setData('datepub', e.target.value)}
                                                autoComplete="datepub"
                                            />
                                            <InputError message={errors.datepub} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="lokus"
                                                value="Lokus"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="lokus"
                                                name="Lokus"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.locus}
                                                onChange={(e) => setData('locus', e.target.value)}
                                                autoComplete="locus"
                                            />
                                            <InputError message={errors.locus} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="kanal"
                                                value="Kanal"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={kanal.find(k => k.value === data.kanal)}
                                                options={kanal}
                                                placeholder="Pilih Kanal..."
                                                onChange={(val) => setData('kanal', val?.value)}
                                            />
                                            <InputError message={errors.kanal} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-3'>
                                            <InputLabel
                                                htmlFor="fokus"
                                                value="Fokus"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <Select
                                                value={fokus.find(f => f.value === data.focus)}
                                                options={fokus}
                                                placeholder="Pilih Fokus..."
                                                onChange={(val) => setData('focus', val?.value)}
                                            />
                                            <InputError message={errors.focus} className="mt-2" />
                                        </div>

                                        {networks && networks.length > 0 && (
                                            <div className='lg:col-span-6'>
                                                <InputLabel
                                                    htmlFor="network"
                                                    value="Network"
                                                    className='mb-2 label-text font-bold'
                                                />
                                                <div className="flex gap-2 mb-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline"
                                                        onClick={() => setData('network', networks.map(n => n.value))}
                                                    >
                                                        Select All
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-outline"
                                                        onClick={() => setData('network', [])}
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                                <Select
                                                    value={networks.filter(n => data.network?.includes(n.value))}
                                                    options={networks}
                                                    placeholder="Pilih Network..."
                                                    isMulti
                                                    onChange={(vals) => setData('network', vals ? vals.map(v => v.value) : [])}
                                                />
                                                <InputError message={errors.network} className="mt-2" />
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-4'>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        Simpan Ke Nasional
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

export default ImportNasional