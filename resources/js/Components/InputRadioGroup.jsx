export default function InputRadioGroup({
    label,
    name,
    value,
    options = [],
    onChange,
    direction = "row", // row | col
    className = "",
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="label">
                    <span className="label-text font-bold">{label}</span>
                </label>
            )}

            <div
                className={`flex gap-3 flex-wrap ${direction === "col"
                        ? "md:flex-col"          
                        : direction === "row"    
                            ? "md:flex-row"
                            : "md:flex-wrap"        
                    }`}
            >
                {options.map((opt) => {
                    const color = opt.color || "primary";
                    return (
                        <label
                            key={opt.value}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name={name}
                                className={`radio radio-xs radio-${color}`}
                                value={opt.value}
                                checked={value === opt.value}
                                onChange={() => onChange(opt.value)}
                            />
                            <span className={`badge badge-sm badge-soft badge-${color} whitespace-nowrap `}>
                                {opt.label}
                            </span>
                        </label>
                    )
                })}
            </div>
        </div>
    );
}
