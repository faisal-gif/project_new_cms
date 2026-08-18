import { useEffect, useState, useRef } from "react";
import Tabs from "@/Components/Tabs";
import Checkbox from "./Checkbox";
import TextInput from "./TextInput";
import InputLabel from "./InputLabel";
import imageCompression from "browser-image-compression";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import CdnImagePicker from "./CdnImagePicker";

export default function EditorImageModal() {
    const [show, setShow] = useState(false);
    const [editor, setEditor] = useState(null);
    const [tab, setTab] = useState("upload");
    const [showPicker, setShowPicker] = useState(false);

    const [file, setFile] = useState(null);
    const [originalFileName, setOriginalFileName] = useState("");

    const [imageName, setImageName] = useState(""); 
    const [caption, setCaption] = useState("");     

    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [watermark, setWatermark] = useState(true);
    const [error, setError] = useState("");

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
        setCaption(""); 
        setTab("upload");
        setError("");
        setShowPicker(false);
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

    const insertImage = (src, name, imageCaption) => {
        if (countImages() >= 5) {
            editor.notificationManager.open({
                text: "Maksimal 5 gambar dalam artikel",
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

        const MAX_WIDTH = 1200;
        let actualWidth = cropArea.width * scaleX;
        let actualHeight = cropArea.height * scaleY;

        if (actualWidth > MAX_WIDTH) {
            const ratio = MAX_WIDTH / actualWidth;
            actualWidth = MAX_WIDTH;
            actualHeight = actualHeight * ratio;
        }

        canvas.width = actualWidth;
        canvas.height = actualHeight;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            imageElement,
            cropArea.x * scaleX,
            cropArea.y * scaleY,
            cropArea.width * scaleX,
            cropArea.height * scaleY,
            0, 0, actualWidth, actualHeight
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas is empty'));
                resolve(new File([blob], fileNameToUse.replace(/\.[^/.]+$/, ".webp"), {
                    type: 'image/webp',
                }));
            }, 'image/webp', 0.8);
        });
    };
    
    const onImageLoad = (e) => {
        setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 });
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setLoading(true);
        setError("");

        try {
            const isSmallFile = selectedFile.size <= 1.5 * 1024 * 1024;
            const isOptimizedFormat = selectedFile.type === 'image/avif' || selectedFile.type === 'image/webp';

            let fileForCrop = selectedFile;

            if (!isSmallFile && !isOptimizedFormat) {
                const options = {
                    maxSizeMB: 1.5,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                fileForCrop = await imageCompression(selectedFile, options);
            }

            setFile(fileForCrop);
            setOriginalFileName(selectedFile.name);
            setPreviewUrl(URL.createObjectURL(fileForCrop));

        } catch (error) {
            console.error(error);
            setError("Gagal memproses gambar saat dipilih.");
        } finally {
            setLoading(false);
        }
    };

    const upload = async () => {
        if (!file || !editor) return;

        if (!imageName.trim()) { setError("Nama gambar (Alt Text) wajib diisi"); return; }
        if (!caption.trim()) { setError("Caption keterangan gambar wajib diisi"); return; }
        if (!completedCrop?.width || !completedCrop?.height || !imgRef.current) { setError("Silakan sesuaikan (crop) gambar terlebih dahulu."); return; }

        setError("");
        setLoading(true);

        if (countImages() >= 5) {
            editor.notificationManager.open({
                text: "Maksimal 5 gambar dalam artikel",
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

    // Pilih foto dari galeri CDN: sudah berupa URL final, tinggal disisipkan.
    const handlePickFromCdn = ({ url, name }) => {
        setImageUrl(url);
        setImageName((prev) => prev || name || "");
        setShowPicker(false);
        setError("");
    };

    const insertFromCdn = () => {
        if (!imageUrl || !editor) return;
        if (!imageName.trim()) { setError("Nama gambar (Alt Text) wajib diisi"); return; }
        if (!caption.trim()) { setError("Caption keterangan gambar wajib diisi"); return; }
        insertImage(imageUrl, imageName, caption);
        resetAndClose();
    };

    // 💡 LOGIKA BARU UNTUK PROSES URL
    const insertFromUrl = async () => {
        if (!imageUrl || !editor) return;

        if (!imageName.trim()) { setError("Nama gambar (Alt Text) wajib diisi"); return; }
      
        // 1. Cek apakah ini URL internal CDN kita
        if (imageUrl.includes("cdn2.timesmedia.co.id")) {
            insertImage(imageUrl, imageName, caption);
            resetAndClose();
            return;
        }

        // 2. Jika URL eksternal, kita oper ke Backend untuk di-download & di-upload ke CDN
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("image_url", imageUrl); // Key baru untuk backend
            formData.append("watermark", "1");      // Default pasang watermark
            formData.append("name", imageName);
            formData.append("caption", caption);

            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

            // Catatan: Anda harus menyiapkan route & fungsi di Laravel untuk menangani endpoint ini
            const res = await fetch("/upload-image-url", { 
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": token,
                    Accept: "application/json",
                },
                body: formData,
            });

            const json = await res.json();

            if (!res.ok) {
                setError(json.message || "Gagal memproses gambar dari URL eksternal.");
                setLoading(false);
                return;
            }

            if (json?.location) {
                insertImage(json.location, imageName, caption);
                resetAndClose();
            }
        } catch (e) {
            console.error(e);
            setError("Terjadi kesalahan sistem saat menarik gambar dari URL.");
        } finally {
            setLoading(false);
        }
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
                        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></span>
                    </div>
                )}
                <h3 className="text-lg font-semibold text-gray-800">Tambah Gambar Artikel</h3>

                <Tabs
                    tabs={[
                        { label: "Upload File", value: "upload" },
                        { label: "Galeri CDN", value: "cdn" },
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
                                <div className="border rounded-lg bg-muted flex justify-center items-center overflow-hidden" style={{ maxHeight: "400px" }}>
                                    <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)}>
                                        <img ref={imgRef} src={previewUrl} alt="Crop preview" style={{ maxHeight: "400px", maxWidth: "100%", objectFit: "contain" }} onLoad={onImageLoad} />
                                    </ReactCrop>
                                </div>
                                <div className="flex justify-between items-center gap-2 px-1">
                                    <p className="text-sm font-medium text-gray-600 truncate flex-1">{originalFileName}</p>
                                    <button className="inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors h-8 px-3 border border-destructive text-destructive hover:bg-destructive/10" onClick={() => {
                                        URL.revokeObjectURL(previewUrl);
                                        setPreviewUrl(null); setFile(null); setOriginalFileName(""); setCrop(undefined); setCompletedCrop(null);
                                    }} disabled={loading}>
                                        Ganti File
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <input key={show ? "open" : "closed"} type="file" accept="image/*" className="w-full rounded-md border border-input bg-transparent text-sm file:mr-3 file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm" onChange={handleFileChange} disabled={loading} />
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-destructive text-sm font-medium">{error}</p>
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

                        <button className="inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90" type="button" onClick={upload} disabled={!file || loading || !completedCrop?.width}>
                            {loading ? "Memproses Upload..." : "Crop & Upload Gambar"}
                        </button>
                    </div>
                )}

                {/* --- TAB GALERI CDN --- */}
                {tab === "cdn" && (
                    <div className="space-y-4 pt-2">
                        {imageUrl ? (
                            <div className="border rounded-lg overflow-hidden bg-muted">
                                <img src={imageUrl} alt="Foto terpilih" className="w-full max-h-[300px] object-contain" />
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 text-sm">
                                Belum ada foto dipilih.
                            </div>
                        )}

                        <button className="inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors w-full h-9 border border-input hover:bg-muted" type="button" onClick={() => setShowPicker(true)}>
                            {imageUrl ? "Ganti Foto dari Galeri" : "Pilih Foto dari Galeri CDN"}
                        </button>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-destructive text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <InputLabel value={"Nama Gambar / Alt Text (Wajib diisi untuk SEO)"} />
                            <TextInput
                                type="text" className="w-full"
                                placeholder="Contoh: presiden-jokowi-konferensi-pers"
                                value={imageName} onChange={(e) => setImageName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <InputLabel value={"Caption Keterangan Foto (Muncul di bawah gambar)"} />
                            <TextInput
                                type="text" className="w-full"
                                placeholder="Contoh: Presiden Joko Widodo saat memberikan keterangan pers di Istana Negara, Jakarta."
                                value={caption} onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>

                        <button className="inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90" type="button" onClick={insertFromCdn} disabled={!imageUrl}>
                            Sisipkan Gambar
                        </button>
                    </div>
                )}

                {/* --- TAB URL --- */}
                {tab === "url" && (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <InputLabel value={"URL Gambar"} />
                            <input type="text" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-destructive text-sm font-medium">{error}</p>
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

                        <button className="inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors w-full h-9 bg-secondary text-secondary-foreground hover:bg-secondary/80" type="button" onClick={insertFromUrl} disabled={!imageUrl || loading}>
                            {loading ? "Memproses URL..." : "Gunakan URL"}
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Maksimal 5 gambar dalam artikel
                    </div>
                    <button className="inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors h-8 px-3 hover:bg-muted" onClick={resetAndClose} disabled={loading}>
                        Tutup
                    </button>
                </div>
            </div>

            <CdnImagePicker
                open={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={handlePickFromCdn}
            />
        </div>
    );
}