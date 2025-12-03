import { useEffect } from "react";

export default function Modal({
    children,
    show = false,
    maxWidth = "2xl",
    closeable = true,
    onClose = () => {},
}) {
    const close = () => {
        if (closeable) onClose();
    };

    const maxWidthClass = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
    }[maxWidth];

    // Disable scroll saat modal terbuka
    useEffect(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [show]);

    return (
        <div>
            <input
                type="checkbox"
                className="modal-toggle"
                checked={show}
                readOnly
            />

            <div
                className={`modal ${show ? "modal-open" : ""}`}
                onClick={close}
            >
                {/* Overlay */}
                <div className="modal-backdrop bg-black/50"></div>

                {/* Modal box */}
                <div
                    className={`modal-box bg-base-100 ${maxWidthClass} transition-all duration-200`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
