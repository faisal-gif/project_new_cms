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
        <div className="form-control w-full">
            {label && (
                <label className="label mb-2">
                    <span className="label-text font-bold">{label}</span>
                </label>
            )}

            <select
                className={`select select-bordered w-full ${className}`}
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
