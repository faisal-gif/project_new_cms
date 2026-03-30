"use client";
import { useState } from "react";

export default function Tabs({
  tabs = [],
  defaultValue,
  value,
  onChange,
  variant = "boxed", // boxed | bordered | lifted
  size = "md", // xs sm md lg
  full = false,
}) {
  const [internal, setInternal] = useState(defaultValue || tabs?.[0]?.value);

  const active = value ?? internal;

  const setActive = (val) => {
    if (!value) setInternal(val);
    onChange?.(val);
  };

  const variantClass =
    variant === "bordered"
      ? "tabs-bordered"
      : variant === "lifted"
      ? "tabs-lifted"
      : "tabs-boxed";

  const sizeClass =
    size === "xs"
      ? "tabs-xs"
      : size === "sm"
      ? "tabs-sm"
      : size === "lg"
      ? "tabs-lg"
      : "";

  return (
    <div className={`tabs ${variantClass} ${sizeClass} ${full ? "w-full" : ""}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          disabled={tab.disabled}
          onClick={() => !tab.disabled && setActive(tab.value)}
          className={`tab gap-2 ${
            active === tab.value ? "tab-active" : ""
          } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}