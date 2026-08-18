import { Link } from "@inertiajs/react";
import { buttonVariants } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

// Nama file dipertahankan (dipakai ~38 caller) walau internalnya sudah shadcn, bukan daisyUI.
export default function PaginationDaisy({ data }) {
    if (!data || data.last_page <= 1) return null;

    const current = data.current_page;
    const last = data.last_page;

    const pages = [];

    const getPageUrl = (page) => {
        const found = data.links.find((l) => l.label == page.toString());
        return found?.url ?? null;
    };

    for (let i = 1; i <= Math.min(2, last); i++) pages.push(i);

    if (current > 4) pages.push("...");

    for (let i = current - 1; i <= current + 1; i++) {
        if (i > 2 && i < last - 1) pages.push(i);
    }

    if (current < last - 3) pages.push("...");

    for (let i = Math.max(3, last - 1); i <= last; i++) {
        if (!pages.includes(i)) pages.push(i);
    }

    const item = (active) =>
        cn(buttonVariants({ variant: active ? "default" : "outline", size: "icon-sm" }));
    const disabled = cn(
        buttonVariants({ variant: "outline", size: "icon-sm" }),
        "pointer-events-none opacity-50"
    );

    return (
        <div className="flex justify-center mt-6">
            <div className="inline-flex items-center gap-1">

                {/* Prev */}
                {data.prev_page_url ? (
                    <Link
                        href={data.prev_page_url}
                        preserveScroll
                        preserveState
                        className={item(false)}
                        aria-label="Sebelumnya"
                    >
                        ‹
                    </Link>
                ) : (
                    <span className={disabled} aria-hidden>‹</span>
                )}

                {pages.map((p, i) =>
                    p === "..." ? (
                        <span
                            key={i}
                            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "pointer-events-none")}
                        >
                            …
                        </span>
                    ) : (
                        <Link
                            key={i}
                            href={getPageUrl(p)}
                            preserveScroll
                            preserveState
                            className={item(current === p)}
                            aria-current={current === p ? "page" : undefined}
                        >
                            {p}
                        </Link>
                    )
                )}

                {/* Next */}
                {data.next_page_url ? (
                    <Link
                        href={data.next_page_url}
                        preserveScroll
                        preserveState
                        className={item(false)}
                        aria-label="Berikutnya"
                    >
                        ›
                    </Link>
                ) : (
                    <span className={disabled} aria-hidden>›</span>
                )}

            </div>
        </div>
    );
}
