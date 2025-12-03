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
        <label className={`input ${className}`}>
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
