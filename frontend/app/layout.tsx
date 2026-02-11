import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
    title: 'FPDA System - Faculty Presence Detection & Attendance',
    description: 'Face recognition-based attendance system for educational institutions',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-slate-50 antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
