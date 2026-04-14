import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import {
    Clipboard,
    Edit,
    File,
    FolderInput,
    Globe,
    History,
    Image,
    ImageIcon,
    ImagesIcon,
    LayoutDashboard,
    Link2,
    List,
    MapPin,
    Menu,
    Newspaper,
    NewspaperIcon,
    Pen,
    Settings,
    User
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // ===== ACTIVE HELPERS =====
    const isActive = (names) => {
        if (Array.isArray(names)) {
            return names.some(name => route().current(name));
        }
        return route().current(names);
    };

    const linkClass = (active) =>
        `my-0.5 hover:bg-blue-400 transition
        ${active ? 'bg-blue-500 text-white font-semibold' : ''}`;

    // =========================

    return (
        <div className="drawer lg:drawer-open bg-base-300 ">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            {/* ================= CONTENT ================= */}
            <div className="drawer-content overflow-x-auto">
                {/* NAVBAR */}
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
                            <Dropdown.Link href={route('profile.edit')}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown>
                    </div>
                </div>

                <main className="p-4">
                    {children}
                </main>
            </div>

            {/* ================= SIDEBAR ================= */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-3" className="drawer-overlay"></label>

                <ul className="menu bg-[#343a40] min-h-full w-72 p-4 text-white">
                    {/* LOGO */}
                    <li>
                        <Link href="/">
                            <ApplicationLogo className="h-10 w-full mx-auto mb-6" />
                        </Link>
                    </li>

                    {/* DASHBOARD */}
                    <li>
                        <Link
                            href={route('dashboard')}
                            className={linkClass(isActive('dashboard'))}
                        >
                            <LayoutDashboard size={16} />
                            Dashboard
                        </Link>
                    </li>

                    {/* ================= Content ================= */}
                    <h2 className="menu-title text-white/70 mt-4 text-lg">Content</h2>

                    {/* News */}
                    <li>
                        <details open={isActive(['admin.news.*', 'admin.daerah.news.*', 'admin.nasional.news.*'])}>
                            <summary className={linkClass(
                                isActive(['admin.news.*', 'admin.daerah.news.*', 'admin.nasional.news.*'])
                            )}>
                                <Newspaper size={16} />
                                News
                            </summary>
                            <ul>
                                <li>
                                    <Link
                                        href={route('admin.news.index')}
                                        className={linkClass(isActive('admin.news.*'))}
                                    >
                                        News Master
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('admin.daerah.news.index')}
                                        className={linkClass(isActive('admin.daerah.news.*'))}
                                    >
                                        News Daerah
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('admin.nasional.news.index')}
                                        className={linkClass(isActive('admin.nasional.news.*'))}
                                    >
                                        News Nasional
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>

                    {/* Gallery */}
                    <li>
                        <Link
                            href={route('admin.nasional.fotografi.index')}
                            className={linkClass(isActive('admin.nasional.fotografi.*'))}
                        >
                            <Image size={16} />
                            Gallery
                        </Link>
                    </li>

                    {/* KANAL */}
                    <li>
                        <details open={isActive(['admin.daerah.kanal.*', 'admin.nasional.kanal.*'])}>
                            <summary className={linkClass(
                                isActive(['admin.daerah.kanal.*', 'admin.nasional.kanal.*'])
                            )}>
                                <File size={16} />
                                Kanal
                            </summary>
                            <ul>
                                <li>
                                    <Link
                                        href={route('admin.daerah.kanal.index')}
                                        className={linkClass(isActive('admin.daerah.kanal.*'))}
                                    >
                                        Kanal Daerah
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('admin.nasional.kanal.index')}
                                        className={linkClass(isActive('admin.nasional.kanal.*'))}
                                    >
                                        Kanal Nasional
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>

                    {/* FOKUS */}
                    <li>
                        <details open={isActive(['admin.daerah.fokus.*', 'admin.nasional.fokus.*'])}>
                            <summary className={linkClass(isActive(['admin.daerah.fokus.*', 'admin.nasional.fokus.*']))}>
                                <Clipboard size={16} />
                                Fokus
                            </summary>
                            <ul>
                                <li>
                                    <Link
                                        href={route('admin.daerah.fokus.index')}
                                        className={linkClass(isActive('admin.daerah.fokus.*'))}
                                    >
                                        Fokus Daerah
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={route('admin.nasional.fokus.index')}
                                        className={linkClass(isActive('admin.nasional.fokus.*'))}
                                    >
                                        Fokus Nasional
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>

                    {/* SOURCE */}
                    <li>
                        <Link className={linkClass(false)}>
                            <Link2 size={16} />
                            Source
                        </Link>
                    </li>



                    {/* =================  Team / Users  ================= */}
                    <h2 className="menu-title text-white/70 mt-4 text-lg">
                        Team / Users
                    </h2>

                    {/* USERS */}
                    <li>
                        <Link
                            href={route('admin.users.index')}
                            className={linkClass(isActive('admin.users.*'))}
                        >
                            <User size={16} />
                            User
                        </Link>
                    </li>

                    {/* WRITER */}
                    <li>
                        <details open={isActive('admin.daerah.writer.*')}>
                            <summary className={linkClass(isActive('admin.daerah.writer.*'))}>
                                <Pen size={16} />
                                Writer
                            </summary>
                            <ul>
                                <li>
                                    <Link
                                        href={route('admin.daerah.writer.index')}
                                        className={linkClass(isActive('admin.daerah.writer.*'))}
                                    >
                                        Writer Daerah
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>

                    {/* EDITOR */}
                    <li>
                        <Link
                            href={route('admin.daerah.editor.index')}
                            className={linkClass(isActive('admin.daerah.editor.*'))}
                        >
                            <Edit size={16} />
                            Editor
                        </Link>
                    </li>

                    {/* ================= Settings ================= */}
                    <h2 className="menu-title text-white/70 mt-4 text-lg">
                        Settings
                    </h2>

                    {/* NETWORK */}
                    <li>
                        <details open={isActive('admin.daerah.network.*')}>
                            <summary className={linkClass(isActive('admin.daerah.network.*'))}>
                                <Globe size={16} />
                                Network
                            </summary>
                            <ul>
                                <li>
                                    <Link
                                        href={route('admin.daerah.network.index')}
                                        className={linkClass(isActive('admin.daerah.network.*'))}
                                    >
                                        Network Daerah
                                    </Link>
                                </li>
                            </ul>
                        </details>
                    </li>

                    {/* HISTORY */}
                    <li>
                        <Link
                            href={route('admin.history.index')}
                            className={linkClass(isActive('admin.history.*'))}
                        >
                            <History size={16} />
                            History
                        </Link>
                    </li>

                    {/* ================= ADS ================= */}
                    <h2 className="menu-title text-white/70 mt-4">ADS</h2>

                    <li>
                        <details open={isActive('admin.daerah.ads.*')}>
                            <summary className={linkClass(isActive('admin.daerah.ads.*'))}>
                                <ImagesIcon size={16} />
                                ADS
                            </summary>
                            <ul>
                                <li>
                                    <details open={isActive('admin.daerah.ads.*')}>
                                        <summary className={linkClass(isActive('admin.daerah.ads.*'))}>
                                            <ImageIcon size={16} />
                                            ADS Daerah
                                        </summary>
                                        <ul>
                                            <li>
                                                <Link
                                                    href={route('admin.daerah.ads.locate.index')}
                                                    className={linkClass(isActive('admin.daerah.ads.locate.*'))}
                                                >
                                                    <MapPin size={16} />
                                                    ADS Location
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href={route('admin.daerah.ads.list.index')}
                                                    className={linkClass(isActive('admin.daerah.ads.list.*'))}
                                                >
                                                    <List size={16} />
                                                    ADS List
                                                </Link>
                                            </li>
                                        </ul>
                                    </details>
                                </li>
                            </ul>
                        </details>
                    </li>

                    {/* ================= AJP ================= */}
                    <h2 className="menu-title text-white/70 mt-4">AJP</h2>

                    <li>
                        <Link className={linkClass(false)}>
                            <FolderInput size={16} />
                            Export AJP
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
