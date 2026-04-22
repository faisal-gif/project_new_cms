import React, { useState, useEffect } from "react";
import { useForm, router, Head } from "@inertiajs/react";
import { ArrowLeft, Megaphone, Save, BookOpen } from "lucide-react";

import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import InputSelect from "@/components/InputSelect";
import InputLabel from "@/components/InputLabel";
import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputMultiImage from "@/Components/InputMultiImage";
import { Badge } from "@/Components/ui/badge";

const MAX_REGULAR_PAGES = 20;
const MAX_PROMO_PAGES = 2;

export default function Edit({ ekoran }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        title: ekoran.title || "",
        datepub: ekoran.datepub || "",
        emagazineId: ekoran.emagazine_id || "",
        status: ekoran.status?.toString() || "0",
        regular_pages: [],
        spesial_pages: [],
        _method: 'put', // Spoofing method wajib di Laravel untuk Update form-data
    });

    const [regularPages, setRegularPages] = useState([]);
    const [spesialPages, setSpesialPages] = useState([]);

    // Initialize data gambar lama dari database saat komponen dimount
    useEffect(() => {
        const initialRegular = [];
        for (let i = 1; i <= MAX_REGULAR_PAGES; i++) {
            if (ekoran[`img${i}`]) {
                initialRegular.push({
                    id: `old-reg-${i}`,
                    fileName: `img${i}`,
                    previewUrl: ekoran[`img${i}`], // <- Ubah ini menjadi previewUrl
                    fileObj: null,
                    isExisting: true
                });
            }
        }
        setRegularPages(initialRegular);

        const initialSpesial = [];
        for (let i = 21; i <= 21 + MAX_PROMO_PAGES - 1; i++) {
            if (ekoran[`img${i}`]) {
                initialSpesial.push({
                    id: `old-reg-${i}`,
                    fileName: `img${i}`,
                    previewUrl: ekoran[`img${i}`], // <- Ubah ini menjadi previewUrl
                    fileObj: null,
                    isExisting: true
                });
            }
        }
        setSpesialPages(initialSpesial);
    }, [ekoran]);


    const handleSubmit = (e) => {
        e.preventDefault();

        // Gunakan transform untuk memodifikasi payload tepat sebelum dikirim
        transform((currentData) => ({
            ...currentData,
            regular_pages: regularPages.map(p => p.fileObj || p.previewUrl),
            spesial_pages: spesialPages.map(p => p.fileObj || p.previewUrl),
        }));

        // Eksekusi post
        post(route('admin.nasional.ekoran.update', ekoran.id), {
            forceFormData: true
        });
    };



    return (
        <AuthenticatedLayout>
            <Head title="Edit eKoran" />
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
                    <button type="button" className="btn btn-ghost btn-circle" onClick={() => router.visit("/daftar-ekoran")}>
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-base-content">Edit eKoran: {ekoran.title}</h1>
                        <p className="text-base-content/60 mt-1 text-sm md:text-base">
                            Maks {MAX_REGULAR_PAGES} halaman reguler + {MAX_PROMO_PAGES} halaman iklan/promo
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* KOLOM KIRI */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Informasi Edisi (Sama persis dengan Create, hubungkan ke value data.x) */}
                        <Card title="Informasi Edisi" padding="p-6 md:p-8" className="border border-base-200">
                            <div className="space-y-5">
                                <div className="w-full flex flex-col">
                                    <InputLabel value="Judul Edisi *" className="font-bold mb-2" />
                                    <TextInput value={data.title} onChange={(e) => setData("title", e.target.value)} className="w-full bg-base-200 focus:bg-base-100" />
                                    <InputError message={errors.title} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="w-full">
                                        <InputLabel value="Tanggal Terbit *" className="font-bold mb-2" />
                                        <TextInput type="date" value={data.datepub} onChange={(e) => setData("datepub", e.target.value)} className="w-full bg-base-200 focus:bg-base-100" />
                                        <InputError message={errors.datepub} className="mt-1" />
                                    </div>
                                    <div className="w-full">
                                        <InputLabel value="eMagazine ID (Opsional)" className="font-bold mb-2" />
                                        <TextInput value={data.emagazineId} onChange={(e) => setData("emagazineId", e.target.value)} className="w-full bg-base-200 focus:bg-base-100" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 2. Halaman Reguler */}
                        <Card padding="p-6 md:p-8" className="border border-base-200">
                            <h2 className="text-xl font-bold mb-6 border-b pb-3 flex justify-between items-center">
                                <span>Halaman Reguler</span>
                                <Badge className="bg-neutral/10 text-neutral text-sm font-normal badge">{regularPages.length} / {MAX_REGULAR_PAGES}</Badge>
                            </h2>
                            <InputMultiImage
                                label="Klik untuk upload halaman reguler"
                                icon={BookOpen}
                                maxFiles={MAX_REGULAR_PAGES}
                                value={regularPages}
                                onChange={setRegularPages}
                                themeColor="primary"
                            />
                            <InputError message={errors.regular_pages} className="mt-2" />
                        </Card>

                        {/* 3. Halaman Promo */}
                        <Card padding="p-6 md:p-8" className="border border-base-200">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-warning" /> Halaman Ekoran Khusus
                            </h2>
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <p className="text-sm text-base-content/60">Halaman sisipan khusus.</p>
                                <Badge className="bg-warning/10 text-warning text-sm font-normal badge">{spesialPages.length} / {MAX_PROMO_PAGES}</Badge>
                            </div>
                            <InputMultiImage
                                label="Upload halaman iklan/promo"
                                maxFiles={MAX_PROMO_PAGES}
                                value={spesialPages}
                                onChange={setSpesialPages}
                                themeColor="warning"
                            />
                            <InputError message={errors.spesial_pages} className="mt-2" />
                        </Card>
                    </div>

                    {/* KOLOM KANAN (Sama dengan Create) */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
                        <Card title="Pengaturan Publikasi" padding="p-6" className="border border-base-200 shadow-md bg-primary/5">
                            <div className="space-y-5">
                                <div>
                                    <InputLabel value="Status" className="font-bold mb-2" />
                                    <InputSelect
                                        options={[{ value: "0", label: "📄 Draft" }, { value: "1", label: "✅ Published" }]}
                                        value={data.status} onChange={(e) => setData("status", e.target.value)} className="bg-base-100"
                                    />
                                    <InputError message={errors.status} className="mt-1" />
                                </div>
                                <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm space-y-2 shadow-sm">
                                    <p className="flex justify-between"><span className="text-base-content/60">Total:</span><span className="font-bold">{regularPages.length + spesialPages.length} Halaman</span></p>
                                </div>
                            </div>
                        </Card>

                        <div className="bg-base-100 p-4 rounded-2xl shadow-md border border-base-200 space-y-3">
                            <button type="button" className="btn btn-warning w-full text-base" onClick={handleSubmit} disabled={processing || regularPages.length === 0}>
                                {processing ? <span className="loading loading-spinner"></span> : <><Save className="h-5 w-5 mr-2" /> Update eKoran</>}
                            </button>
                            <button type="button" className="btn btn-ghost btn-block text-base-content/60" onClick={() => router.visit("/daftar-ekoran")}>
                                Batal & Kembali
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}