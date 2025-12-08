import { formatRupiah } from "@/Utils/formatter";
import React from "react";

export default function InputRupiah({
    value,           
    onChange,
    placeholder = "Masukkan harga",
    className = "",
    ...props
}) {


    const handleChange = (e) => {
        let val = e.target.value;

        // Hilangkan semua karakter non-angka
        val = val.replace(/[^0-9]/g, "");

        // Convert ke integer
        const numeric = val ? parseInt(val, 10) : 0;

        // Kirim angka murni ke parent
        onChange({ target: { value: numeric } });
    };

    return (
        <div className="form-control w-full">
            <label className="input input-bordered flex items-center gap-2 w-full">
                <span className="opacity-70">Rp</span>

                <input
                    type="text"
                    className={`grow ${className}`}
                    value={value ? formatRupiah(value).replace("Rp", "").trim() : ""}
                    onChange={handleChange}
                    placeholder={placeholder}
                    inputMode="numeric"
                    {...props}
                />
            </label>
        </div>
    );
}
