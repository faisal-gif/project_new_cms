import { useEffect, useRef, useState } from "react";
import { Search, X, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Modal untuk memilih foto dari galeri CDN.
 * Data diambil lewat proxy backend (route admin.cdn.*) supaya X-API-KEY tetap di server.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onSelect: ({ url, name }) => void
 */
export default function CdnImagePicker({ open, onClose, onSelect }) {
    const [images, setImages] = useState([]);
    const [meta, setMeta] = useState(null);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isFirst = useRef(true);

    // Ambil kategori sekali saat modal pertama dibuka.
    useEffect(() => {
        if (!open || categories.length > 0) return;
        fetch(route("admin.cdn.categories"), { headers: { Accept: "application/json" } })
            .then((r) => r.json())
            .then((json) => setCategories(json.data || []))
            .catch(() => {});
    }, [open]);

    // Reset ke halaman 1 saat filter berubah.
    useEffect(() => {
        setPage(1);
    }, [search, category]);

    // Ambil gambar (debounce untuk search).
    useEffect(() => {
        if (!open) return;

        const run = () => {
            setLoading(true);
            setError("");
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (category) params.set("category_slug", category);
            params.set("page", page);

            fetch(`${route("admin.cdn.images")}?${params.toString()}`, {
                headers: { Accept: "application/json" },
            })
                .then((r) => r.json())
                .then((json) => {
                    setImages(json.data || []);
                    setMeta(json.meta || null);
                })
                .catch(() => setError("Gagal memuat galeri CDN."))
                .finally(() => setLoading(false));
        };

        const t = setTimeout(run, isFirst.current ? 0 : 350);
        isFirst.current = false;
        return () => clearTimeout(t);
    }, [open, search, category, page]);

    if (!open) return null;

    const lastPage = meta?.last_page || 1;

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 space-y-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Pilih Foto dari Galeri CDN</h3>
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-9 rounded-md border border-input bg-transparent py-2 text-sm"
                            placeholder="Cari nama foto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full sm:w-56 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id ?? c.slug} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64 text-destructive">{error}</div>
                    ) : images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <ImageIcon size={32} className="mb-2" />
                            Tidak ada foto ditemukan.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {images.map((img) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => onSelect({ url: img.url, name: img.name })}
                                    className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted hover:ring-2 hover:ring-primary transition"
                                    title={img.name}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/300x200/f3f4f6/a1a1aa?text=?";
                                        }}
                                    />
                                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[11px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition">
                                        {img.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
                        <button
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted disabled:opacity-40"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-600">
                            Halaman {meta?.current_page || page} / {lastPage}
                        </span>
                        <button
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted disabled:opacity-40"
                            disabled={page >= lastPage || loading}
                            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
