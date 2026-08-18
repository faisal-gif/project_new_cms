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
        <div className="w-full">
            <label className="flex h-9 items-center gap-2 w-full rounded-md border border-input bg-background px-3 text-sm" >
                <span className="opacity-70">{prefix}</span>

                <input
                    type="text"
                    className={`grow bg-transparent outline-none ${className}`}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    inputMode="numeric"
                    {...props}
                />
            </label>

            <div className="flex justify-end">
                <span className="text-xs font-light text-muted-foreground">
                    {value.length}/{maxLength} digits
                </span>
            </div>
        </div>
    );
}
