import { Link } from "@inertiajs/react";

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

    return (
        <div className="flex justify-center mt-6">
            <div className="join">

                {/* Prev */}
                <Link
                    href={data.prev_page_url ?? "#"}
                    preserveScroll
                    preserveState
                    className={`join-item btn btn-sm ${!data.prev_page_url && "btn-disabled"}`}
                >
                    ‹
                </Link>

                {pages.map((p, i) =>
                    p === "..." ? (
                        <button key={i} className="join-item btn btn-sm btn-disabled">
                            ...
                        </button>
                    ) : (
                        <Link
                            key={i}
                            href={getPageUrl(p)}
                            preserveScroll
                            preserveState
                            className={`join-item btn btn-sm ${current === p ? "btn-primary" : ""}`}
                        >
                            {p}
                        </Link>
                    )
                )}

                {/* Next */}
                <Link
                    href={data.next_page_url ?? "#"}
                    preserveScroll
                    preserveState
                    className={`join-item btn btn-sm ${!data.next_page_url && "btn-disabled"}`}
                >
                    ›
                </Link>

            </div>
        </div>
    );
}
