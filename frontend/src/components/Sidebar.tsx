"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, LogOut, CheckSquare, MessageSquare, Menu, X } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: '/dashboard', label: 'My Tasks', icon: CheckSquare },
        { href: '/dashboard/chat', label: 'AI Chat', icon: MessageSquare },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-indigo-500" />
                    Taskora
                </h1>
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Desktop Logo */}
                <div className="p-6 hidden lg:block">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="w-8 h-8 text-indigo-500" />
                        Taskora
                    </h1>
                </div>

                {/* Mobile: Add padding top for header */}
                <div className="p-6 lg:hidden">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="w-8 h-8 text-indigo-500" />
                        Taskora
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); closeSidebar(); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
