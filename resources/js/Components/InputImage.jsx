"use client";

import { useRef, useState, useEffect } from "react";
import { ImageIcon, XIcon } from "lucide-react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import imageCompression from "browser-image-compression";

// --- Helper: Ekstrak area crop dan paksa resolusi berdasarkan target ---
// Tambahkan parameter targetWidth dan targetHeight
const getCroppedImg = async (image, crop, fileName, targetWidth, targetHeight) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  // Optimasi kualitas gambar saat di-scale
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0, // Posisi X di canvas
    0, // Posisi Y di canvas
    targetWidth,  // Lebar output paksa
    targetHeight  // Tinggi output paksa
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], fileName, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 1); // 1 = kualitas maksimum (biar library kompresi yang kerja)
  });
};

export default function InputImage({
  label = "Upload Image",
  value = null,
  onChange,
  className = "",
  previewClass = "h-48",
  enableCrop = true, 
  targetWidth = 1200,  // Prop baru: lebar default
  targetHeight = 800,  // Prop baru: tinggi default
}) {
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [cropData, setCropData] = useState({ src: null, fileName: "", originalFile: null });
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Rasio crop sekarang dinamis berdasarkan prop
  const ASPECT_RATIO = targetWidth / targetHeight;

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === "string") {
      setPreview(value);
    } else {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!enableCrop) {
        processOriginalImage(file);
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
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        ASPECT_RATIO,
        width,
        height
      ),
      width,
      height
    );

    setCrop(initialCrop);
  };

  const processOriginalImage = async (fileToProcess = cropData.originalFile) => {
    if (!fileToProcess) return;
    setIsProcessing(true);

    try {
        const compressionOptions = {
            maxSizeMB: 1.8, 
            maxWidthOrHeight: Math.max(targetWidth, targetHeight, 1920), // Dinamis, minimal 1920 untuk gambar asli
            useWebWorker: true,
        };
        
        const compressedFile = await imageCompression(
            fileToProcess,
            compressionOptions
        );

        const previewUrl = URL.createObjectURL(compressedFile);
        setPreview(previewUrl);
        onChange?.(compressedFile);

        setCropData({ src: null, fileName: "", originalFile: null });
    } catch (error) {
        console.error("Gagal kompresi gambar asli:", error);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSaveCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);

    try {
      // 1. Ekstrak gambar (di-resize dinamis oleh Canvas)
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        cropData.fileName,
        targetWidth,  // Lempar prop
        targetHeight  // Lempar prop
      );

      // 2. Kompresi gambar
      const compressionOptions = {
        maxSizeMB: 1.5, 
        maxWidthOrHeight: Math.max(targetWidth, targetHeight), // Ambil sisi terpanjang
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(
        croppedFile,
        compressionOptions
      );

      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
      onChange?.(compressedFile);

      setCropData({ src: null, fileName: "", originalFile: null });
    } catch (error) {
      console.error("Gagal crop/kompresi:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = () => {
    onChange?.(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

 return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="mb-3">
          <span className="text-base font-medium">{label}</span>
        </div>
      )}

      {preview ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-base-200 shadow-sm group">
          {/* Hapus aspect-[3/2], ganti dengan style dinamis */}
          <img
            src={preview}
            alt="preview"
            style={{ aspectRatio: `${targetWidth} / ${targetHeight}` }}
            className="w-full h-auto object-cover cursor-pointer bg-base-300"
            onClick={() => inputRef.current?.click()}
          />
          
          <div 
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer pointer-events-none"
          >
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
          className="w-full border-2 border-dashed border-gray-400/70 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:bg-base-200 hover:border-gray-500 transition-all min-h-[240px]"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <div className="text-sm text-gray-500 font-medium">Klik untuk upload gambar</div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />

      {cropData.src && (
        <div className="modal modal-open z-[9999] bg-black/60">
          <div className="modal-box max-w-3xl bg-base-100">
            <h3 className="font-bold text-lg mb-4">Sesuaikan Gambar</h3>

            <div className="flex justify-center items-center bg-base-200 overflow-auto max-h-[60vh] rounded-lg">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={ASPECT_RATIO} // Dinamis
              >
                <img
                  src={cropData.src}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
            </div>

            <div className="modal-action flex flex-col sm:flex-row gap-2 justify-between items-center w-full mt-6">
              <button
                type="button"
                className="btn btn-outline w-full sm:w-auto"
                onClick={() => processOriginalImage()}
                disabled={isProcessing}
              >
                {isProcessing ? <span className="loading loading-spinner loading-sm"></span> : "Gunakan Gambar Asli (Tanpa Crop)"}
              </button>

              <div className="flex w-full sm:w-auto gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost flex-1 sm:flex-none"
                    onClick={() => setCropData({ src: null, fileName: "", originalFile: null })}
                    disabled={isProcessing}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary flex-1 sm:flex-none"
                    onClick={handleSaveCrop}
                    disabled={isProcessing || !completedCrop?.width || !completedCrop?.height}
                  >
                    {isProcessing ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      // Teks tombol sekarang dinamis
                      `Crop & Kompres (${targetWidth}x${targetHeight})`
                    )}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}