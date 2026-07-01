import React, { useState, useEffect } from 'react';

const CustomTimeInput = ({ value, onChange }) => {
    // 1. Tambahkan state lokal agar input tidak nge-freeze saat baru diketik
    const [timeStr, setTimeStr] = useState(value || '');

    // 2. Sinkronisasi dengan props jika ada perubahan dari luar
    useEffect(() => {
        setTimeStr(value || '');
    }, [value]);

    const handleChange = (e) => {
        let val = e.target.value;

        // Cegah input selain angka dan titik dua
        val = val.replace(/[^0-9:]/g, '');

        // Tambahkan otomatis titik dua (:)
        if (val.length === 2 && !val.includes(':') && e.nativeEvent.inputType !== 'deleteContentBackward') {
            val += ':';
        }

        // Batasi maksimal 5 karakter
        if (val.length > 5) val = val.substring(0, 5);

        // Validasi Jam (maks 23) dan Menit (maks 59)
        const parts = val.split(':');
        if (parts[0] && parts[0].length === 2) {
            if (parseInt(parts[0], 10) > 23) parts[0] = '23';
        }
        if (parts[1] && parts[1].length === 2) {
            if (parseInt(parts[1], 10) > 59) parts[1] = '59';
        }

        val = parts.length > 1 ? `${parts[0]}:${parts[1]}` : parts[0];

        // Update state lokal agar user melihat ketikannya
        setTimeStr(val);

        // KIRIM ke DatePicker hanya jika sudah lengkap (misal "18:00") atau dihapus habis
        if (val.length === 5 || val.length === 0) {
            onChange(val);
        }
    };

    return (
        <input
            type="text"
            value={timeStr} // Menggunakan state lokal
            onChange={handleChange}
            className="input input-bordered border input-sm text-center ml-2"
            style={{ width: '200px', margin: '0 auto' }}
            placeholder="18:00"
            maxLength={5}
        />
    );
};

export default CustomTimeInput;