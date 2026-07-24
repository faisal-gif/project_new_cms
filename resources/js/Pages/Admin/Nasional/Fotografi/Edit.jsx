import React, { useState, useEffect } from "react";
import { useForm, router, Head } from "@inertiajs/react";
import {
    ArrowLeft,
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
import Card from "@/Components/Card";
import TextInput from "@/Components/TextInput";
import InputTextarea from "@/Components/InputTextarea";
import InputSelect from "@/Components/InputSelect";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputImage from "@/Components/InputImage";
import InputEditor from "@/Components/InputEditor";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";

// Helper untuk format tanggal dari DB (YYYY-MM-DD HH:mm:ss) ke datetime-local (YYYY-MM-DDThh:mm)
const formatForDateTimeLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Mengamankan timezone offset agar waktu tidak bergeser saat diformat
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function Edit({ editors, writers, categories, gallery, isFotografer }) {
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

        // Metadata caption/cover foto yang sudah tersimpan (dikirim saat "Perbarui Galeri")
        existing_images_meta: [],
    });

    // 2. State untuk menampilkan gambar di UI. Foto ditambah/dihapus langsung ke server,
    //    jadi daftar ini disinkronkan ulang dari prop `gallery.images` tiap kali jumlahnya berubah.
    const mapImages = (imgs) => (imgs || []).map(img => ({
        id: img.gi_id, // ID asli dari database
        url: img.gi_image, // URL CDN
        caption: img.gi_caption || "",
        isCover: img.gi_cover === 1,
    }));

    const [images, setImages] = useState(() => mapImages(gallery.images));
    const [uploading, setUploading] = useState(false);
    const [newImageCaption, setNewImageCaption] = useState("");

    // Sinkronkan ulang saat foto ditambah/dihapus (jumlah berubah).
    useEffect(() => {
        setImages(mapImages(gallery.images));
    }, [gallery.images?.length]);

    // Selesai crop → langsung unggah ke CDN (via backend), berikut caption.
    const uploadImage = (file) => {
        if (!file) return;
        setUploading(true);
        router.post(route('admin.nasional.fotografi.images.store', gallery.gal_id), {
            file,
            caption: newImageCaption,
            is_cover: images.length === 0 ? 1 : 0, // foto pertama otomatis cover
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setNewImageCaption(""),
            onFinish: () => setUploading(false),
        });
    };

    // Hapus satu foto: buka AlertDialog konfirmasi dulu, lalu hapus di server.
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const removeImage = (imgId) => setDeleteTargetId(imgId);

    const confirmDelete = () => {
        if (!deleteTargetId) return;
        router.delete(route('admin.nasional.fotografi.images.destroy', deleteTargetId), {
            preserveScroll: true,
        });
    };

    // Set cover disimpan bersama tombol "Perbarui Galeri" (via existing_images_meta).
    const setCover = (imgId) => {
        setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === imgId })));
    };

    // Simpan metadata galeri + caption/cover foto yang sudah tersimpan.
    const handleSubmit = (e) => {
        e.preventDefault();

        data.existing_images_meta = images.map(img => ({
            id: img.id,
            caption: img.caption,
            is_cover: img.isCover ? 1 : 0,
        }));

        // POST + _method:'PUT' (method spoofing Laravel)
        post(route('admin.nasional.fotografi.update', gallery.gal_id));
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

                {/* --- STEP INDICATOR --- */}
                <div className="bg-base-100 p-5 rounded-2xl shadow-sm border border-base-200">
                    <ul className="steps steps-horizontal w-full text-sm">
                        <li className="step step-primary" data-content="✓">Isi Info Galeri</li>
                        <li className="step step-primary font-semibold" data-content="2">Tambah Foto</li>
                    </ul>
                    <p className="text-center text-xs text-base-content/60 mt-3">
                        Langkah 2 dari 2 — tambahkan foto satu per satu. Setiap foto otomatis tersimpan.
                    </p>
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

                        {/* SECTION 3: Image Manager (Kombinasi Existing & Baru) */}
                        <Card padding="p-6 md:p-8" className="border border-base-200">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" /> 3. Kelola Foto
                            </h2>
                            <p className="text-sm text-base-content/60 mb-6 border-b pb-4">
                                Atur foto yang sudah ada, hapus, atau tambahkan foto baru resolusi tinggi (1600x1067).
                            </p>

                            <div className="space-y-6">
                                {/* Upload Box untuk Foto BARU — langsung ke CDN setelah crop */}
                                <div className="bg-base-200/50 rounded-2xl p-6 border-2 border-dashed border-base-300">
                                    <p className="font-medium mb-3 text-sm flex items-center gap-2">
                                        Tambahkan Foto Baru
                                        {uploading && <span className="loading loading-spinner loading-sm"></span>}
                                    </p>

                                    {/* Caption diisi DULU, lalu pilih & crop foto (upload otomatis setelah crop) */}
                                    <div className="mb-4">
                                        <InputTextarea
                                            label="Caption Foto (isi sebelum pilih foto)"
                                            maxLength={255}
                                            placeholder="Ceritakan peristiwa di foto ini..."
                                            value={newImageCaption}
                                            onChange={(e) => setNewImageCaption(e.target.value)}
                                            disabled={uploading}
                                        />
                                    </div>

                                    <InputImage
                                        label=""
                                        targetHeight={1067}
                                        targetWidth={1600}
                                        value={null}
                                        enableCrop={true}
                                        allowPortrait={true}
                                        onChange={uploadImage}
                                        previewClass="h-72 rounded-xl shadow-sm"
                                    />
                                    <p className="text-xs text-base-content/50 mt-2">
                                        Foto langsung terunggah ke CDN begitu selesai di-crop.
                                    </p>
                                    <InputError message={errors.file} className="mt-1" />
                                </div>

                                {/* Empty state — bantu pemula tahu langkah berikutnya */}
                                {images.length === 0 && !uploading && (
                                    <div className="flex flex-col items-center text-center py-10 px-4 rounded-2xl border-2 border-dashed border-base-300 bg-base-100 mt-6">
                                        <ImageIcon className="h-10 w-10 text-base-content/30 mb-3" />
                                        <p className="font-semibold text-base-content">Belum ada foto</p>
                                        <p className="text-sm text-base-content/60 mt-1 max-w-sm">
                                            Isi caption di atas, lalu pilih &amp; crop foto. Foto akan langsung tersimpan dan muncul di sini.
                                        </p>
                                    </div>
                                )}

                                {/* List Gambar */}
                                {images.length > 0 && (
                                    <div className="space-y-3 mt-6">
                                        <h3 className="font-bold text-sm text-base-content/70 uppercase tracking-wider mb-1">
                                            Daftar Foto Saat Ini ({images.length})
                                        </h3>
                                        <p className="text-xs text-base-content/50 mb-3">
                                            Perubahan caption &amp; cover baru tersimpan setelah klik <span className="font-semibold">"Perbarui Galeri"</span>.
                                        </p>
                                        {images.map((img, index) => (
                                            <div key={img.id} className="flex flex-col sm:flex-row gap-4 p-4 mt-4 rounded-xl border border-base-200 bg-base-100 shadow-sm hover:shadow-md transition-all relative">

                                                {/* 1. THUMBNAIL GAMBAR */}
                                                {/* Di mobile menggunakan aspect-video agar proporsional, di desktop menjadi kotak 32x24 */}
                                                <div className="relative w-full aspect-video sm:aspect-auto sm:w-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-base-300">
                                                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                                                    {img.isCover && (
                                                        <span className="badge badge-warning font-bold absolute top-2 left-2 shadow-sm text-xs">
                                                            COVER
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 2. AREA CAPTION */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
                                                    <p className="text-sm font-bold text-primary">Foto {index + 1}</p>
                                                    <input
                                                        type="text"
                                                        className="input input-sm input-bordered w-full text-sm italic"
                                                        value={img.caption}
                                                        onChange={(e) => {
                                                            setImages(prev => prev.map(i => i.id === img.id ? { ...i, caption: e.target.value } : i))
                                                        }}
                                                        placeholder="Masukkan caption foto..."
                                                    />
                                                </div>

                                                {/* 3. AREA TOMBOL AKSI */}
                                                {/* Di mobile menggunakan Grid 2 Kolom agar sejajar rapi, di desktop menggunakan flex column */}
                                                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 items-center justify-center border-t sm:border-t-0 sm:border-l border-base-200 pt-4 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm w-full ${img.isCover ? 'btn-warning' : 'btn-ghost border-base-300'}`}
                                                        onClick={() => setCover(img.id)}
                                                    >
                                                        {img.isCover ? <Star className="h-4 w-4 mr-1 sm:mr-0 lg:mr-1" /> : <StarOff className="h-4 w-4 mr-1 sm:mr-0 lg:mr-1 text-base-content/50" />}
                                                        <span className="sm:hidden lg:inline">{img.isCover ? 'Cover Aktif' : 'Jadikan Cover'}</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm w-full btn-outline border-base-300 text-error hover:bg-error hover:border-error hover:text-white"
                                                        onClick={() => removeImage(img.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1 sm:mr-0 lg:mr-1" />
                                                        <span className="sm:hidden lg:inline">Hapus</span>
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
                                disabled={processing}
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

            {/* Dialog konfirmasi hapus foto (shadcn) */}
            <AlertDialog
                open={deleteTargetId !== null}
                onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus foto ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Foto akan dihapus permanen dan tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmDelete}>
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}