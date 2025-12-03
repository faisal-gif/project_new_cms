// Format angka ribuan: 327546 → 327.546
export function formatNumber(number) {
    if (!number) return "0";
    return new Intl.NumberFormat("id-ID").format(number);
}

// Format Rupiah: 120000 → Rp120.000
export function formatRupiah(number) {
    if (!number) return "Rp0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
}

// Format angka compact: 327546 → 327K
export function formatCompact(number) {
    if (!number) return "0";
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(number);
}

// Format tanggal: 2025-11-24 → 24 Nov 2025
export function formatDate(date) {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

// Format tanggal panjang: Senin, 24 November 2025
export function formatDateLong(date) {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

// Format waktu: 2025-11-24T10:30 → 10:30
export function formatTime(date) {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

// Format lengkap: 2025-11-24 → 2025-11-24 10:30:22
export function formatDateTime(date) {
    if (!date) return "-";

    const d = new Date(date);

    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const DD = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}
