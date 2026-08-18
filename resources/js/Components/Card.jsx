export default function Card({
    title,
    description,
    image,
    children,
    actions,
    color = "bg-background",
    shadow = "shadow",
    border = "",
    rounded = "rounded-xl",
    padding = "p-4",
    hover = true,
    className = "",
}) {
    return (
        <div
            className={`${color} ${shadow} ${border} ${rounded}
                ${hover ? "hover:shadow-lg transition-all" : ""} 
                ${className}`}
        >
            {/* Jika ada gambar */}
            {image && (
                <figure className="overflow-hidden">
                    <img src={image} alt={title} className="w-full" />
                </figure>
            )}

            <div className={`flex flex-col ${padding}`}>
                {title && <h2 className="text-lg font-semibold">{title}</h2>}

                {description && <p>{description}</p>}

                {/* Konten tambahan */}
                {children}

                {/* Actions / Buttons */}
                {actions && <div className="flex justify-end gap-2">{actions}</div>}
            </div>
        </div>
    );
}
