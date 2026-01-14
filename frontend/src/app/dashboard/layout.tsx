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
            <main className="ml-64 min-h-screen">
                <div className="max-w-5xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
