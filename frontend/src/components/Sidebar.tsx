"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, LogOut, CheckSquare, Settings } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const links = [
        { href: '/dashboard', label: 'My Tasks', icon: CheckSquare },
        // { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6">
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
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
