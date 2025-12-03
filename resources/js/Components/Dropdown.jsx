import { Link } from "@inertiajs/react";

export default function Dropdown({ trigger, children }) {
    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="m-1">
                {trigger}
            </div>

            <ul
                tabIndex={-1}
                className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow"
            >
                {children}
            </ul>
        </div>
    );
}

Dropdown.Link = function DropdownLink({ href, children, method, as }) {
    return (
        <li>
            <Link href={href} {...(method && { method })} {...(as && { as })}>{children}</Link>
        </li>
    );
};