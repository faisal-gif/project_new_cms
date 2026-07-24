import React from "react";
import { useForm, router } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    FileText,
    MapPin
} from "lucide-react";
import Select from "react-select";

// Komponen Kustom
import Card from "@/Components/Card";
import TextInput from "@/Components/TextInput";
import InputTextarea from "@/Components/InputTextarea";
import InputSelect from "@/Components/InputSelect";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputEditor from "@/Components/InputEditor";


export default function Create({ editors, writers, categories, isFotografer, userFotograferId }) {

    const defaultFotografer = isFotografer
        ? writers.find(w => String(w.value) === String(userFotograferId))
        : null;

    const { data, setData, post, processing, errors } = useForm({
        title: "",
        subtitle: "",
        description: "",
        content: "",
        city: "",
        fotografer: isFotografer && defaultFotografer ? defaultFotografer.label : "",
        fotografer_id: isFotografer ? userFotograferId : "",
        editor: "",
        categoryId: "",
        status: "2",
        datepub: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simpan metadata saja; setelah berhasil di-redirect ke Edit untuk menambah foto.
        post(route('admin.nasional.fotografi.store'), data);
    };

    // Styling khusus untuk react-select agar selaras dengan DaisyUI & tidak tertimpa editor
    const customSelectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '3rem',
            borderRadius: '0.5rem',
            borderColor: '#d1d5db',
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    return (
        <AuthenticatedLayout>
            <div className="space-y-6 max-w-7xl mx-auto pb-12">

                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
                    <button className="btn btn-ghost btn-circle" onClick={() => router.visit(route("admin.nasional.fotografi.index"))}>
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-base-content">Tambah Galeri Foto</h1>
                        <p className="text-base-content/60 mt-1 text-sm md:text-base">
                            Isi informasi galeri terlebih dahulu. Setelah disimpan, Anda akan diarahkan untuk menambahkan foto satu per satu.
                        </p>
                    </div>
                </div>

                {/* --- STEP INDICATOR (orientasi alur 2 langkah) --- */}
                <div className="bg-base-100 p-5 rounded-2xl shadow-sm border border-base-200">
                    <ul className="steps steps-horizontal w-full text-sm">
                        <li className="step step-primary font-semibold" data-content="1">Isi Info Galeri</li>
                        <li className="step" data-content="2">Tambah Foto</li>
                    </ul>
                    <p className="text-center text-xs text-base-content/60 mt-3">
                        Langkah 1 dari 2 — setelah galeri disimpan, Anda akan diarahkan untuk menambahkan foto.
                    </p>
                </div>

                {/* --- MAIN GRID (3 Columns) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* KOLOM KIRI (Lebar 2/3) - Area Input Utama */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* SECTION 1: Informasi Utama */}
                        <Card padding="p-6 md:p-8" className="border border-base-200">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-3">
                                <FileText className="h-5 w-5 text-primary" /> 1. Informasi Utama
                            </h2>
                            <div className="space-y-5">
                                <div className="w-full">
                                    <InputLabel value="Judul Galeri *" className="font-bold text-base mb-2" />
                                    <TextInput
                                        placeholder="Contoh: Evakuasi Warga Terdampak Banjir Demak..."
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        className="w-full input-lg bg-base-200 focus:bg-base-100"
                                    />
                                    <InputError message={errors.title} className="mt-1" />
                                </div>

                                <div className="w-full">
                                    <InputLabel value="Subtitle (Opsional)" className="font-bold mb-2" />
                                    <TextInput
                                        placeholder="Tambahan keterangan judul..."
                                        value={data.subtitle}
                                        onChange={(e) => setData("subtitle", e.target.value)}
                                        className="w-full bg-base-200 focus:bg-base-100"
                                    />
                                </div>

                                <InputTextarea
                                    label="Deskripsi Singkat (Maks 150 Karakter)"
                                    placeholder="Tuliskan ringkasan yang akan muncul di halaman depan..."
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    maxLength={150}
                                    rows={3}
                                    className="bg-base-200 focus:bg-base-100"
                                />

                                <div className="w-full">
                                    <InputLabel value="Narasi / Konten Lengkap" className="font-bold mb-2" />
                                    <div className="rounded-xl overflow-hidden border border-base-300">
                                        <InputEditor
                                            value={data.content}
                                            height={500}
                                            onChange={(content) => setData("content", content)}
                                            enableImageUpload={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* SECTION 2: Detail Tim & Lokasi */}
                        <Card padding="p-6 md:p-8" className="border border-base-200">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-3">
                                <MapPin className="h-5 w-5 text-primary" /> 2. Detail Tim & Lokasi
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="w-full">
                                    <InputLabel value="Editor *" className="font-bold mb-2" />
                                    <Select
                                        value={editors.find(e => e.value === data.editor)}
                                        options={editors}
                                        placeholder="Pilih Editor yang bertugas..."
                                        onChange={(val) => setData('editor', val?.value)}
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                    />
                                    <InputError message={errors.editor} className="mt-1" />
                                </div>

                                <div className="w-full">
                                    <InputLabel value="Fotografer/Pewarta *" className="font-bold mb-2" />
                                    <Select
                                        value={writers.find(w => String(w.value) === String(data.fotografer_id)) || null}
                                        options={writers}
                                        placeholder="Pilih Fotografer..."
                                        onChange={(val) => {
                                            setData('fotografer', val?.label);
                                            setData('fotografer_id', val?.value);
                                        }}
                                        styles={customSelectStyles}
                                        isDisabled={isFotografer}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                    />
                                    <InputError message={errors.writer} className="mt-1" />
                                </div>

                                <div className="w-full md:col-span-2">
                                    <InputLabel value="Kota Liputan" className="font-bold mb-2" />
                                    <TextInput
                                        placeholder="Contoh: Jakarta Pusat"
                                        value={data.city}
                                        onChange={(e) => setData("city", e.target.value)}
                                        className="w-full bg-base-200 focus:bg-base-100"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* KOLOM KANAN (Lebar 1/3) - Pengaturan Publikasi yang Sticky */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">

                        <Card title="Pengaturan Publikasi" padding="p-6" className="border border-base-200 shadow-md bg-primary/5">
                            <div className="space-y-5">
                                <div>
                                    <InputLabel value="Kategori Berita *" className="font-bold mb-2" />
                                    <InputSelect
                                        options={categories.map(c => ({ value: c.value, label: c.label }))}
                                        value={data.categoryId}
                                        onChange={(e) => setData("categoryId", e.target.value)}
                                        className="bg-base-100"
                                    />
                                    <InputError message={errors.categoryId} className="mt-1" />
                                </div>

                                {/* INPUT DATEPUB */}
                                <div>
                                    <InputLabel value="Tanggal Publikasi" className="font-bold mb-2" />
                                    <TextInput
                                        type="datetime-local"
                                        value={data.datepub}
                                        onChange={(e) => setData("datepub", e.target.value)}
                                        className="w-full bg-base-100"
                                    />
                                    <InputError message={errors.datepub} className="mt-1" />
                                </div>


                                {isFotografer !== true && (
                                    <div>
                                        <InputLabel value="Status" className="font-bold mb-2" />
                                        <InputSelect
                                            options={[
                                                { value: "0", label: "Pending" },
                                                { value: "2", label: "Review" },
                                                { value: "3", label: "On Pro" },
                                                { value: "1", label: "Publish" }
                                            ]}
                                            value={data.status}
                                            onChange={(e) => setData("status", e.target.value)}
                                            className="bg-base-100 font-medium"
                                        />
                                    </div>
                                )}

                            </div>
                        </Card>

                        {/* Action Buttons Panel */}
                        <div className="bg-base-100 p-4 rounded-2xl shadow-md border border-base-200 space-y-3">
                            <button
                                className="btn btn-primary w-full text-base"
                                onClick={handleSubmit}
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <>Lanjut: Tambah Foto <ArrowRight className="h-5 w-5 ml-2" /></>
                                )}
                            </button>

                            <div className="divider my-1"></div>

                            <button
                                className="btn btn-ghost btn-block text-base-content/60"
                                onClick={() => router.visit(route("admin.nasional.fotografi.index"))}
                            >
                                Batal & Kembali
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
