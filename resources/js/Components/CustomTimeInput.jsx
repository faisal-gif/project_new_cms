const CustomTimeInput = ({ date, value, onChange }) => {
    const handleChange = (e) => {
        let val = e.target.value;

        // 1. Cegah input selain angka dan titik dua
        val = val.replace(/[^0-9:]/g, '');

        // 2. Tambahkan otomatis titik dua (:) setelah 2 digit pertama jika user mengetik maju
        // (nativeEvent.inputType dicek agar titik dua bisa dihapus saat menekan backspace)
        if (val.length === 2 && !val.includes(':') && e.nativeEvent.inputType !== 'deleteContentBackward') {
            val += ':';
        }

        // 3. Batasi maksimal 5 karakter (HH:mm)
        if (val.length > 5) {
            val = val.substring(0, 5);
        }

        const parts = val.split(':');
        
        // 4. Validasi Jam (maksimal 23)
        if (parts[0] && parts[0].length === 2) {
            const hour = parseInt(parts[0], 10);
            if (hour > 23) {
                parts[0] = '23'; 
            }
        }

        // 5. Validasi Menit (maksimal 59)
        if (parts[1] && parts[1].length === 2) {
            const minute = parseInt(parts[1], 10);
            if (minute > 59) {
                parts[1] = '59';
            }
        }

        // Gabungkan kembali nilainya
        val = parts.length > 1 ? `${parts[0]}:${parts[1]}` : parts[0];

        // Kirim kembali ke react-datepicker
        onChange(val);
    };

    return (
        <input
            type="text"
            value={value || ''}
            onChange={handleChange}
            className="input input-bordered input-sm w-24 text-center ml-2" 
            placeholder="18:00"
            maxLength={5}
        />
    );
};

export default CustomTimeInput;