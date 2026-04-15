import React from "react";
// Sesuaikan path import ini dengan lokasi file Switch Shadcn Anda
import { Switch } from "@/components/ui/switch"; 

export default function InputSwitch({
    label,
    checked = false,
    onChange,
    disabled = false,
    className = "",
}) {
    return (
        <div
            className={`flex items-center justify-between w-full 
            rounded-lg border border-input p-4 
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}`}
        >
            {/* LABEL */}
            {/* Tambahkan id dan htmlFor agar text label bisa diklik untuk men-toggle switch */}
            <label 
                htmlFor="custom-switch" 
                className={`text-base font-medium ${!disabled && 'cursor-pointer'}`}
            >
                {label}
            </label>

            {/* TOGGLE SHADCN */}
            <Switch
                id="custom-switch"
                checked={checked}
                onCheckedChange={onChange} // Shadcn menggunakan onCheckedChange, bukan onChange
                disabled={disabled}
            />
        </div>
    );
}