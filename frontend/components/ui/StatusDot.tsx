import { cn } from '@/lib/utils';

interface StatusDotProps {
    status: 'online' | 'offline' | 'pending' | 'present' | 'absent';
    className?: string;
}

const colors = {
    online: 'bg-emerald-500',
    offline: 'bg-rose-500',
    pending: 'bg-amber-500',
    present: 'bg-emerald-500',
    absent: 'bg-rose-500',
};

export function StatusDot({ status, className }: StatusDotProps) {
    return (
        <span className={cn('relative flex h-2.5 w-2.5', className)}>
            <span
                className={cn(
                    'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                    colors[status]
                )}
            />
            <span
                className={cn(
                    'relative inline-flex rounded-full h-2.5 w-2.5',
                    colors[status]
                )}
            />
        </span>
    );
}
