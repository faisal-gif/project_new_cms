import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Badge } from '@/Components/ui/badge';
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
    BarChart3,    // <-- TAMBAHAN: Icon untuk menu Laporan/Report
    Globe2Icon,
    User2Icon,
    Blocks,
    Banknote,
    Megaphone,
    Package
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

    const handleMarkAsRead = (id) => {
        router.post(route('admin.notifications.read', id), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // TAMBAHAN: Langsung saring dan buang notifikasi yang dibaca dari layar
                setNotifications((prev) => prev.filter((notif) => notif.id !== id));
            }
        });
    };

    const handleNotificatiGo = (id) => {
        // Gunakan router.get bawaan Inertia untuk menembak route 'notifications.go'
        router.get(route('notifications.go', id), {}, {
            preserveScroll: true,
            // Kita tidak perlu memikirkan state dropdown karena kita akan pindah halaman
        });
    };

    useEffect(() => {
        setNotifications(auth.notifications || []);
    }, [auth.notifications]);

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
                            url: notification.url,
                            is_download: notification.is_download || false // <-- Pastikan properti ini ada, default false
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

                        {/* ================= LONCENG NOTIFIKASI (SHADCN UI) ================= */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                {/* Tombol Trigger (Bisa pakai class daisyUI yang sudah ada) */}
                                <button className="btn btn-ghost btn-circle relative focus:outline-none">
                                    <div className="indicator">
                                        <Bell size={20} />
                                        {notifications.length > 0 && (
                                            <Badge className="indicator-item text-white border-none shadow-sm">
                                                {notifications.length}
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                sideOffset={8}
                                className="w-[calc(100vw-2rem)] sm:w-80 p-0 mx-2 z-[100]"
                            >
                                {/* Header Dropdown Notifikasi */}
                                <div className="flex flex-row items-center justify-between px-4 py-3 bg-gray-50/50 rounded-t-md">
                                    <span className="text-gray-900 font-bold text-sm">Notifikasi Anda</span>

                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearNotifications}
                                            className="text-[10px] text-red-500 hover:text-red-700 hover:bg-red-100 bg-red-50 px-2 py-1 rounded-md cursor-pointer uppercase tracking-wider font-bold transition"
                                        >
                                            Bersihkan
                                        </button>
                                    )}
                                </div>

                                {/* Isi List Notifikasi dengan Scrollbar */}
                                <div className="max-h-96 overflow-y-auto p-1">
                                    {notifications.length === 0 ? (
                                        <div className="text-gray-500 text-center py-8 text-sm">
                                            Belum ada notifikasi baru
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <DropdownMenuItem
                                                key={notif.id}
                                                asChild
                                                className="mb-1 cursor-pointer focus:bg-transparent"
                                            >
                                                {notif.data.is_download ? (
                                                    /* =========================================================
                                                       1. LOGIKA UNTUK EXCEL (Gunakan tag <a> standar + onClick)
                                                       ========================================================= */
                                                    <a
                                                        href={notif.data.url}
                                                        download
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="flex flex-col items-start gap-1 p-3 hover:bg-green-50 outline-none rounded-md transition duration-200"
                                                    >
                                                        <span className="font-bold text-success text-sm">{notif.data.title}</span>
                                                        <span className="text-xs text-gray-600 whitespace-normal line-clamp-2">
                                                            {notif.data.message}
                                                        </span>
                                                        <span className="text-xs font-semibold text-green-600 mt-1 flex items-center gap-1">
                                                            ⬇️ Klik untuk mengunduh Excel
                                                        </span>
                                                    </a>
                                                ) : (
                                                    /* =========================================================
                                                       2. LOGIKA UNTUK BERITA BARU (Gunakan <Link> ke rute /go)
                                                       ========================================================= */
                                                    <Link
                                                        href={route('admin.notifications.go', notif.id)}
                                                        className="flex flex-col items-start gap-1 p-3 hover:bg-blue-50 outline-none rounded-md transition duration-200"
                                                    >
                                                        <span className="font-bold text-primary text-sm">{notif.data.title}</span>
                                                        <span className="text-xs text-gray-600 whitespace-normal line-clamp-2">
                                                            {notif.data.message}
                                                        </span>
                                                        <span className="text-xs font-semibold text-blue-500 mt-1 flex items-center gap-1">
                                                            👁️ Tinjau Berita Sekarang
                                                        </span>
                                                    </Link>
                                                )}
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {/* ======================================================================= */}

                        {/* ================= MENU PROFIL USER (SHADCN UI) ================= */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="btn btn-ghost btn-circle relative focus:outline-none">
                                    <User size={20} />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56 mt-1 z-[100]">
                                {/* Opsional: Header menu kecil agar terlihat lebih profesional */}
                                <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Akun Saya
                                </div>



                                {/* <DropdownMenuItem asChild className="cursor-pointer py-2">
                                    <Link href={route('profile.edit')} className="w-full flex items-center">
                                        Profile
                                    </Link>
                                </DropdownMenuItem> */}

                                <DropdownMenuItem asChild className="cursor-pointer py-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <Link href={route('logout')} method="post" as="button" className="w-full flex items-center">
                                        Log Out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {/* ================================================================ */}
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
                    {hasPermission('view history') && (
                        <li>
                            <Link href={route('admin.history.index')} className={linkClass(isActive('admin.history.*'))}>
                                <History size={16} /> System History
                            </Link>
                        </li>
                    )}

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

                    {hasPermission('view page static nasional') && (
                        <li>
                            <Link href={route('admin.nasional.page-static.index')} className={linkClass(isActive('admin.nasional.page-static.*'))}>
                                <Globe2Icon size={16} /> Page Static
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

                    <>
                        <div className="divider my-1 bg-white/10 h-[1px]"></div>
                        <h2 className="menu-title text-yellow-300/50 uppercase text-xs tracking-wider">AJP</h2>
                        {hasPermission(['view member ajp']) && (
                            <li>
                                <Link href={route('admin.ajp.writer.index')} className={linkClass(isActive('admin.ajp.writer.*'))}>
                                    <User2Icon size={16} /> Member AJP
                                </Link>
                            </li>
                        )}
                        {hasPermission(['view news ajp']) && (
                            <li>
                                <Link href={route('admin.ajp.news.index')} className={linkClass(isActive('admin.ajp.news.*'))}>
                                    <Newspaper size={16} /> News AJP
                                </Link>
                            </li>
                        )}
                        {hasPermission(['view transaction ajp']) && (
                            <li>
                                <Link href={route('admin.ajp.transaction.index')} className={linkClass(isActive('admin.ajp.news.*'))}>
                                    <Banknote size={16} /> Transaksi AJP
                                </Link>
                            </li>
                        )}
                    </>


                    <>
                        <div className="divider my-1 bg-white/10 h-[1px]"></div>
                        <h2 className="menu-title text-yellow-300/50 uppercase text-xs tracking-wider">Kopi Times</h2>

                        {hasPermission(['view pengumuman kopi-times']) && (
                            <li>
                                <Link href={route('admin.kopi-times.pengumuman.index')} className={linkClass(isActive('admin.kopi-times.pengumuman.*'))}>
                                    <Megaphone size={16} /> Pengumuman Kopi Times
                                </Link>
                            </li>
                        )}

                        {hasPermission(['view member kopi-times']) && (
                            <li>
                                <Link href={route('admin.kopi-times.writer.index')} className={linkClass(isActive('admin.kopi-times.writer.*'))}>
                                    <User2Icon size={16} /> Member Kopi Times
                                </Link>
                            </li>
                        )}

                        {hasPermission(['view paket kopi-times']) && (
                            <li>
                                <Link href={route('admin.kopi-times.paket.index')} className={linkClass(isActive('admin.kopi-times.paket.*'))}>
                                    <Package size={16} /> Paket Kopi Times
                                </Link>
                            </li>
                        )}

                        {hasPermission(['view news kopi-times']) && (
                            <li>
                                <Link href={route('admin.kopi-times.news.index')} className={linkClass(isActive('admin.kopi-times.news.*'))}>
                                    <Newspaper size={16} /> News Kopi Times
                                </Link>
                            </li>
                        )}

                        {hasPermission(['view addon-requests kopi-times']) && (
                            <li>
                                <Link href={route('admin.kopi-times.addon-requests.index')} className={linkClass(isActive('admin.kopi-times.addon-requests.*'))}>
                                    <Blocks size={16} /> Addon Request Kopi Times
                                </Link>
                            </li>
                        )}

                        {hasPermission(['view merchandise kopi-times']) && (
                            <li>
                                <Link href={route('admin.kopi-times.shipments.index')} className={linkClass(isActive('admin.kopi-times.addon-requests.*'))}>
                                    <Package size={16} /> Merchandise Kopi Times
                                </Link>
                            </li>
                        )}

                        {hasPermission(['view transaction kopi-times']) && (
                            <li>
                                <Link href={route('admin.kopi-times.transaction.index')} className={linkClass(isActive('admin.kopi-times.transaction.*'))}>
                                    <Banknote size={16} /> Transaksi Kopi Times
                                </Link>
                            </li>
                        )}
                    </>


                    {/* ================= 4. TOOLS & EXPORT ================= */}
                    {hasPermission(['export ajp']) && (
                        <>
                            <div className="divider my-1 bg-white/10 h-[1px]"></div>
                            <h2 className="menu-title text-white/50 uppercase text-xs tracking-wider">Tools & Export</h2>

                            <li>
                                <Link href={route('admin.ajp-export.create')} className={linkClass(false)}>
                                    <FolderInput size={16} /> Export AJP
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
}