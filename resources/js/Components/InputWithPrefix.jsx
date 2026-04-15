import React from "react";

export default function InputWithPrefix({
    prefix = "",
    placeholder = "",
    value,
    onChange,
    type = "text",
    className = "",
    ...props
}) {
    return (
        <label className={`input border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
            {prefix && <span className="label">{prefix}</span>}

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />
        </label>
    );
}
