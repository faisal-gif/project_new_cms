import React, { useState, useRef } from "react";
import { Upload, X, Loader2, ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";


export default function InputMultiImage({
    label = "Upload Gambar",
    subLabel = "PNG, JPG. Bisa pilih banyak.",
    icon: Icon = Upload,
    value = [], // Array of objects: { id, fileObj, previewUrl, fileName }
    onChange,
    maxFiles = 20,
    maxSizeMB = 1.5, // Target ukuran kompresi (dalam MB)
    maxWidthOrHeight = 1920, // Resolusi maksimal
    themeColor = "primary", // 'primary', 'warning', 'error', 'neutral'
}) {
    const inputRef = useRef(null);
    const [isCompressing, setIsCompressing] = useState(false);

    // Referensi untuk fitur Drag & Drop
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // Styling dinamis berdasarkan props themeColor
    const themeStyles = {
        primary: {
            border: "border-primary/30 hover:border-primary",
            bg: "bg-primary/5 hover:bg-primary/10",
            text: "text-primary",
            badge: "bg-primary text-white",
        },
        warning: {
            border: "border-warning/40 hover:border-warning",
            bg: "bg-warning/5 hover:bg-warning/10",
            text: "text-warning",
            badge: "bg-warning text-warning-content",
        },
    };

    const currentTheme = themeStyles[themeColor] || themeStyles.primary;

    // --- FUNGSI UPLOAD & KOMPRESI ---
    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const remaining = maxFiles - value.length;

        if (remaining <= 0) {
            toast.error(`Batas maksimal adalah ${maxFiles} file. Anda tidak dapat menambah lebih banyak.`);
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        setIsCompressing(true);
        const processedFiles = [];
        const filesToProcess = files.slice(0, remaining);

        for (const file of filesToProcess) {
            if (!file.type.startsWith("image/")) {
                alert(`File ${file.name} bukan gambar.`);
                continue;
            }

            try {
                // Proses kompresi berapapun ukuran aslinya
                const options = {
                    maxSizeMB: maxSizeMB,
                    maxWidthOrHeight: maxWidthOrHeight,
                    useWebWorker: true,
                };

                const compressedFile = await imageCompression(file, options);

                processedFiles.push({
                    id: Date.now() + Math.random(),
                    fileObj: compressedFile,
                    previewUrl: URL.createObjectURL(compressedFile),
                    fileName: compressedFile.name,
                });
            } catch (error) {
                console.error(`Gagal mengkompresi ${file.name}:`, error);
            }
        }

        onChange([...value, ...processedFiles]);

        if (inputRef.current) inputRef.current.value = "";
        setIsCompressing(false);
    };

    // --- FUNGSI HAPUS ---
    const removeFile = (idToRemove) => {
        const fileToRemove = value.find((p) => p.id === idToRemove);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        onChange(value.filter((p) => p.id !== idToRemove));
    };

    // --- FUNGSI REORDER: TOMBOL PANAH ---
    const moveFile = (index, direction) => {
        const newArray = [...value];
        if (direction === -1 && index > 0) {
            // Geser ke kiri (sebelumnya)
            [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
        } else if (direction === 1 && index < newArray.length - 1) {
            // Geser ke kanan (selanjutnya)
            [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
        }
        onChange(newArray);
    };

    // --- FUNGSI REORDER: DRAG & DROP ---
    const handleDragStart = (e, index) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            const newItems = [...value];
            const draggedItemContent = newItems.splice(dragItem.current, 1)[0];
            newItems.splice(dragOverItem.current, 0, draggedItemContent);
            onChange(newItems);
        }
        // Reset state drag
        dragItem.current = null;
        dragOverItem.current = null;
    };

    return (
        <div className="space-y-4">
            {/* Area Upload */}
            <div
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all ${currentTheme.border} ${currentTheme.bg}`}
                onClick={() => !isCompressing && inputRef.current?.click()}
            >
                {isCompressing ? (
                    <div className="flex flex-col items-center justify-center text-base-content/60 py-4">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                        <span className="text-sm font-medium">Memproses & mengkompresi gambar...</span>
                    </div>
                ) : (
                    <>
                        <Icon className={`mb-2 h-8 w-8 ${currentTheme.text} opacity-70`} />
                        <span className="text-sm font-medium text-base-content/80">{label}</span>
                        <span className="text-xs text-base-content/50 mt-1">{subLabel}</span>
                    </>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isCompressing}
                />
            </div>

            {/* Grid Preview dengan Fitur Reorder */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {value.map((page, idx) => (
                        <div
                            key={page.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragEnter={(e) => handleDragEnter(e, idx)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Wajib agar onDrop bisa berjalan
                            className="group relative overflow-hidden rounded-xl border border-base-200 bg-base-100 shadow-sm transition-transform cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/30"
                        >

                            {/* Nomor Urut & Icon Drag */}
                            <div className={`absolute left-2 top-2 z-10 flex h-6 items-center gap-1 rounded-full px-2 text-xs font-bold shadow ${currentTheme.badge}`}>
                                <GripHorizontal className="h-3 w-3 opacity-70" />
                                {idx + 1}
                            </div>

                            {/* Tombol Hapus (Silang Merah) */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(page.id);
                                }}
                                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white opacity-0 transition-opacity group-hover:opacity-100 shadow hover:bg-red-600"
                                title="Hapus Halaman"
                            >
                                <X className="h-3 w-3" />
                            </button>

                            {/* Gambar Preview */}
                            <img
                                src={page.previewUrl}
                                alt={`Halaman ${idx + 1}`}
                                className="aspect-[3/4] w-full object-cover bg-base-300 pointer-events-none"
                            />

                            {/* Footer Navigasi (Geser Kiri/Kanan) */}
                            <div className="flex items-center justify-between p-1 border-t border-base-200 bg-base-100">
                                <button
                                    type="button"
                                    onClick={() => moveFile(idx, -1)}
                                    disabled={idx === 0}
                                    className="btn btn-xs btn-ghost px-1 disabled:opacity-20"
                                    title="Geser ke Kiri"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <p className="truncate text-[10px] text-base-content/60 px-1 max-w-[60%]" title={page.fileName}>
                                    {page.fileName}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => moveFile(idx, 1)}
                                    disabled={idx === value.length - 1}
                                    className="btn btn-xs btn-ghost px-1 disabled:opacity-20"
                                    title="Geser ke Kanan"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}