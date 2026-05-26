import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BookText,
    Clipboard,
    Edit,
    File,
    FolderInput,
    Globe,
    History,
    Image as ImageIcon,
    Images,
    ImagesIcon,
    Key,
    LayoutDashboard,
    Link2,
    List,
    MapPin,
    Menu,
    Newspaper,
    Pen,
    Settings,
    ShieldCheck,
    User,
    Users,
    Bell,        // <-- TAMBAHAN: Icon Lonceng Notifikasi
    BarChart3    // <-- TAMBAHAN: Icon untuk menu Laporan/Report
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const userPermissions = auth.permissions || [];

    // AMBIL DATA NOTIFIKASI DARI MIDDLEWARE
    const [notifications, setNotifications] = useState(auth.notifications || []);


    const handleClearNotifications = () => {
        router.post(route('admin.notifications.clear'), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Kosongkan state lokal agar angka merah di lonceng langsung hilang
                setNotifications([]);
            }
        });
    };

    useEffect(() => {
        // Pastikan Echo sudah tersedia dan user sedang login
        if (window.Echo && user) {

            // Dengarkan channel 'private-App.Models.User.{id}' khusus untuk user ini
            window.Echo.private(`App.Models.User.${user.id}`)
                .notification((notification) => {
                    // Ketika ada notifikasi real-time masuk:

                    // A. Format ulang strukturnya agar mirip dengan database JSON
                    const newNotification = {
                        id: notification.id,
                        data: {
                            title: notification.title,
                            message: notification.message,
                            url: notification.url
                        }
                    };

                    // B. Masukkan notif baru ke urutan paling atas di Navbar tanpa refresh!
                    setNotifications((prev) => [newNotification, ...prev]);

                    // C. Tampilkan Popup Toast sebagai pemberitahuan instan di layar!
                    toast.success(newNotification.data.title, {
                        description: newNotification.data.message
                    });
                });
        }

        // Cleanup listener saat komponen unmount
        return () => {
            if (window.Echo && user) {
                window.Echo.leave(`App.Models.User.${user.id}`);
            }
        };
    }, [user]);


    // 2. Buat helper function
    const hasPermission = (permissions) => {
        if (Array.isArray(permissions)) {
            return permissions.some(permission => userPermissions.includes(permission));
        }
        return userPermissions.includes(permissions);
    };

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

                    {/* BAGIAN KANAN NAVBAR */}
                    <div className="flex-none flex items-center gap-2">

                        {/* ================= LONCENG NOTIFIKASI ================= */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <div className="indicator">
                                    <Bell size={20} />
                                    {notifications.length > 0 && (
                                        <span className="badge badge-sm badge-error indicator-item text-white border-none shadow-sm">
                                            {notifications.length}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul tabIndex={0} className="mt-3 z-[50] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-80 border border-gray-100">
                                <li className="menu-title flex flex-row items-center justify-between border-b pb-2 mb-2">
                                    <span className="text-gray-900 font-bold text-sm">Notifikasi Anda</span>

                                    {/* TOMBOL BERSIHKAN MUNCUL JIKA ADA NOTIFIKASI */}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearNotifications}
                                            className="text-[10px] text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-md cursor-pointer uppercase tracking-wider font-bold"
                                        >
                                            Bersihkan
                                        </button>
                                    )}
                                </li>

                                {notifications.length === 0 ? (
                                    <li className="text-gray-500 text-center py-4">Belum ada notifikasi baru</li>
                                ) : (
                                    notifications.map((notif) => (
                                        <li key={notif.id}>
                                            {notif.data.is_download ? (
                                                // RENDER UNTUK NOTIFIKASI EXCEL (UNDUH)
                                                <a
                                                    href={notif.data.url}
                                                    download
                                                    className="flex flex-col items-start gap-1 p-3 hover:bg-green-50/50"
                                                >
                                                    <span className="font-bold text-success">{notif.data.title}</span>
                                                    <span className="text-xs text-gray-600 whitespace-normal">
                                                        {notif.data.message}
                                                    </span>
                                                    <span className="text-xs font-semibold text-green-600 mt-1 flex items-center gap-1">
                                                        ⬇️ Klik untuk mengunduh Excel
                                                    </span>
                                                </a>
                                            ) : (
                                                // RENDER UNTUK NOTIFIKASI BERITA BARU DARI WARTAWAN (LINK HALAMAN)
                                                <Link
                                                    href={notif.data.url}
                                                    className="flex flex-col items-start gap-1 p-3 hover:bg-blue-50/50"
                                                >
                                                    <span className="font-bold text-primary">{notif.data.title}</span>
                                                    <span className="text-xs text-gray-600 whitespace-normal line-clamp-2">
                                                        {notif.data.message}
                                                    </span>
                                                    <span className="text-xs font-semibold text-blue-500 mt-1 flex items-center gap-1">
                                                        👁️ Tinjau Berita Sekarang
                                                    </span>
                                                </Link>
                                            )}
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                        {/* ======================================================= */}

                        <Dropdown
                            trigger={
                                <button className="btn btn-ghost flex items-center gap-2 ml-2">
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
                    {hasPermission('view news master') && (
                        <li>
                            <Link href={route('admin.news.index')} className={linkClass(isActive('admin.news.*'))}>
                                <Newspaper size={16} /> News Master
                            </Link>
                        </li>
                    )}
                    {hasPermission('view users master') && (
                        <li>
                            <Link href={route('admin.users.index')} className={linkClass(isActive('admin.users.*'))}>
                                <Users size={16} /> Users Master
                            </Link>
                        </li>
                    )}
                    {/* ===== START PENAMBAHAN MENU ROLE & PERMISSION ===== */}
                    {hasPermission('view role master') && (
                        <li>
                            <Link href={route('admin.roles.index')} className={linkClass(isActive('admin.roles.*'))}>
                                <ShieldCheck size={16} /> Roles Master
                            </Link>
                        </li>
                    )}
                    {hasPermission('view permission master') && (
                        <li>
                            <Link href={route('admin.permissions.index')} className={linkClass(isActive('admin.permissions.*'))}>
                                <Key size={16} /> Permissions Master
                            </Link>
                        </li>
                    )}
                    {/* Grup Tim Daerah */}
                    {hasPermission(['view penulis master', 'view editors master']) && (
                        <li>
                            <details open={isActive(['admin.writers.*', 'admin.editors.*'])}>
                                <summary className={linkClass(isActive(['admin.writers.*', 'admin.editors.*']))}>
                                    <Users size={16} /> Tim Redaksi Master
                                </summary>
                                <ul>
                                    {hasPermission('view penulis master') && (
                                        <li>
                                            <Link href={route('admin.writers.index')} className={linkClass(isActive('admin.writers.*'))}>
                                                <Pen size={16} /> Penulis
                                            </Link>
                                        </li>
                                    )}
                                    {hasPermission('view editor master') && (
                                        <li>
                                            <Link href={route('admin.editors.index')} className={linkClass(isActive('admin.editors.*'))}>
                                                <Edit size={16} /> Editor
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </details>
                        </li>
                    )}
                    <li>
                        <Link href={'#'} className={linkClass(isActive('admin.history.*'))}>
                            <History size={16} /> System History
                        </Link>
                    </li>

                    {/* ================= 2. NASIONAL ================= */}
                    <div className="divider my-1 bg-white/10 h-[1px]"></div>
                    <h2 className="menu-title text-blue-400 uppercase text-xs tracking-wider">Nasional</h2>


                    {hasPermission('view news nasional') && (
                        <li>
                            <Link href={route('admin.nasional.news.index')} className={linkClass(isActive('admin.nasional.news.*'))}>
                                <Newspaper size={16} /> News Nasional
                            </Link>
                        </li>
                    )}
                    {hasPermission('view kanal nasional') && (
                        <li>
                            <Link href={route('admin.nasional.kanal.index')} className={linkClass(isActive('admin.nasional.kanal.*'))}>
                                <File size={16} /> Kanal Nasional
                            </Link>
                        </li>
                    )}
                    {hasPermission('view fokus nasional') && (
                        <li>
                            <Link href={route('admin.nasional.fokus.index')} className={linkClass(isActive('admin.nasional.fokus.*'))}>
                                <Clipboard size={16} /> Fokus Nasional
                            </Link>
                        </li>
                    )}
                    {hasPermission('view gallery nasional') && (
                        <li>
                            <Link href={route('admin.nasional.fotografi.index')} className={linkClass(isActive('admin.nasional.fotografi.*'))}>
                                <ImageIcon size={16} /> Gallery Nasional
                            </Link>
                        </li>
                    )}
                    {hasPermission('view ekoran nasional') && (
                        <li>
                            <Link href={route('admin.nasional.ekoran.index')} className={linkClass(isActive('admin.nasional.ekoran.*'))}>
                                <BookText size={16} /> Ekoran
                            </Link>
                        </li>
                    )}
                    {/* Grup Tim Nasional */}
                    {hasPermission(["view penulis nasional", "view editor nasional"]) && (
                        <li>
                            <details open={isActive(['admin.nasional.writer.*', 'admin.nasional.editor.*'])}>
                                <summary className={linkClass(isActive(['admin.nasional.writer.*', 'admin.nasional.editor.*']))}>
                                    <Users size={16} /> Tim Redaksi
                                </summary>
                                <ul>
                                    {hasPermission('view penulis nasional') && (
                                        <li>
                                            <Link href={route('admin.nasional.writer.index')} className={linkClass(isActive('admin.nasional.writer.*'))}>
                                                <Pen size={16} /> Penulis
                                            </Link>
                                        </li>
                                    )}
                                    {hasPermission('view editor nasional') && (
                                        <li>
                                            <Link href={route('admin.nasional.editor.index')} className={linkClass(isActive('admin.nasional.editor.*'))}>
                                                <Edit size={16} /> Editor
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </details>
                        </li>
                    )}
                    {hasPermission('view ads nasional') && (
                        <li>
                            <Link href={route('admin.nasional.ads.index')} className={linkClass(isActive('admin.nasional.ads.*'))}>
                                <ImagesIcon size={16} /> Ads
                            </Link>
                        </li>
                    )}

                    {/* ================= 3. DAERAH ================= */}
                    <div className="divider my-1 bg-white/10 h-[1px]"></div>
                    <h2 className="menu-title text-emerald-400 uppercase text-xs tracking-wider">Daerah</h2>

                    {hasPermission('view news daerah') && (
                        <li>
                            <Link href={route('admin.daerah.news.index')} className={linkClass(isActive('admin.daerah.news.*'))}>
                                <Newspaper size={16} /> News Daerah
                            </Link>
                        </li>
                    )}
                    {hasPermission('view kanal daerah') && (
                        <li>
                            <Link href={route('admin.daerah.kanal.index')} className={linkClass(isActive('admin.daerah.kanal.*'))}>
                                <File size={16} /> Kanal Daerah
                            </Link>
                        </li>
                    )}
                    {hasPermission('view fokus daerah') && (
                        <li>
                            <Link href={route('admin.daerah.fokus.index')} className={linkClass(isActive('admin.daerah.fokus.*'))}>
                                <Clipboard size={16} /> Fokus Daerah
                            </Link>
                        </li>
                    )}

                    {/* Grup Tim Daerah */}
                    {hasPermission(["view penulis daerah", "view editor daerah"]) && (
                        <li>
                            <details open={isActive(['admin.daerah.writer.*', 'admin.daerah.editor.*'])}>
                                <summary className={linkClass(isActive(['admin.daerah.writer.*', 'admin.daerah.editor.*']))}>
                                    <Users size={16} /> Tim Redaksi
                                </summary>
                                <ul>
                                    {hasPermission('view penulis daerah') && (
                                        <li>
                                            <Link href={route('admin.daerah.writer.index')} className={linkClass(isActive('admin.daerah.writer.*'))}>
                                                <Pen size={16} /> Penulis
                                            </Link>
                                        </li>
                                    )}
                                    {hasPermission('view editor daerah') && (
                                        <li>
                                            <Link href={route('admin.daerah.editor.index')} className={linkClass(isActive('admin.daerah.editor.*'))}>
                                                <Edit size={16} /> Editor
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </details>
                        </li>
                    )}

                    {/* Grup Ekstra Daerah */}
                    {hasPermission('view network daerah') && (
                        <li>
                            <Link href={route('admin.daerah.network.index')} className={linkClass(isActive('admin.daerah.network.*'))}>
                                <Globe size={16} /> Network
                            </Link>
                        </li>
                    )}

                    {/* ADS Daerah */}
                    {hasPermission(["view ads daerah", "view ads daerah location"]) && (
                        <li>
                            <details open={isActive('admin.daerah.ads.*')}>
                                <summary className={linkClass(isActive('admin.daerah.ads.*'))}>
                                    <Images size={16} /> ADS Manager
                                </summary>
                                <ul>
                                    {hasPermission('view ads daerah location') && (
                                        <li>
                                            <Link href={route('admin.daerah.adsLocate.index')} className={linkClass(isActive('admin.daerah.ads.locate.*'))}>
                                                <MapPin size={16} /> Location
                                            </Link>
                                        </li>
                                    )}
                                    {hasPermission('view ads daerah') && (
                                        <li>
                                            <Link href={route('admin.daerah.ads.index')} className={linkClass(isActive('admin.daerah.ads.list.*'))}>
                                                <List size={16} /> Ads
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </details>
                        </li>
                    )}

                    {/* ================= 4. TOOLS & EXPORT ================= */}
                    <div className="divider my-1 bg-white/10 h-[1px]"></div>
                    <h2 className="menu-title text-white/50 uppercase text-xs tracking-wider">Tools & Export</h2>

                    <li>
                        <Link href={route('admin.ajp-export.create')} className={linkClass(false)}>
                            <FolderInput size={16} /> Export AJP
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}