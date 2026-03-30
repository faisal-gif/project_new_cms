import Card from '@/Components/Card'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import InputPassword from '@/Components/InputPassword'
import InputRadioGroup from '@/Components/InputRadioGroup'
import InputRupiah from '@/Components/InputRupiah'
import InputSelect from '@/Components/InputSelect'
import InputSwitch from '@/Components/InputSwitch'
import InputTag from '@/Components/InputTag'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm } from '@inertiajs/react'
import { Calendar1Icon, CaptionsIcon, CopyIcon, DollarSignIcon, EyeIcon, GalleryThumbnails, GlobeIcon, ImageIcon, ImagesIcon, InfoIcon, NotebookPenIcon } from 'lucide-react'
import React from 'react'
import Select from "react-select";

function Create({ writers, editors, networks, kanal_daerah, fokus_daerah }) {

    const { data, setData, post, processing, errors, reset } = useForm({
        status: '',
        editor: '',
        writer: '',
        pin: '',
        keyword_tool: '',
        judul_nasional: '',
        judul_regional: '',
        description: '',
        tag: [],
        is_content: '',
        is_headline: '',
        is_editorial: '',
        is_adv: '',
        image_url: '',
        image_caption: '',
        datepub: '',
        locus: '',
        focus_daerah: '',
        focus_nasional: '',
        kanal_daerah: '',
        kanal_nasional: '',
        network: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.news.store'), {
            onBefore: () => {
                setData("network", data.network.map(item => item.value));
            },
        });
    };


    return (
        <div>
            <Head title="Tambah News" />
            <AuthenticatedLayout >
                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Tambah News</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>News</li>
                                        <li>Tambah News</li>
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

                                        {/* Form fields will go here */}
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
                                            <InputLabel
                                                htmlFor="editor"
                                                value="Editor"
                                                className='mb-2 label-text font-bold'
                                            />

                                            <Select
                                                value={data.editor}
                                                options={editors}
                                                placeholder="Editors"
                                                onChange={(val) => setData('editor', val)}
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
                                                value={data.writer}
                                                options={writers}
                                                placeholder="Penulis"
                                                onChange={(val) => setData('writer', val)}
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
                                                htmlFor="judul_nasional"
                                                value="Judul Nasional"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="judul_nasional"
                                                name="judul_nasional"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.judul_nasional}
                                                onChange={(e) => setData('judul_nasional', e.target.value)}
                                                autoComplete="judul_nasional"
                                            />
                                            <InputError message={errors.judul_nasional} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="judul_regional"
                                                value="Judul Regional"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="judul_regional"
                                                name="judul_regional"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.judul_regional}
                                                onChange={(e) => setData('judul_regional', e.target.value)}
                                                autoComplete="judul_regional"
                                            />
                                            <InputError message={errors.judul_regional} className="mt-2" />
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
                                                <div id='image_wartawan_1' className='flex flex-col gap-1'>
                                                    <div>
                                                        <InputLabel
                                                            htmlFor="image_1"
                                                            value="Image 1"
                                                            className='mb-2 label-text font-bold'
                                                        />
                                                        <div className='flex items-center justify-center gap-0.5 mt-1'>
                                                            <TextInput
                                                                id="image_1"
                                                                name="Image 1"
                                                                type="text"
                                                                readOnly
                                                                className=" block w-full bg-base-300"
                                                                value={data.image_1}
                                                                onChange={(e) => setData('image_1', e.target.value)}
                                                                autoComplete="image_1"
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
                                                {/* Image 2 */}
                                                <div id='image_wartawan_2'>
                                                    <InputLabel
                                                        htmlFor="image_2"
                                                        value="Image 2"
                                                        className='mb-2 label-text font-bold'
                                                    />
                                                    <div className='flex items-center justify-center gap-0.5 mt-1'>
                                                        <TextInput
                                                            id="image_2"
                                                            name="Image 2"
                                                            type="text"
                                                            readOnly
                                                            className=" block w-full bg-base-300"
                                                            value={data.image_2}
                                                            onChange={(e) => setData('image_2', e.target.value)}
                                                            autoComplete="image_2"
                                                        />
                                                        <button type='button' className='btn btn-secondary btn-soft'>
                                                            <CopyIcon className='w-5 h-5' />
                                                        </button>
                                                        <button type='button' className='btn btn-secondary btn-soft'>
                                                            <EyeIcon className='w-5 h-5' />
                                                        </button>
                                                    </div>

                                                </div>
                                                {/* Image 3 */}
                                                <div id='image_wartawan_3'>
                                                    <InputLabel
                                                        htmlFor="image_3"
                                                        value="Image 3"
                                                        className='mb-2 label-text font-bold'
                                                    />
                                                    <div className='flex items-center justify-center gap-0.5 mt-1'>
                                                        <TextInput
                                                            id="image_3"
                                                            name="Image 3"
                                                            type="text"
                                                            readOnly
                                                            className=" block w-full bg-base-300"
                                                            value={data.image_3}
                                                            onChange={(e) => setData('image_3', e.target.value)}
                                                            autoComplete="image_3"
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
                                        </div>
                                    </div>

                                </Card>
                                {/* Card Thumbnail */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <ImageIcon className='w-6 h-6' /> Thumbnail Berita
                                        </span>
                                    }
                                >

                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="image_url"
                                                value="URL Thumbnail"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="image_url"
                                                name="URL Thumbnail"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.image_url}
                                                onChange={(e) => setData('image_url', e.target.value)}
                                                autoComplete="image_url"
                                            />
                                            <InputError message={errors.image_url} className="mt-2" />
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
                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="kanal_daerah"
                                                value="Kanal Daerah"
                                                className='mb-2 label-text font-bold'
                                            />

                                            <Select
                                                value={data.kanal_daerah}
                                                options={kanal_daerah}
                                                menuPlacement='top'
                                                placeholder="Kanal Daerah"
                                                onChange={(val) => setData('kanal_daerah', val)}
                                            />
                                            <InputError message={errors.kanal_daerah} className="mt-2" />

                                        </div>
                                        <div className='lg:col-span-3 w-full'>
                                            <InputLabel
                                                htmlFor="fokus_daerah"
                                                value="Fokus Daerah"
                                                className='mb-2 label-text font-bold'
                                            />

                                            <Select
                                                value={data.focus_daerah}
                                                options={fokus_daerah}
                                                menuPlacement='auto'
                                                placeholder="Fokus Daerah"
                                                onChange={(val) => setData('focus_daerah', val)}
                                            />
                                            <InputError message={errors.focus_daerah} className="mt-2" />

                                        </div>
                                    </div>

                                </Card>


                                <div className='flex flex-row justify-end mt-4'>
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
        </div>
    )
}

export default Create