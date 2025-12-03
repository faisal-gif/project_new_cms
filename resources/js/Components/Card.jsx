export default function Card({
    title,
    description,
    image,
    children,
    actions,
    color = "bg-base-100",
    shadow = "shadow",
    border = "",
    rounded = "rounded-xl",
    padding = "p-4",
    hover = true,
    className = "",
}) {
    return (
        <div
            className={`card ${color} ${shadow} ${border} ${rounded} 
                ${hover ? "hover:shadow-lg transition-all" : ""} 
                ${className}`}
        >
            {/* Jika ada gambar */}
            {image && (
                <figure className="overflow-hidden">
                    <img src={image} alt={title} className="w-full" />
                </figure>
            )}

            <div className={`card-body ${padding}`}>
                {title && <h2 className="card-title">{title}</h2>}

                {description && <p>{description}</p>}

                {/* Konten tambahan */}
                {children}

                {/* Actions / Buttons */}
                {actions && <div className="card-actions justify-end">{actions}</div>}
            </div>
        </div>
    );
}
