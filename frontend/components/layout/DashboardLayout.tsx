'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50/80 bg-grid">
            <Sidebar />
            <main className="ml-72 p-8">
                <div className="max-w-7xl mx-auto animate-fade-in-up">
                    {children}
                </div>
            </main>
        </div>
    );
}
