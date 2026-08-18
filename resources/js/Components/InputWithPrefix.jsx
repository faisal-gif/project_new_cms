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
        <label className={`flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}>
            {prefix && <span className="text-muted-foreground">{prefix}</span>}

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="h-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                {...props}
            />
        </label>
    );
}
