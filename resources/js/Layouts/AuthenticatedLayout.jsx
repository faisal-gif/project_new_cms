import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { Clipboard, Edit, File, FolderInput, Globe, History, ImageIcon, ImagesIcon, LayoutDashboard, Link2, List, MapPin, Menu, Newspaper, Pen, Settings, User } from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;


    return (
        <div className="drawer lg:drawer-open bg-base-300">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content overflow-x-auto">

                <div className="navbar bg-base-100 border-b border-base-300 px-4">
                    <div className="hidden md:flex-none">
                        <button className="btn btn-square btn-ghost">
                            <Menu size={20} />
                        </button>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost lg:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block h-6 w-6 stroke-current"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                ></path>
                            </svg>
                        </label>
                    </div>
                    <div className="flex-none">
                        <Dropdown
                            trigger={
                                <button className="btn btn-ghost flex items-center gap-2">
                                    <User size={20} />
                                    <span>{user.name}</span>
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
                                    </svg>
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
                <main className=''>{children}</main>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-[#343a40] min-h-full w-72 p-4 text-white">
                    <li>
                        <Link href="/">
                            <ApplicationLogo className="h-10 w-full mx-auto" />
                        </Link>
                    </li>

                    <li className='mt-10 mb-2'>
                        <Link href={route('dashboard')} className='py-2 hover:bg-blue-400'><LayoutDashboard size={16} className="me-1 inline-block" />Dashboard</Link>
                    </li>
                    <h2 className="menu-title text-white/70 text-[16px]">Admin</h2>
                    <li className='text-[14px]'>
                        <details>
                            <summary className='hover:bg-blue-400'>
                                <Settings size={16} className="me-1 inline-block" />
                                Master
                            </summary>
                            <ul>
                                <li><Link href={route('admin.users.index')} className='py-2 hover:bg-blue-400'><User size={16} className="me-1 inline-block" /> User</Link></li>
                                <li><Link href={route('admin.kanal.index')} className='py-2 hover:bg-blue-400'><File size={16} className="me-1 inline-block" />Kanal</Link></li>
                                <li><Link href={route('admin.network.index')} className='py-2 hover:bg-blue-400'><Globe size={16} className="me-1 inline-block" /> Network</Link></li>
                                <li><Link className='py-2 hover:bg-blue-400'><Link2 size={16} className="me-1 inline-block" />Source</Link></li>
                                <li><Link className='py-2 hover:bg-blue-400'><History size={16} className="me-1 inline-block" />History</Link></li>
                            </ul>
                        </details>
                    </li>

                    <h2 className="menu-title text-[16px] text-white/70">Editor & Writer</h2>
                    <li className='text-[14px]'>
                        <details>
                            <summary className='hover:bg-blue-400'>
                                <File size={16} className="me-1 inline-block" />
                                News
                            </summary>
                            <ul>
                                <li><Link className='py-2 hover:bg-blue-400'><Newspaper size={16} className="me-1 inline-block" />News</Link></li>
                                <li><Link className='py-2 hover:bg-blue-400'><Clipboard size={16} className="me-1 inline-block" />Focus</Link></li>
                                <li><Link className='py-2 hover:bg-blue-400'><Pen size={16} className="me-1 inline-block" />Writer</Link></li>
                                <li><Link className='py-2 hover:bg-blue-400'><Edit size={16} className="me-1 inline-block" />Editor</Link></li>
                            </ul>
                        </details>
                    </li>

                    <h2 className="menu-title text-[16px] text-white/70">ADS</h2>
                    <li className='text-[14px]'>
                        <details>
                            <summary className='hover:bg-blue-400'>
                                <ImagesIcon size={16} className="me-1 inline-block" />
                                ADS
                            </summary>
                            <ul>
                                <li><Link className='py-2 hover:bg-blue-400'><ImageIcon size={16} className="me-1 inline-block" />ADS TI</Link></li>
                                <li>
                                    <details>
                                        <summary className='hover:bg-blue-400'>
                                            <ImageIcon size={16} className="me-1 inline-block" />ADS Daerah
                                        </summary>
                                        <ul>
                                            <li><Link className='py-2 hover:bg-blue-400'><MapPin size={16} className="me-1 inline-block" />ADS Location</Link></li>
                                            <li><Link className='py-2 hover:bg-blue-400'><List size={16} className="me-1 inline-block" />ADS List</Link></li>
                                        </ul>
                                    </details>

                                </li>
                            </ul>
                        </details>
                    </li>

                    <h2 className="menu-title text-[16px] text-white/70">AJP</h2>
                    <li><Link className='text-[14px] py-2 hover:bg-blue-400'><FolderInput size={16} className="me-1 inline-block" />Export AJP</Link></li>
                </ul>
            </div>
        </div>
    );
}
