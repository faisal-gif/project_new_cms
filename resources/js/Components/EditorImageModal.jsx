import { useEffect, useState, useRef } from "react";
import Tabs from "@/Components/Tabs";
import Checkbox from "./Checkbox";
import TextInput from "./TextInput";
import InputLabel from "./InputLabel";
import imageCompression from "browser-image-compression";

// Import react-image-crop dan CSS-nya
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function EditorImageModal() {
    const [show, setShow] = useState(false);
    const [editor, setEditor] = useState(null);
    const [tab, setTab] = useState("upload");

    const [file, setFile] = useState(null); // File yang sudah dikompresi
    const [originalFileName, setOriginalFileName] = useState(""); // Menyimpan nama file asli
    const [imageName, setImageName] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [watermark, setWatermark] = useState(true);
    const [error, setError] = useState("");

    // --- State & Ref untuk react-image-crop ---
    const [previewUrl, setPreviewUrl] = useState(null); // URL pratinjau dari file yang terkompresi
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            setEditor(e.detail.editor);
            setShow(true);
        };

        window.addEventListener("open-editor-image-modal", handler);
        return () =>
            window.removeEventListener("open-editor-image-modal", handler);
    }, []);

    const resetAndClose = () => {
        setShow(false);
        setFile(null);
        setOriginalFileName("");
        setImageUrl("");
        setImageName("");
        setTab("upload");
        setError("");
        setCrop(undefined);
        setCompletedCrop(null);

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
    };

    const countImages = () => {
        if (!editor) return 0;
        const content = editor.getContent();
        const doc = new DOMParser().parseFromString(content, "text/html");
        return doc.querySelectorAll("img").length;
    };

    const insertImage = (src, name) => {
        if (countImages() >= 2) {
            editor.notificationManager.open({
                text: "Maksimal 2 gambar dalam artikel",
                type: "warning",
            });
            return;
        }

        editor.insertContent(
            ` <figure class="image">
                    <img src="${src}" alt="${name}" title="${name}" />
                    <figcaption>${name}</figcaption>
                </figure>`
        );
    };

    // Fungsi utilitas untuk memotong gambar menggunakan Canvas API
    const getCroppedImg = async (imageElement, crop, fileNameToUse) => {
        const canvas = document.createElement('canvas');

        // 1. Hitung skala: Ukuran Asli File dibagi Ukuran Tampilan di Layar
        const scaleX = imageElement.naturalWidth / imageElement.width;
        const scaleY = imageElement.naturalHeight / imageElement.height;

        // 2. Hitung ukuran resolusi tinggi yang sebenarnya
        const actualWidth = crop.width * scaleX;
        const actualHeight = crop.height * scaleY;

        // 3. Set kanvas menggunakan ukuran resolusi tinggi
        canvas.width = actualWidth;
        canvas.height = actualHeight;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imageElement,
            crop.x * scaleX,
            crop.y * scaleY,
            actualWidth,
            actualHeight,
            0,
            0,
            actualWidth,
            actualHeight
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const newFile = new File([blob], fileNameToUse, {
                    type: 'image/webp',
                    lastModified: Date.now(),
                });
                resolve(newFile);
            }, 'image/webp', 1.0); 
        });
    };

    const onImageLoad = (e) => {
        setCrop({
            unit: '%',
            x: 5,
            y: 5,
            width: 90,
            height: 90
        });
    };

    // --- FUNGSI BARU: Kompresi saat memilih file ---
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setLoading(true);
        setError("");

        try {
            // Opsi kompresi
            const options = {
                maxSizeMB: 1.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            // Kompres gambar SEBELUM masuk ke preview/crop
            const compressedFile = await imageCompression(selectedFile, options);
            
            setFile(compressedFile);
            setOriginalFileName(selectedFile.name);
            setPreviewUrl(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error(error);
            setError("Gagal memproses gambar saat dipilih.");
        } finally {
            setLoading(false);
        }
    };

    const upload = async () => {
        if (!file || !editor) return;

        if (!imageName.trim()) {
            setError("Nama gambar wajib diisi");
            return;
        }

        setError("");
        setLoading(true);

        if (countImages() >= 2) {
            editor.notificationManager.open({
                text: "Maksimal 2 gambar dalam artikel",
                type: "warning",
            });
            setLoading(false);
            return;
        }

        try {
            // ⭐ Karena gambar SUDAH dikompresi di awal, kita hanya perlu mengekstrak hasil crop
            let finalFileToUpload = file;

            if (completedCrop?.width && completedCrop?.height && imgRef.current) {
                // Crop gambar yang sudah dikompresi
                finalFileToUpload = await getCroppedImg(imgRef.current, completedCrop, originalFileName);
            }

            // --- Upload ke Server ---
            const formData = new FormData();
            formData.append("file", finalFileToUpload, originalFileName);
            formData.append("watermark", watermark ? "1" : "0");
            formData.append("name", imageName);
            formData.append("category_id", "4");

            const token = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const res = await fetch("/upload-image", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": token,
                    Accept: "application/json",
                },
                body: formData,
            });

            const json = await res.json();

            if (!res.ok) {
                setError(json.message || "Gagal mengunggah gambar.");
                setLoading(false);
                return;
            }

            if (json?.location) {
                insertImage(json.location, imageName);
                resetAndClose();
            }
        } catch (e) {
            console.error(e);
            setError("Terjadi kesalahan saat mengunggah gambar.");
        } finally {
            setLoading(false);
        }
    };

    const insertFromUrl = () => {
        if (!imageUrl || !editor) return;
        insertImage(imageUrl, imageName);
        resetAndClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            {/* overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={resetAndClose}
            />

            {/* modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                )}
                <h3 className="text-lg font-semibold">Tambah Gambar</h3>

                <Tabs
                    tabs={[
                        { label: "Upload File", value: "upload" },
                        { label: "Dari URL", value: "url" },
                    ]}
                    value={tab}
                    variant="lifted"
                    onChange={setTab}
                    full
                />

                {tab === "upload" && (
                    <div className="space-y-3 pt-2">
                        {previewUrl ? (
                            <div className="space-y-3">
                                <div className="border rounded-lg bg-base-200 flex justify-center items-center overflow-hidden" style={{ maxHeight: "400px" }}>
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                    >
                                        <img
                                            ref={imgRef}
                                            src={previewUrl}
                                            alt="Crop preview"
                                            style={{ maxHeight: "400px", maxWidth: "100%", objectFit: "contain" }}
                                            onLoad={onImageLoad}
                                        />
                                    </ReactCrop>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <p className="text-sm font-medium truncate flex-1">{originalFileName}</p>
                                    <button
                                        className="btn btn-sm btn-outline btn-error"
                                        onClick={() => {
                                            URL.revokeObjectURL(previewUrl);
                                            setPreviewUrl(null);
                                            setFile(null);
                                            setOriginalFileName("");
                                            setCrop(undefined);
                                            setCompletedCrop(null);
                                        }}
                                        disabled={loading}
                                    >
                                        Ganti File
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <input
                                key={show ? "open" : "closed"}
                                type="file"
                                accept="image/*"
                                className="file-input file-input-bordered w-full"
                                onChange={handleFileChange} // Menggunakan fungsi baru
                                disabled={loading}
                            />
                        )}

                        {error && (
                            <p className="text-error text-sm font-medium">{error}</p>
                        )}

                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={watermark}
                                onChange={(e) => setWatermark(e.target.checked)}
                            />
                            Apakah ini foto original?
                        </label>

                        <div className="space-y-2">
                            <InputLabel value={"Nama Gambar (Wajib diisi)"} />
                            <TextInput
                                type="text"
                                className="w-full"
                                placeholder="Contoh: Presiden saat konferensi"
                                value={imageName}
                                onChange={(e) => setImageName(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                            type="button"
                            onClick={upload}
                            disabled={!file || loading}
                        >
                            {loading ? "Memproses..." : "Upload Gambar"}
                        </button>
                    </div>
                )}

                {/* TAB URL (Tidak berubah) */}
                {tab === "url" && (
                    <div className="space-y-3 pt-2">
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <div className="space-y-2">
                            <InputLabel value={"Nama Gambar (Wajib diisi)"} />
                            <TextInput
                                type="text"
                                className="w-full"
                                placeholder="Contoh: Presiden saat konferensi"
                                value={imageName}
                                onChange={(e) => setImageName(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-secondary w-full"
                            type="button"
                            onClick={insertFromUrl}
                            disabled={!imageUrl || loading}
                        >
                            Gunakan URL
                        </button>
                    </div>
                )}

                <div className="text-xs opacity-60">
                    Maksimal 2 gambar dalam artikel
                </div>

                <div className="flex justify-end relative z-20">
                    <button className="btn" onClick={resetAndClose} disabled={loading}>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}