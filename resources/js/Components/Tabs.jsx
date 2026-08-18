import { useState } from "react";
import { cn } from "@/lib/utils";

// Segmented tabs (pengganti daisyUI `tabs`). Props tetap kompatibel:
// tabs=[{label,value,icon?,disabled?}], value/defaultValue (controlled/uncontrolled),
// onChange, full. `variant`/`size` diterima tapi tak dipakai (styling seragam).
export default function Tabs({ tabs = [], defaultValue, value, onChange, full = false, className }) {
    const [internal, setInternal] = useState(defaultValue ?? tabs?.[0]?.value);
    const active = value ?? internal;

    const setActive = (v) => {
        if (value === undefined) setInternal(v);
        onChange?.(v);
    };

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 rounded-lg bg-muted p-1",
                full && "flex w-full",
                className
            )}
        >
            {tabs.map((tab) => {
                const isActive = active === tab.value;
                return (
                    <button
                        key={tab.value}
                        type="button"
                        disabled={tab.disabled}
                        onClick={() => !tab.disabled && setActive(tab.value)}
                        className={cn(
                            "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            full && "flex-1",
                            isActive
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            tab.disabled && "opacity-40 cursor-not-allowed"
                        )}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
