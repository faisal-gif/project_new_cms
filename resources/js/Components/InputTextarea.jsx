import React from "react";

export default function InputTextarea({
    label,
    value,
    onChange,
    maxLength = 200,
    placeholder = "",
    className = "",
    ...props
}) {
    const handleChange = (e) => {
        let val = e.target.value;

        // Jika hasil paste/melewati limit → potong otomatis
        if (val.length > maxLength) {
            val = val.slice(0, maxLength);
        }

        onChange({ target: { value: val } });
    };

    return (
        <div className="form-control w-full">
            {label && (
                <label className="label mb-2">
                    <span className="label-text font-bold">{label}</span>
                </label>
            )}

            <textarea
                className={`textarea border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full ${className}`}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                {...props}
            />

            {/* Character Counter */}
            <div className="label justify-end">
                <span className="label-text-alt font-light text-xs">
                    {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
}
