import React from "react";

export default function InputPhoneNumber({
    label = "Nomor HP",
    value,
    onChange,
    prefix = "+62",
    maxLength = 15,
    placeholder = "81234567890",
    className = "",
    ...props
}) {
    const handleChange = (e) => {
        // Hanya angka
        let val = e.target.value.replace(/\D/g, "");

        // Batasi maxLength
        if (val.length > maxLength) {
            val = val.slice(0, maxLength);
        }

        onChange({ target: { value: val } });
    };

    return (
        <div className="form-control w-full">
            <label className="input input-bordered flex items-center gap-2 w-full" >
                <span className="opacity-70">{prefix}</span>

                <input
                    type="text"
                    className={`grow ${className}`}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    inputMode="numeric"
                    {...props}
                />
            </label>

            <div className="label justify-end">
                <span className="label-text-alt font-light text-xs">
                    {value.length}/{maxLength} digits
                </span>
            </div>
        </div>
    );
}
