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
        <div className="w-full">
            {label && (
                <label className="mb-2 block">
                    <span className="text-sm font-bold">{label}</span>
                </label>
            )}

            <textarea
                className={`min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                {...props}
            />

            {/* Character Counter */}
            <div className="flex justify-end">
                <span className="text-xs font-light text-muted-foreground">
                    {value.length}/{maxLength}
                </span>
            </div>
        </div>
    );
}
