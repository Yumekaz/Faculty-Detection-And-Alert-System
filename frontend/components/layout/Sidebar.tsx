'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    Activity,
    FileText,
    Bell,
    LogOut,
    GraduationCap,
    User,
    Camera,
    Play,
    ClipboardCheck,
    LucideIcon,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { ROLES, Role } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { RoleBadge, StatusBadge } from '@/components/ui/Badge';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
}

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    active: boolean;
    href: string;
}

function SidebarItem({ icon: Icon, label, active, href }: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
        >
            <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'
            )}>
                <Icon className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    active ? '' : 'group-hover:scale-110'
                )} />
            </div>
            <span className="flex-1 text-left">{label}</span>
            {active && (
                <ChevronRight className="w-4 h-4 opacity-60" />
            )}
        </Link>
    );
}

// Navigation items per role with actual routes
const NAV_ITEMS: Record<Role, NavItem[]> = {
    [ROLES.ADMIN]: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'faculty', label: 'Faculty Management', icon: Users, href: '/dashboard/faculty' },
        { id: 'schedules', label: 'Schedules', icon: Calendar, href: '/dashboard/schedules' },
        { id: 'cameras', label: 'Cameras', icon: Camera, href: '/dashboard/cameras' },
        { id: 'corrections', label: 'Corrections', icon: ClipboardCheck, href: '/dashboard/corrections' },
        { id: 'settings', label: 'Configuration', icon: Settings, href: '/dashboard/settings' },
        { id: 'health', label: 'System Health', icon: Activity, href: '/dashboard/health' },
        { id: 'logs', label: 'System Logs', icon: FileText, href: '/dashboard/logs' },
        { id: 'audit', label: 'Audit Trail', icon: FileText, href: '/dashboard/audit' },
        { id: 'test', label: 'System Test', icon: Play, href: '/dashboard/test' },
    ],
    [ROLES.DIRECTOR]: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'alerts', label: 'Alerts', icon: Bell, href: '/dashboard/alerts' },
        { id: 'corrections', label: 'Corrections', icon: ClipboardCheck, href: '/dashboard/corrections' },
        { id: 'logs', label: 'Reports', icon: FileText, href: '/dashboard/logs' },
    ],
    [ROLES.HOD]: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'faculty', label: 'Faculty Attendance', icon: Users, href: '/dashboard/faculty' },
        { id: 'logs', label: 'Attendance Logs', icon: FileText, href: '/dashboard/logs' },
        { id: 'alerts', label: 'Alerts', icon: Bell, href: '/dashboard/alerts' },
        { id: 'corrections', label: 'Corrections', icon: ClipboardCheck, href: '/dashboard/corrections' },
    ],
    [ROLES.FACULTY]: [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'logs', label: 'My Attendance', icon: Calendar, href: '/dashboard/logs' },
        { id: 'alerts', label: 'My Alerts', icon: Bell, href: '/dashboard/alerts' },
        { id: 'corrections', label: 'Corrections', icon: ClipboardCheck, href: '/dashboard/corrections' },
    ],
};

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    if (!user) return null;

    const navItems = NAV_ITEMS[user.role] || [];

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200/80 flex flex-col z-40 shadow-xl shadow-slate-200/50">
            {/* Logo */}
            <div className="p-5 border-b border-slate-100">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="w-11 h-11 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-purple rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/40 transition-shadow">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-sm tracking-tight">FPDA System</h1>
                        <p className="text-xs text-slate-500">Face Recognition</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
                {/* Section Label */}
                <div className="px-3 mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Menu
                    </span>
                </div>

                {navItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={pathname === item.href}
                        href={item.href}
                    />
                ))}


            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <RoleBadge role={user.role} />
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    icon={LogOut}
                    onClick={handleLogout}
                >
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
