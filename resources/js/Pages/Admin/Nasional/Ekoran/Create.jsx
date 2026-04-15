import React, { useState } from "react";
import { useForm, router, Head } from "@inertiajs/react";
import { ArrowLeft, Megaphone, Save, BookOpen } from "lucide-react";

// Komponen Kustom
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import InputSelect from "@/components/InputSelect";
import InputLabel from "@/components/InputLabel";
import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputMultiImage from "@/Components/InputMultiImage"; // Import komponen baru

const MAX_REGULAR_PAGES = 20;
const MAX_PROMO_PAGES = 2;

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        datepub: "",
        emagazineId: "",
        status: "0",
        regular_pages: [], // Akan diisi saat submit
        promo_pages: [],   // Akan diisi saat submit
    });

    // Local state UI untuk menampung gambar dari komponen InputMultiImage
    const [regularPages, setRegularPages] = useState([]);
    const [promoPages, setPromoPages] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ekstrak object File asli sebelum dikirim ke backend
        data.regular_pages = regularPages.map(p => p.fileObj);
        data.promo_pages = promoPages.map(p => p.fileObj);

        // Sesuaikan route ini dengan backend Anda
        post(route('admin.ekoran.store')); 
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah eKoran" />
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                
                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
                    <button type="button" className="btn btn-ghost btn-circle" onClick={() => router.visit("/daftar-ekoran")}>
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-base-content">Tambah eKoran</h1>
                        <p className="text-base-content/60 mt-1 text-sm md:text-base">
                            Maks {MAX_REGULAR_PAGES} halaman reguler + {MAX_PROMO_PAGES} halaman iklan/promo
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* KOLOM KIRI */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. Informasi Edisi */}
                        <Card title="Informasi Edisi" padding="p-6 md:p-8" className="border border-base-200">
                            <div className="space-y-5">
                                <div className="w-full">
                                    <InputLabel value="Judul Edisi *" className="font-bold mb-2" />
                                    <TextInput
                                        placeholder="Contoh: Edisi Pagi - 15 Januari 2025"
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        className="w-full bg-base-200 focus:bg-base-100"
                                    />
                                    <InputError message={errors.title} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="w-full">
                                        <InputLabel value="Tanggal Terbit *" className="font-bold mb-2" />
                                        <TextInput
                                            type="date"
                                            value={data.datepub}
                                            onChange={(e) => setData("datepub", e.target.value)}
                                            className="w-full bg-base-200 focus:bg-base-100"
                                        />
                                        <InputError message={errors.datepub} className="mt-1" />
                                    </div>
                                    <div className="w-full">
                                        <InputLabel value="eMagazine ID (Opsional)" className="font-bold mb-2" />
                                        <TextInput
                                            placeholder="Opsional"
                                            value={data.emagazineId}
                                            onChange={(e) => setData("emagazineId", e.target.value)}
                                            className="w-full bg-base-200 focus:bg-base-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 2. Halaman Reguler */}
                        <Card padding="p-6 md:p-8" className="border border-base-200">
                            <h2 className="text-xl font-bold mb-6 border-b pb-3 flex justify-between items-center">
                                <span>Halaman Reguler</span>
                                <span className="text-sm font-normal badge badge-neutral">
                                    {regularPages.length} / {MAX_REGULAR_PAGES}
                                </span>
                            </h2>
                            
                            {/* Pemanggilan Komponen Multi Upload */}
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

                        {/* 3. Halaman Ekoran Khusus */}
                        <Card padding="p-6 md:p-8" className="border border-base-200">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-warning" /> Halaman Ekoran Khusus
                            </h2>
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <p className="text-sm text-base-content/60">Halaman sisipan khusus.</p>
                                <span className="text-sm badge badge-warning">
                                    {promoPages.length} / {MAX_PROMO_PAGES}
                                </span>
                            </div>

                            {/* Pemanggilan Komponen Multi Upload dengan Tema Warning */}
                            <InputMultiImage 
                                label="Upload halaman iklan/promo"
                                subLabel={`Maks ${MAX_PROMO_PAGES} halaman.`}
                                icon={Megaphone}
                                maxFiles={MAX_PROMO_PAGES}
                                value={promoPages}
                                onChange={setPromoPages}
                                themeColor="warning"
                            />
                            <InputError message={errors.promo_pages} className="mt-2" />
                        </Card>
                    </div>

                    {/* KOLOM KANAN (Pengaturan Sticky) */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
                        <Card title="Pengaturan Publikasi" padding="p-6" className="border border-base-200 shadow-md bg-primary/5">
                            <div className="space-y-5">
                                <div>
                                    <InputLabel value="Status" className="font-bold mb-2" />
                                    <InputSelect
                                        options={[
                                            { value: "0", label: "📄 Simpan sebagai Draft" },
                                            { value: "1", label: "✅ Langsung Publish" }
                                        ]}
                                        value={data.status}
                                        onChange={(e) => setData("status", e.target.value)}
                                        className="bg-base-100"
                                    />
                                    <InputError message={errors.status} className="mt-1" />
                                </div>

                                {/* Summary Box */}
                                <div className="rounded-xl border border-base-300 bg-base-100 p-4 text-sm space-y-2 shadow-sm">
                                    <p className="flex justify-between">
                                        <span className="text-base-content/60">Halaman Reguler:</span> 
                                        <span className="font-bold text-base-content">{regularPages.length}/{MAX_REGULAR_PAGES}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-base-content/60">Ekoran Khusus:</span> 
                                        <span className="font-bold text-base-content">{promoPages.length}/{MAX_PROMO_PAGES}</span>
                                    </p>
                                    <div className="divider my-1"></div>
                                    <p className="flex justify-between font-bold text-primary">
                                        <span>Total Upload:</span> 
                                        <span>{regularPages.length + promoPages.length} Halaman</span>
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div className="bg-base-100 p-4 rounded-2xl shadow-md border border-base-200 space-y-3">
                            <button
                                type="button"
                                className="btn btn-primary w-full text-base"
                                onClick={handleSubmit}
                                disabled={processing || regularPages.length === 0}
                            >
                                {processing ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <><Save className="h-5 w-5 mr-2" /> Simpan eKoran</>
                                )}
                            </button>
                            <div className="divider my-1"></div>
                            <button
                                type="button"
                                className="btn btn-ghost btn-block text-base-content/60"
                                onClick={() => router.visit("/daftar-ekoran")}
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