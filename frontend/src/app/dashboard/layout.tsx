import React from 'react';
import Sidebar from '@/components/Sidebar';
import '../globals.css'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            {/* Main content: no margin on mobile, ml-64 on desktop */}
            <main className="min-h-screen lg:ml-64">
                {/* Add top padding on mobile for the fixed header */}
                <div className="max-w-5xl mx-auto p-4 pt-20 lg:p-8 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
