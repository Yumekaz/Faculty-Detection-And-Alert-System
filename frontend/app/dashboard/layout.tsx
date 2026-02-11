'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, [user, router]);

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full" />
            </div>
        );
    }

    return <>{children}</>;
}
