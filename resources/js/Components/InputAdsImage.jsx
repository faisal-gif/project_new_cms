"use client";

import { useRef, useState, useEffect } from "react";
import { ImageIcon, XIcon } from "lucide-react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// --- Helper: Ekstrak area crop dengan kualitas PNG Tinggi ---
const getCroppedImg = async (image, crop, fileName, targetWidth, targetHeight) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  // Set ukuran canvas tepat sesuai resolusi target lokasi iklan
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext("2d");
  
  // Mengunci kualitas smoothing canvas ke tingkat tertinggi
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  
  ctx.drawImage(
    image, 
    crop.x * scaleX, 
    crop.y * scaleY, 
    crop.width * scaleX, 
    crop.height * scaleY, 
    0, 
    0, 
    targetWidth, 
    targetHeight
  );

  // Ubah ekstensi file asli menjadi .png untuk mempertahankan ketajaman teks/logo
  const newFileName = fileName.replace(/\.[^/.]+$/, "") + ".png";

  return new Promise((resolve, reject) => {
    // Menggunakan format image/png agar hasil potongan bersifat lossless (tidak blur)
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Canvas kosong atau gagal diekspor"));
      resolve(new File([blob], newFileName, { type: "image/png" }));
    }, "image/png");
  });
};

export default function InputAdsImage({
  label = "Upload Banner Iklan",
  value = null,
  existingImage = null,
  onChange,
  onRemove,
  className = "",
  enableCrop = true,
  targetWidth = 1200,
  targetHeight = 800,
}) {
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [cropData, setCropData] = useState({ src: null, fileName: "", originalFile: null });
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const ASPECT_RATIO = targetWidth / targetHeight;

  // Manajemen State Preview Gambar
  useEffect(() => {
    if (value instanceof File || value instanceof Blob) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (!value && existingImage && !isDeleted) {
      setPreview(existingImage);
      return;
    }

    setPreview(null);
  }, [value, existingImage, isDeleted]);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDeleted(false);

    // Jika crop dimatikan, langsung kirim file asli tanpa kompresi apa pun
    if (!enableCrop) {
      onChange?.(file);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropData({
        src: reader.result?.toString() || "",
        fileName: file.name,
        originalFile: file,
      });
    });
    reader.readAsDataURL(file);

    if (inputRef.current) inputRef.current.value = "";
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 95 }, ASPECT_RATIO, width, height),
      width, height
    );
    setCrop(initialCrop);
  };

  const handleSaveCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);
    try {
      // 1. Ekstrak gambar langsung ke format PNG super tajam
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        cropData.fileName,
        targetWidth,
        targetHeight
      );

      // 2. Langsung oper ke form Inertia tanpa melewati library kompresi pihak ketiga
      onChange?.(croppedFile);
      setCropData({ src: null, fileName: "", originalFile: null });
    } catch (error) {
      console.error("Gagal memotong gambar iklan:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = () => {
    onChange?.(null);
    setIsDeleted(true);
    onRemove?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <div className="mb-3"><span className="text-base font-bold text-slate-700">{label}</span></div>}

      {preview ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
          <img
            src={preview}
            alt="Preview Banner"
            style={{ aspectRatio: `${targetWidth} / ${targetHeight}` }}
            className="w-full h-auto object-cover cursor-pointer bg-slate-100"
            onClick={() => inputRef.current?.click()}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none">
            <span className="text-white font-medium drop-shadow-md">Klik untuk ganti gambar</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
            className="btn btn-error btn-sm btn-circle absolute top-3 right-3 shadow-lg"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="w-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all"
          style={{ aspectRatio: `${targetWidth} / ${targetHeight}` }}
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
          <div className="text-sm text-slate-500 font-medium">Klik untuk upload banner</div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleSelect} />

      {/* Modal Pemotong Gambar */}
      {cropData.src && (
        <div className="modal modal-open z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="modal-box max-w-3xl bg-white rounded-xl p-6 shadow-2xl w-full">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Sesuaikan Area Potongan Banner</h3>
            <p className="text-xs text-slate-500 mb-4">Pastikan teks penting berada di dalam kotak seleksi. Hasil akhir akan disimpan dengan format HD PNG.</p>

            <div className="flex justify-center items-center bg-slate-100 overflow-auto max-h-[55vh] rounded-lg border border-slate-200">
              <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)} aspect={ASPECT_RATIO}>
                <img src={cropData.src} alt="Crop Workspace" onLoad={onImageLoad} className="max-h-[55vh] object-contain" />
              </ReactCrop>
            </div>

            <div className="modal-action flex w-full justify-end gap-2 mt-6">
              <button
                type="button"
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium text-sm flex-1 sm:flex-none"
                onClick={() => setCropData({ src: null, fileName: "", originalFile: null })}
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                type="button"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium text-sm flex-1 sm:flex-none flex items-center justify-center min-w-[120px]"
                onClick={handleSaveCrop}
                disabled={isProcessing || !completedCrop?.width}
              >
                {isProcessing ? "Memproses..." : "Potong Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}