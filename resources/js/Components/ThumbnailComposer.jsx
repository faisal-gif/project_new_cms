import { useCallback, useEffect, useRef, useState } from "react";
import { X, ImageIcon, RotateCcw } from "lucide-react";
import { Button } from "@/Components/ui/button";

/**
 * Penyusun thumbnail bertemplate.
 *
 * Komposisinya dua langkah: foto digambar dulu, lalu frame ditindihkan di atasnya.
 * Bagian frame yang tidak transparan otomatis menutupi foto, jadi tidak perlu masking.
 *
 * CATATAN CORS: foto yang masuk kanvas HARUS berasal dari disk (File), bukan URL.
 * cdn2.timesmedia.co.id dan kopi.times.co.id tidak mengirim Access-Control-Allow-Origin,
 * sehingga memuatnya ke kanvas akan menodainya dan toBlob() gagal. Foto member
 * karena itu hanya ditampilkan sebagai rujukan lewat <img> biasa.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onDone: (file: File) => void   -- hasil komposit 1200x800 JPEG
 *  - referenceImage?: string        -- URL foto member, tampil sebagai rujukan saja
 *  - template?: string              -- path frame PNG (same-origin)
 */
const W = 1200;
const H = 800;

// Jendela transparan pada frame-kopitimes.png (diukur dari alpha channel).
const WINDOW = { x: 486, y: 30, w: 712, h: 744 };

export default function ThumbnailComposer({
    open,
    onClose,
    onDone,
    referenceImage = null,
    template = "/template/frame-kopitimes.png",
}) {
    const canvasRef = useRef(null);
    const frameRef = useRef(null);
    const photoRef = useRef(null);
    const dragRef = useRef(null);

    const [photoUrl, setPhotoUrl] = useState(null);
    const [ready, setReady] = useState(false);
    const [scale, setScale] = useState(1);
    const [pos, setPos] = useState({ x: WINDOW.x, y: WINDOW.y });
    const [error, setError] = useState("");

    // Muat frame sekali. Same-origin, jadi aman untuk kanvas.
    useEffect(() => {
        if (!open || frameRef.current) return;
        const img = new Image();
        img.onload = () => {
            frameRef.current = img;
            draw();
        };
        img.onerror = () => setError("Template tidak bisa dimuat: " + template);
        img.src = template;
    }, [open]);

    const draw = useCallback(() => {
        const cv = canvasRef.current;
        if (!cv) return;
        const ctx = cv.getContext("2d");

        // Latar putih: jendela frame transparan, tanpa ini hasilnya hitam.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);

        const p = photoRef.current;
        if (p) {
            ctx.drawImage(p, pos.x, pos.y, p.naturalWidth * scale, p.naturalHeight * scale);
        }
        if (frameRef.current) {
            ctx.drawImage(frameRef.current, 0, 0, W, H);
        }
    }, [pos, scale]);

    useEffect(() => {
        if (open) draw();
    }, [open, draw, ready]);

    const pilihFoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            photoRef.current = img;
            // Skala awal: penuhi tinggi jendela, lalu posisikan di tengah jendela.
            const s = WINDOW.h / img.naturalHeight;
            setScale(s);
            setPos({
                x: WINDOW.x + (WINDOW.w - img.naturalWidth * s) / 2,
                y: WINDOW.y,
            });
            setReady((v) => !v);
        };
        img.onerror = () => setError("File itu tidak bisa dibaca sebagai gambar.");
        img.src = url;

        if (photoUrl) URL.revokeObjectURL(photoUrl);
        setPhotoUrl(url);
    };

    // Seret untuk menggeser. Kanvas ditampilkan separuh ukuran, jadi delta dikali 2.
    const onPointerDown = (e) => {
        if (!photoRef.current) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    };
    const onPointerMove = (e) => {
        const d = dragRef.current;
        if (!d) return;
        const rasio = W / e.currentTarget.clientWidth;
        setPos({ x: d.ox + (e.clientX - d.sx) * rasio, y: d.oy + (e.clientY - d.sy) * rasio });
    };
    const onPointerUp = (e) => {
        dragRef.current = null;
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    const reset = () => {
        const p = photoRef.current;
        if (!p) return;
        const s = WINDOW.h / p.naturalHeight;
        setScale(s);
        setPos({ x: WINDOW.x + (WINDOW.w - p.naturalWidth * s) / 2, y: WINDOW.y });
    };

    const simpan = () => {
        const cv = canvasRef.current;
        if (!cv || !photoRef.current) {
            setError("Pilih dulu foto yang sudah dipotong latarnya.");
            return;
        }
        cv.toBlob(
            (blob) => {
                if (!blob) {
                    setError("Gagal membuat gambar. Coba ulangi.");
                    return;
                }
                onDone(new File([blob], "kopi-times-thumbnail.jpg", { type: "image/jpeg" }));
                onClose();
            },
            "image/jpeg",
            0.92
        );
    };

    useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-background rounded-xl shadow-xl w-[min(1100px,95vw)] max-h-[92vh] overflow-y-auto border border-border">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-background">
                    <span className="font-semibold text-lg">Buat Thumbnail Kopi Times</span>
                    <button type="button" className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Kanvas */}
                    <div className="lg:col-span-2">
                        <canvas
                            ref={canvasRef}
                            width={W}
                            height={H}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            className="w-full h-auto rounded-lg border border-border bg-white touch-none cursor-move"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Seret gambar untuk menggeser, geser penggaris di samping untuk mengubah ukuran.
                        </p>
                        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                    </div>

                    {/* Panel kanan */}
                    <div className="flex flex-col gap-4">
                        {referenceImage && (
                            <div>
                                <span className="text-sm font-bold block mb-2">Foto asli dari member</span>
                                {/* Hanya rujukan — tidak bisa masuk kanvas karena host tanpa CORS. */}
                                <img src={referenceImage} alt="Foto member" className="w-full rounded-lg border border-border object-cover max-h-48" />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Potong latarnya dulu (mis. di Photoshop), simpan sebagai PNG, lalu unggah di bawah.
                                </p>
                            </div>
                        )}

                        <div>
                            <span className="text-sm font-bold block mb-2">Foto hasil potongan (PNG)</span>
                            <label className="flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-gray-400/70 rounded-xl cursor-pointer hover:bg-muted transition-colors">
                                <ImageIcon className="w-7 h-7 text-gray-400" />
                                <span className="text-sm text-gray-500 font-medium">Klik untuk pilih PNG</span>
                                <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={pilihFoto} />
                            </label>
                        </div>

                        <div>
                            <label htmlFor="skala" className="text-sm font-bold block mb-2">Ukuran</label>
                            <input
                                id="skala"
                                type="range"
                                min="0.05"
                                max="3"
                                step="0.01"
                                value={scale}
                                disabled={!photoRef.current}
                                onChange={(e) => setScale(Number(e.target.value))}
                                className="w-full"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={reset} disabled={!photoRef.current} className="w-full mt-2 gap-2">
                                <RotateCcw className="w-4 h-4" /> Kembalikan posisi
                            </Button>
                        </div>

                        <div className="mt-auto flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Batal</Button>
                            <Button type="button" onClick={simpan} className="flex-1">Pakai Thumbnail</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
