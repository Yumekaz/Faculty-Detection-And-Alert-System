import { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
    type?: 'info' | 'warning' | 'error' | 'success';
    children: ReactNode;
    className?: string;
}

const alertStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
};

const alertIcons = {
    info: AlertCircle,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle,
};

export function Alert({ type = 'info', children, className }: AlertProps) {
    const Icon = alertIcons[type];

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-lg border',
                alertStyles[type],
                className
            )}
        >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">{children}</div>
        </div>
    );
}
