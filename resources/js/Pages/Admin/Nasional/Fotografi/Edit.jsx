import React, { useState, useEffect } from "react";
import { useForm, router, Head } from "@inertiajs/react";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Star,
    StarOff,
    Image as ImageIcon,
    Save,
    FileText,
    MapPin
} from "lucide-react";
import Select from "react-select";

// Komponen Kustom
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import InputTextarea from "@/components/InputTextarea";
import InputSelect from "@/components/InputSelect";
import InputLabel from "@/components/InputLabel";
import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputImage from "@/Components/InputImage";
import InputEditor from "@/Components/InputEditor";

// Helper untuk format tanggal dari DB (YYYY-MM-DD HH:mm:ss) ke datetime-local (YYYY-MM-DDThh:mm)
const formatForDateTimeLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Mengamankan timezone offset agar waktu tidak bergeser saat diformat
    const tzOffset = date.getTimezoneOffset() * 60000; 
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function Edit({ editors, writers, categories, gallery }) {
    // 1. Inisialisasi useForm dengan data yang sudah ada dari prop 'gallery'
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // Wajib untuk upload file saat update di Laravel
        title: gallery.gal_title || "",
        subtitle: gallery.gal_subtitle || "",
        description: gallery.gal_description || "",
        content: gallery.gal_content || "",
        city: gallery.gal_city || "",
        fotografer: gallery.gal_pewarta || "",
        fotografer_id: gallery.fotografer_id || "", 
        editor: gallery.editor_id || "", 
        categoryId: gallery.gal_catid?.toString() || "", // Pastikan string untuk InputSelect
        status: gallery.gal_status?.toString() || "0", // Pastikan string
        datepub: formatForDateTimeLocal(gallery.gal_datepub),
        
        // Array khusus untuk dikirim ke backend
        new_images: [], 
        existing_images_meta: [], 
        deleted_images: [], // Menyimpan ID gambar lama yang dihapus user
    });

    // 2. State untuk menampilkan gambar di UI (kombinasi lama & baru)
    const [images, setImages] = useState(() => {
        if (!gallery.images) return [];
        return gallery.images.map(img => ({
            id: img.gi_id, // ID asli dari database
            is_existing: true, // Penanda bahwa ini gambar dari DB
            url: img.gi_image, // URL CDN
            caption: img.gi_caption || "",
            isCover: img.gi_cover === 1,
        }));
    });

    const [newImageCaption, setNewImageCaption] = useState("");
    const [pendingImageFile, setPendingImageFile] = useState(null);

    // Fungsi Tambah Gambar (Mirip Create, tapi is_existing: false)
    const addImage = () => {
        if (!pendingImageFile) {
            alert("Pilih gambar terlebih dahulu");
            return;
        }

        const previewUrl = URL.createObjectURL(pendingImageFile);
        const newImg = {
            id: `new-${Date.now()}`, // ID sementara untuk UI
            is_existing: false, // Penanda ini gambar baru
            file: pendingImageFile,
            url: previewUrl,
            fileName: pendingImageFile.name,
            caption: newImageCaption,
            isCover: images.length === 0, // Cover otomatis jika ini foto pertama
        };

        setImages((prev) => [...prev, newImg]);
        setPendingImageFile(null);
        setNewImageCaption("");
    };

    // Fungsi Hapus Gambar (Logika kompleks Existing vs New)
    const removeImage = (imgId) => {
        const imgToRemove = images.find(img => img.id === imgId);
        
        // Jika yang dihapus adalah gambar dari DB, catat ID-nya ke data.deleted_images
        if (imgToRemove && imgToRemove.is_existing) {
            setData('deleted_images', [...data.deleted_images, imgToRemove.id]);
        }

        // Hapus dari state visual
        setImages((prev) => {
            // Jika gambar baru, bersihkan memori blob
            if (imgToRemove && !imgToRemove.is_existing && imgToRemove.url.startsWith('blob:')) {
                URL.revokeObjectURL(imgToRemove.url); 
            }
            const filtered = prev.filter((img) => img.id !== imgId);
            
            // Re-assign cover jika cover dihapus dan masih ada gambar tersisa
            if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
                filtered[0].isCover = true;
            }
            return filtered;
        });
    };

    // Fungsi Set Cover (Sama seperti Create)
    const setCover = (imgId) => {
        setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === imgId })));
    };

    // Fungsi Submit (Logika Pengelompokan Data Gambar)
    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Pisahkan gambar baru (berupa File) untuk diupload ke CDN
        data.new_images = images
            .filter(img => !img.is_existing)
            .map(img => ({
                file: img.file,
                caption: img.caption,
                is_cover: img.isCover ? 1 : 0,
            }));

        // 2. Pisahkan metadata gambar lama (jika user ubah caption/cover langsung di list)
        data.existing_images_meta = images
            .filter(img => img.is_existing)
            .map(img => ({
                id: img.id,
                caption: img.caption,
                is_cover: img.isCover ? 1 : 0,
            }));

        // Submit menggunakan method POST (Inertia akan mengubahnya jadi PUT berkat _method: 'PUT')
        post(route('admin.nasional.fotografi.update', gallery.gal_id), {
            forceFormData: true, // Wajib agar file terkirim dengan method spoofing PUT
        });
    };

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
            <Head title={`Edit Galeri - ${gallery.gal_title}`} />
            
            <div className="space-y-6 max-w-7xl mx-auto pb-12">

                {/* --- HEADER --- */}
                <div className="flex items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
                    <button className="btn btn-ghost btn-circle" onClick={() => router.visit(route("admin.nasional.fotografi.index"))}>
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-base-content">Edit Galeri Foto</h1>
                        <p className="text-base-content/60 mt-1 text-sm md:text-base line-clamp-1">
                            Perbarui informasi dan kelola foto-foto untuk: <span className="font-semibold text-base-content">{gallery.gal_title}</span>
                        </p>
                    </div>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* KOLOM KIRI (Lebar 2/3) */}
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
                                        placeholder="Judul galeri..."
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
                                        value={editors.find(e => e.value === data.editor) || null}
                                        options={editors}
                                        placeholder="Pilih Editor..."
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
                                        value={writers.find(w => w.label === data.fotografer) || null}
                                        options={writers}
                                        placeholder="Pilih Fotografer..."
                                        onChange={(val) => {
                                            setData('fotografer', val?.label);
                                            setData('fotografer_id', val?.value);
                                        }}
                                        styles={customSelectStyles}
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

                        {/* SECTION 3: Image Manager (Kombinasi Existing & Baru) */}
                        <Card padding="p-6 md:p-8" className="border border-base-200">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" /> 3. Kelola Foto
                            </h2>
                            <p className="text-sm text-base-content/60 mb-6 border-b pb-4">
                                Atur foto yang sudah ada, hapus, atau tambahkan foto baru resolusi tinggi (1600x1067).
                            </p>

                            <div className="space-y-6">
                                {/* Upload Box untuk Foto BARU */}
                                <div className="bg-base-200/50 rounded-2xl p-6 border-2 border-dashed border-base-300">
                                    <p className="font-medium mb-3 text-sm">Tambahkan Foto Baru</p>
                                    <InputImage
                                        label=""
                                        targetHeight={1067}
                                        targetWidth={1600}
                                        value={pendingImageFile}
                                        enableCrop={true}
                                        onChange={(file) => setPendingImageFile(file)}
                                        previewClass="h-72 rounded-xl shadow-sm"
                                    />

                                    {pendingImageFile && (
                                        <div className="space-y-3 mt-6 p-4 bg-base-100 rounded-xl border border-base-200 shadow-sm animate-fade-in">
                                            <InputTextarea
                                                label="Caption Foto (Wajib)"
                                                maxLength={255}
                                                placeholder="Caption foto..."
                                                value={newImageCaption}
                                                onChange={(e) => setNewImageCaption(e.target.value)}
                                            />
                                            <button type="button" className="btn btn-primary w-full" onClick={addImage}>
                                                <Plus className="h-5 w-5 mr-1" /> Simpan Foto ke Daftar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* List Gambar (Existing + New) */}
                                {images.length > 0 && (
                                    <div className="space-y-3 mt-6">
                                        <h3 className="font-bold text-sm text-base-content/70 uppercase tracking-wider mb-3">
                                            Daftar Foto Saat Ini ({images.length})
                                        </h3>
                                        {images.map((img, index) => (
                                            <div key={img.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-base-200 bg-base-100 shadow-sm hover:shadow-md transition-shadow relative">
                                                
                                                {/* Label Existing vs New */}
                                                <span className={`badge badge-sm absolute -top-2 -right-2 font-bold ${img.is_existing ? 'badge-neutral' : 'badge-success text-white'}`}>
                                                    {img.is_existing ? 'Tersimpan' : 'Baru'}
                                                </span>

                                                <div className="relative w-full sm:w-32 h-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-base-300">
                                                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                                                    {img.isCover && (
                                                        <span className="badge badge-warning font-bold absolute top-2 left-2 shadow-sm">COVER</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
                                                    <p className="text-sm font-bold text-primary">Foto {index + 1}</p>
                                                    {/* Input Caption langsung editable di list */}
                                                    <input 
                                                        type="text" 
                                                        className="input input-sm input-bordered w-full text-sm italic" 
                                                        value={img.caption}
                                                        onChange={(e) => {
                                                            setImages(prev => prev.map(i => i.id === img.id ? { ...i, caption: e.target.value } : i))
                                                        }}
                                                        placeholder="Masukkan caption..."
                                                    />
                                                </div>
                                                <div className="flex sm:flex-col gap-2 items-center justify-center border-t sm:border-t-0 sm:border-l border-base-200 pt-3 sm:pt-0 sm:pl-4">
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm w-full sm:w-auto ${img.isCover ? 'btn-warning' : 'btn-ghost'}`}
                                                        onClick={() => setCover(img.id)}
                                                    >
                                                        {img.isCover ? <Star className="h-4 w-4 mr-1" /> : <StarOff className="h-4 w-4 mr-1" />}
                                                        <span className="sm:hidden">Jadikan Cover</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-ghost text-error w-full sm:w-auto"
                                                        onClick={() => removeImage(img.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        <span className="sm:hidden">Hapus</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* KOLOM KANAN (Lebar 1/3) - Pengaturan Publikasi Sticky */}
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

                                <div>
                                    <InputLabel value="Tanggal Publikasi" className="font-bold mb-2" />
                                    <TextInput
                                        type="datetime-local"
                                        value={data.datepub}
                                        onChange={(e) => setData("datepub", e.target.value)}
                                        className="w-full bg-base-100"
                                    />
                                </div>

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
                            </div>
                        </Card>

                        {/* Action Buttons Panel */}
                        <div className="bg-base-100 p-4 rounded-2xl shadow-md border border-base-200 space-y-3">
                            <button
                                className="btn btn-primary w-full text-base"
                                onClick={handleSubmit}
                                disabled={processing || images.length === 0}
                            >
                                {processing ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <><Save className="h-5 w-5 mr-2" /> Perbarui Galeri</>
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