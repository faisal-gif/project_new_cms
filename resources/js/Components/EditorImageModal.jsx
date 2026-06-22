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

    const [file, setFile] = useState(null);
    const [originalFileName, setOriginalFileName] = useState("");

    // --- 💡 DUA FIELD TERPISAH ---
    const [imageName, setImageName] = useState(""); // Untuk Alt Text & Nama File (SEO)
    const [caption, setCaption] = useState("");     // Untuk Keterangan Gambar (Figcaption)

    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [watermark, setWatermark] = useState(true);
    const [error, setError] = useState("");

    // --- State & Ref untuk react-image-crop ---
    const [previewUrl, setPreviewUrl] = useState(null);
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            setEditor(e.detail.editor);
            setShow(true);
        };

        window.addEventListener("open-editor-image-modal", handler);
        return () => window.removeEventListener("open-editor-image-modal", handler);
    }, []);

    const resetAndClose = () => {
        setShow(false);
        setFile(null);
        setOriginalFileName("");
        setImageUrl("");
        setImageName("");
        setCaption(""); // 💡 Reset state caption baru
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

    // 💡 UPDATE: Menerima 3 parameter (src, name, imageCaption)
    const insertImage = (src, name, imageCaption) => {
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
                <figcaption>${imageCaption}</figcaption>
              </figure>`
        );
    };

    const getCroppedImg = async (imageElement, cropArea, fileNameToUse) => {
        const canvas = document.createElement('canvas');
        const scaleX = imageElement.naturalWidth / imageElement.width;
        const scaleY = imageElement.naturalHeight / imageElement.height;
        const actualWidth = cropArea.width * scaleX;
        const actualHeight = cropArea.height * scaleY;

        canvas.width = actualWidth;
        canvas.height = actualHeight;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            imageElement,
            cropArea.x * scaleX,
            cropArea.y * scaleY,
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

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setLoading(true);
        setError("");

        try {
            const options = {
                maxSizeMB: 1.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

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

        // Validasi berlapis untuk kedua field baru
        if (!imageName.trim()) {
            setError("Nama gambar (Alt Text) wajib diisi");
            return;
        }
        if (!caption.trim()) {
            setError("Caption keterangan gambar wajib diisi");
            return;
        }
        if (!completedCrop?.width || !completedCrop?.height || !imgRef.current) {
            setError("Silakan sesuaikan (crop) gambar terlebih dahulu.");
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
            const finalFileToUpload = await getCroppedImg(imgRef.current, completedCrop, originalFileName);

            const formData = new FormData();
            formData.append("file", finalFileToUpload, originalFileName);
            formData.append("watermark", watermark ? "1" : "0");
            formData.append("name", imageName);
            formData.append("caption", caption);

            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

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
                // 💡 Oper imageName dan caption ke editor
                insertImage(json.location, imageName, caption);
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

        if (!imageName.trim()) {
            setError("Nama gambar (Alt Text) wajib diisi");
            return;
        }
        if (!caption.trim()) {
            setError("Caption keterangan gambar wajib diisi");
            return;
        }

        // 💡 Oper imageName dan caption dari URL ke editor
        insertImage(imageUrl, imageName, caption);
        resetAndClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            {/* overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />

            {/* modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                )}
                <h3 className="text-lg font-semibold text-gray-800">Tambah Gambar Artikel</h3>

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

                {/* --- TAB UPLOAD --- */}
                {tab === "upload" && (
                    <div className="space-y-4 pt-2">
                        {previewUrl ? (
                            <div className="space-y-3">
                                <div className="border rounded-lg bg-base-200 flex justify-center items-center overflow-hidden" style={{ maxHeight: "400px" }}>
                                    <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)}>
                                        <img ref={imgRef} src={previewUrl} alt="Crop preview" style={{ maxHeight: "400px", maxWidth: "100%", objectFit: "contain" }} onLoad={onImageLoad} />
                                    </ReactCrop>
                                </div>
                                <div className="flex justify-between items-center gap-2 px-1">
                                    <p className="text-sm font-medium text-gray-600 truncate flex-1">{originalFileName}</p>
                                    <button className="btn btn-sm btn-outline btn-error" onClick={() => {
                                        URL.revokeObjectURL(previewUrl);
                                        setPreviewUrl(null); setFile(null); setOriginalFileName(""); setCrop(undefined); setCompletedCrop(null);
                                    }} disabled={loading}>
                                        Ganti File
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <input key={show ? "open" : "closed"} type="file" accept="image/*" className="file-input file-input-bordered w-full" onChange={handleFileChange} disabled={loading} />
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-error text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <Checkbox checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
                            <span className="text-sm font-medium text-gray-700">Apakah ini foto original? (Tambahkan Watermark)</span>
                        </label>

                        {/* FIELD 1: NAMA GAMBAR */}
                        <div className="space-y-1">
                            <InputLabel value={"Nama Gambar / Alt Text (Wajib diisi untuk SEO)"} />
                            <TextInput
                                type="text" className="w-full"
                                placeholder="Contoh: presiden-jokowi-konferensi-pers"
                                value={imageName} onChange={(e) => setImageName(e.target.value)}
                            />
                        </div>

                        {/* FIELD 2: CAPTION GAMBAR */}
                        <div className="space-y-1">
                            <InputLabel value={"Caption Keterangan Foto (Muncul di bawah gambar)"} />
                            <TextInput
                                type="text" className="w-full"
                                placeholder="Contoh: Presiden Joko Widodo saat memberikan keterangan pers di Istana Negara, Jakarta."
                                value={caption} onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-primary w-full" type="button" onClick={upload} disabled={!file || loading || !completedCrop?.width}>
                            {loading ? "Memproses Upload..." : "Crop & Upload Gambar"}
                        </button>
                    </div>
                )}

                {/* --- TAB URL --- */}
                {tab === "url" && (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <InputLabel value={"URL Gambar"} />
                            <input type="text" className="input input-bordered w-full" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-error text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* FIELD 1: NAMA GAMBAR (URL) */}
                        <div className="space-y-1">
                            <InputLabel value={"Nama Gambar / Alt Text (Wajib diisi untuk SEO)"} />
                            <TextInput
                                type="text" className="w-full"
                                placeholder="Contoh: presiden-jokowi-konferensi-pers"
                                value={imageName} onChange={(e) => setImageName(e.target.value)}
                            />
                        </div>

                        {/* FIELD 2: CAPTION GAMBAR (URL) */}
                        <div className="space-y-1">
                            <InputLabel value={"Caption Keterangan Foto (Muncul di bawah gambar)"} />
                            <TextInput
                                type="text" className="w-full"
                                placeholder="Contoh: Presiden Joko Widodo saat memberikan keterangan pers di Istana Negara, Jakarta."
                                value={caption} onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-secondary w-full" type="button" onClick={insertFromUrl} disabled={!imageUrl || loading}>
                            Gunakan URL
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Maksimal 2 gambar dalam artikel
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={resetAndClose} disabled={loading}>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}