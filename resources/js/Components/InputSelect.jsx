import React from "react";

export default function InputSelect({
    label,
    options = [],
    value,
    onChange,
    placeholder = "Pilih salah satu",
    className = "",
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-2 block">
                    <span className="text-sm font-bold">{label}</span>
                </label>
            )}

            <select
                className={`h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                value={value}
                onChange={onChange}
                {...props}
            >
                <option disabled value="">
                    {placeholder}
                </option>

                {options.map((opt, i) => (
                    <option key={i} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
