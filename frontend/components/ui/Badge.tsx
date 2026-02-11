import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    dot?: boolean;
    pulse?: boolean;
}

const variants = {
    default: 'bg-slate-100 text-slate-700 ring-slate-200',
    success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-100 text-amber-700 ring-amber-200',
    danger: 'bg-rose-100 text-rose-700 ring-rose-200',
    info: 'bg-brand-100 text-brand-700 ring-brand-200',
    purple: 'bg-purple-100 text-purple-700 ring-purple-200',
    pink: 'bg-pink-100 text-pink-700 ring-pink-200',
    gradient: 'bg-gradient-to-r from-brand-500 to-accent-purple text-white ring-brand-300',
};

const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
};

export function Badge({ 
    children, 
    variant = 'default', 
    size = 'md', 
    className,
    dot = false,
    pulse = false,
}: BadgeProps) {
    const showDot = dot || pulse;
    const isGradient = variant === 'gradient';
    
    return (
        <span
            className={cn(
                'inline-flex items-center font-semibold rounded-full ring-1 ring-inset',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {showDot && (
                <span 
                    className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isGradient ? 'bg-white' : 'bg-current',
                        pulse && 'animate-pulse'
                    )} 
                />
            )}
            {children}
        </span>
    );
}

// Status Badge with animated dot
interface StatusBadgeProps {
    status: 'online' | 'offline' | 'away' | 'busy';
    label?: string;
    size?: 'sm' | 'md';
}

const statusConfig = {
    online: { 
        dot: 'bg-emerald-500', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700',
        ring: 'ring-emerald-200',
        label: 'Online' 
    },
    offline: { 
        dot: 'bg-slate-400', 
        bg: 'bg-slate-50', 
        text: 'text-slate-600',
        ring: 'ring-slate-200',
        label: 'Offline' 
    },
    away: { 
        dot: 'bg-amber-500', 
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        ring: 'ring-amber-200',
        label: 'Away' 
    },
    busy: { 
        dot: 'bg-rose-500', 
        bg: 'bg-rose-50', 
        text: 'text-rose-700',
        ring: 'ring-rose-200',
        label: 'Busy' 
    },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
    const config = statusConfig[status];
    
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ring-inset',
            config.bg,
            config.text,
            config.ring,
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        )}>
            <span className={cn(
                'relative flex h-2 w-2',
                status === 'online' && 'status-dot status-dot-success'
            )}>
                <span className={cn(
                    'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                    config.dot
                )} />
                <span className={cn(
                    'relative inline-flex rounded-full h-2 w-2',
                    config.dot
                )} />
            </span>
            {label || config.label}
        </span>
    );
}

// Role Badge
interface RoleBadgeProps {
    role: 'admin' | 'director' | 'hod' | 'faculty';
}

const ROLE_CONFIG = {
    admin: { 
        label: 'System Admin', 
        gradient: 'from-rose-500 to-rose-600',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        ring: 'ring-rose-200',
        dot: 'bg-rose-500'
    },
    director: { 
        label: 'Director', 
        gradient: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        ring: 'ring-violet-200',
        dot: 'bg-violet-500'
    },
    hod: { 
        label: 'Head of Department', 
        gradient: 'from-brand-500 to-brand-600',
        bg: 'bg-brand-50',
        text: 'text-brand-700',
        ring: 'ring-brand-200',
        dot: 'bg-brand-500'
    },
    faculty: { 
        label: 'Faculty', 
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        ring: 'ring-emerald-200',
        dot: 'bg-emerald-500'
    },
};

export function RoleBadge({ role }: RoleBadgeProps) {
    const config = ROLE_CONFIG[role];

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ring-1 ring-inset',
                config.bg,
                config.text,
                config.ring
            )}
        >
            <span className={cn('w-2 h-2 rounded-full', config.dot)} />
            {config.label}
        </div>
    );
}

// Count Badge - for notifications/counts
interface CountBadgeProps {
    count: number;
    max?: number;
    variant?: 'default' | 'danger' | 'primary';
}

export function CountBadge({ count, max = 99, variant = 'danger' }: CountBadgeProps) {
    const displayCount = count > max ? `${max}+` : count;
    
    const variantStyles = {
        default: 'bg-slate-500',
        danger: 'bg-rose-500',
        primary: 'bg-brand-500',
    };

    if (count <= 0) return null;

    return (
        <span className={cn(
            'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1',
            'text-[10px] font-bold text-white rounded-full',
            variantStyles[variant]
        )}>
            {displayCount}
        </span>
    );
}
