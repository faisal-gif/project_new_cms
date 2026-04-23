import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import {
    BookText,
    Clipboard,
    Edit,
    File,
    FolderInput,
    Globe,
    History,
    Image as ImageIcon, // Alias agar tidak bentrok dengan class bawaan JS
    Images,
    LayoutDashboard,
    Link2,
    List,
    MapPin,
    Menu,
    Newspaper,
    Pen,
    Settings,
    User,
    Users
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    useEffect(() => {
        if (flash?.success) {
            toast.success("Berhasil", { description: flash.success });
        }
        if (flash?.error) {
            toast.error("Terjadi Kesalahan", { description: flash.error });
        }
    }, [flash]);

    // ===== ACTIVE HELPERS =====
    const isActive = (names) => {
        if (Array.isArray(names)) {
            return names.some(name => route().current(name));
        }
        return route().current(names);
    };

    const linkClass = (active) =>
        `my-0.5 hover:bg-blue-400 transition ${active ? 'bg-blue-500 text-white font-semibold' : ''}`;
    // =========================

    return (
        <div className="drawer lg:drawer-open bg-base-300">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            {/* ================= CONTENT ================= */}
            <div className="drawer-content overflow-x-auto">
                <div className="navbar bg-base-100 border-b border-base-300 px-4">
                    <div className="flex-none lg:hidden">
                        <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
                            <Menu size={20} />
                        </label>
                    </div>
                    <div className="flex-1" />
                    <div className="flex-none">
                        <Dropdown
                            trigger={
                                <button className="btn btn-ghost flex items-center gap-2">
                                    <User size={20} />
                                    <span>{user.name}</span>
                                </button>
                            }
                        >
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                        </Dropdown>
                    </div>
                </div>

                <main className="p-4">
                    {children}
                </main>
            </div>

            {/* ================= SIDEBAR ================= */}
            <div className="drawer-side z-50">
                <label htmlFor="my-drawer-3" className="drawer-overlay"></label>

                <ul className="menu bg-[#343a40] min-h-full w-72 p-4 text-white">
                    {/* LOGO */}
                    <li>
                        <Link href="/">
                            <ApplicationLogo className="h-10 w-full mx-auto mb-6" />
                        </Link>
                    </li>

                    {/* ================= 1. GLOBAL / MASTER ================= */}
                    <h2 className="menu-title text-white/50 uppercase text-xs tracking-wider mt-2">Global Master</h2>

                    <li>
                        <Link href={route('dashboard')} className={linkClass(isActive('dashboard'))}>
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href={route('admin.news.index')} className={linkClass(isActive('admin.news.*'))}>
                            <Newspaper size={16} /> News Master
                        </Link>
                    </li>
                    <li>
                        <Link href={route('admin.users.index')} className={linkClass(isActive('admin.users.*'))}>
                            <Users size={16} /> Users Master
                        </Link>
                    </li>
                    <li>
                        <Link href={route('admin.history.index')} className={linkClass(isActive('admin.history.*'))}>
                            <History size={16} /> System History
                        </Link>
                    </li>

                    {/* ================= 2. NASIONAL ================= */}
                    <div className="divider my-1 bg-white/10 h-[1px]"></div>
                    <h2 className="menu-title text-blue-400 uppercase text-xs tracking-wider">Nasional</h2>

                    <li>
                        <Link href={route('admin.nasional.news.index')} className={linkClass(isActive('admin.nasional.news.*'))}>
                            <Newspaper size={16} /> News Nasional
                        </Link>
                    </li>
                    <li>
                        <Link href={route('admin.nasional.kanal.index')} className={linkClass(isActive('admin.nasional.kanal.*'))}>
                            <File size={16} /> Kanal Nasional
                        </Link>
                    </li>
                    <li>
                        <Link href={route('admin.nasional.fokus.index')} className={linkClass(isActive('admin.nasional.fokus.*'))}>
                            <Clipboard size={16} /> Fokus Nasional
                        </Link>
                    </li>
                    <li>
                        <Link href={route('admin.nasional.fotografi.index')} className={linkClass(isActive('admin.nasional.fotografi.*'))}>
                            <ImageIcon size={16} /> Gallery Nasional
                        </Link>
                    </li>
                     <li>
                        <Link href={route('admin.nasional.ekoran.index')} className={linkClass(isActive('admin.nasional.ekoran.*'))}>
                            <BookText size={16} /> Ekoran
                        </Link>
                    </li>
                    {/* Grup Tim Nasional */}
                    <li>
                        <details open={isActive(['admin.nasional.writer.*', 'admin.nasional.editor.*'])}>
                            <summary className={linkClass(isActive(['admin.nasional.writer.*', 'admin.nasional.editor.*']))}>
                                <Users size={16} /> Tim Redaksi
                            </summary>
                            <ul>
                                <li>
                                    <Link href={route('admin.nasional.writer.index')} className={linkClass(isActive('admin.nasional.writer.*'))}>
                                        <Pen size={16} /> Penulis
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('admin.nasional.editor.index')} className={linkClass(isActive('admin.nasional.editor.*'))}>
                                        <Edit size={16} /> Editor
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>
                    {/* ================= 3. DAERAH ================= */}
                    <div className="divider my-1 bg-white/10 h-[1px]"></div>
                    <h2 className="menu-title text-emerald-400 uppercase text-xs tracking-wider">Daerah</h2>

                    <li>
                        <Link href={route('admin.daerah.news.index')} className={linkClass(isActive('admin.daerah.news.*'))}>
                            <Newspaper size={16} /> News Daerah
                        </Link>
                    </li>
                    <li>
                        <Link href={route('admin.daerah.kanal.index')} className={linkClass(isActive('admin.daerah.kanal.*'))}>
                            <File size={16} /> Kanal Daerah
                        </Link>
                    </li>
                    <li>
                        <Link href={route('admin.daerah.fokus.index')} className={linkClass(isActive('admin.daerah.fokus.*'))}>
                            <Clipboard size={16} /> Fokus Daerah
                        </Link>
                    </li>

                    {/* Grup Tim Daerah */}
                    <li>
                        <details open={isActive(['admin.daerah.writer.*', 'admin.daerah.editor.*'])}>
                            <summary className={linkClass(isActive(['admin.daerah.writer.*', 'admin.daerah.editor.*']))}>
                                <Users size={16} /> Tim Redaksi
                            </summary>
                            <ul>
                                <li>
                                    <Link href={route('admin.daerah.writer.index')} className={linkClass(isActive('admin.daerah.writer.*'))}>
                                        <Pen size={16} /> Penulis
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('admin.daerah.editor.index')} className={linkClass(isActive('admin.daerah.editor.*'))}>
                                        <Edit size={16} /> Editor
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>

                    {/* Grup Ekstra Daerah */}
                    <li>
                        <Link href={route('admin.daerah.network.index')} className={linkClass(isActive('admin.daerah.network.*'))}>
                            <Globe size={16} /> Network
                        </Link>
                    </li>

                    {/* ADS Daerah - Diperbaiki agar tidak double dropdown */}
                    <li>
                        <details open={isActive('admin.daerah.ads.*')}>
                            <summary className={linkClass(isActive('admin.daerah.ads.*'))}>
                                <Images size={16} /> ADS Manager
                            </summary>
                            <ul>
                                <li>
                                    <Link href={route('admin.daerah.adsLocate.index')} className={linkClass(isActive('admin.daerah.ads.locate.*'))}>
                                        <MapPin size={16} /> Location
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('admin.daerah.ads.index')} className={linkClass(isActive('admin.daerah.ads.list.*'))}>
                                        <List size={16} /> Ads
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>

                    {/* ================= 4. TOOLS & EXPORT ================= */}
                    <div className="divider my-1 bg-white/10 h-[1px]"></div>
                    <h2 className="menu-title text-white/50 uppercase text-xs tracking-wider">Tools & Export</h2>

                    <li>
                        <Link href="#" className={linkClass(false)}>
                            <Link2 size={16} /> Source Links
                        </Link>
                    </li>
                    <li>
                        <Link href="#" className={linkClass(false)}>
                            <FolderInput size={16} /> Export AJP
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}