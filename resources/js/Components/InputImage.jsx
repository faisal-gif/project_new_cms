"use client";

import { useRef, useState, useEffect } from "react";
import { ImageIcon, XIcon } from "lucide-react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import imageCompression from "browser-image-compression";

// --- Helper: Ekstrak area crop dan paksa resolusi jadi 1200x800 ---
const getCroppedImg = async (image, crop, fileName) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // FIX DIMENSI OUTPUT 1200 x 800
  const TARGET_WIDTH = 1200;
  const TARGET_HEIGHT = 800;

  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
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
    TARGET_WIDTH,  // Lebar output paksa
    TARGET_HEIGHT  // Tinggi output paksa
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
}) {
  const inputRef = useRef(null);
  const imgRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [cropData, setCropData] = useState({ src: null, fileName: "" });
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Rasio yang kita inginkan (1200 / 800 = 1.5)
  const ASPECT_RATIO = 1200 / 800;

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

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropData({
        src: reader.result?.toString() || "",
        fileName: file.name,
      });
    });
    reader.readAsDataURL(file);

    if (inputRef.current) inputRef.current.value = "";
  };

  // Set area crop default di tengah layar dengan rasio 1.5
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;

    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90, // Ambil 90% lebar gambar sebagai default
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

  const handleSaveCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);

    try {
      // 1. Ekstrak gambar (akan otomatis di-resize jadi 1200x800 oleh Canvas)
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        cropData.fileName
      );

      // 2. Kompresi gambar agar sizenya kecil tapi dimensi tetap 1200x800
      const compressionOptions = {
        maxSizeMB: 1.5, // Max 1MB
        maxWidthOrHeight: 1200, // Karena canvas sudah 1200, ini aman
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(
        croppedFile,
        compressionOptions
      );

      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
      onChange?.(compressedFile);

      setCropData({ src: null, fileName: "" });
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
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-bold">{label}</span>
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-box overflow-hidden bg-base-100 hover:bg-base-200 transition cursor-pointer ${previewClass}`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="btn btn-error btn-xs absolute top-2 right-2"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <ImageIcon className="w-8 h-8 opacity-50" />
            <div className="text-sm opacity-60">Klik untuk upload gambar</div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />

      {cropData.src && (
        <div className="modal modal-open z-[9999] bg-black/60">
          <div className="modal-box max-w-2xl bg-base-100">
            <h3 className="font-bold text-lg mb-4">Sesuaikan Gambar (1200x800)</h3>

            <div className="flex justify-center items-center bg-base-200 overflow-auto max-h-[60vh] rounded-lg">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={ASPECT_RATIO} // 🔥 KUNCI: Paksa rasio 1.5 (Landscape)
              >
                <img
                  src={cropData.src}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setCropData({ src: null, fileName: "" })}
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveCrop}
                disabled={
                  isProcessing ||
                  !completedCrop?.width ||
                  !completedCrop?.height
                }
              >
                {isProcessing ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Crop & Kompres"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}