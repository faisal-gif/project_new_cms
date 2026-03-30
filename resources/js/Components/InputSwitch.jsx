export default function InputSwitch({
    label,
    checked = false,
    onChange,
    disabled = false,
    className = "",
}) {
    return (
        <label
            className={`flex items-center justify-between w-full 
            rounded-lg border border-[#d1d1d1] p-4 cursor-pointer 
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}`}
        >
            {/* LABEL */}
            <span className="text-base font-medium">
                {label}
            </span>

            {/* TOGGLE */}
            <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
            />
        </label>
    );
}
