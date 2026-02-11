import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gradient';
    subtitle?: string;
    loading?: boolean;
    onClick?: () => void;
}

const iconVariants = {
    default: 'bg-slate-100 text-slate-600 ring-slate-200',
    success: 'bg-emerald-100 text-emerald-600 ring-emerald-200',
    warning: 'bg-amber-100 text-amber-600 ring-amber-200',
    danger: 'bg-rose-100 text-rose-600 ring-rose-200',
    info: 'bg-brand-100 text-brand-600 ring-brand-200',
    purple: 'bg-purple-100 text-purple-600 ring-purple-200',
    gradient: 'bg-gradient-to-br from-brand-500 to-accent-purple text-white ring-brand-300',
};

const trendColors = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-rose-600 bg-rose-50',
    neutral: 'text-slate-600 bg-slate-50',
};

const trendIcons = {
    up: ArrowUpRight,
    down: ArrowDownRight,
    neutral: Minus,
};

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    variant = 'default',
    subtitle,
    loading = false,
    onClick,
}: StatCardProps) {
    const TrendIcon = trend ? trendIcons[trend] : null;

    if (loading) {
        return (
            <Card className="animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                        <div className="h-8 w-16 bg-slate-200 rounded" />
                    </div>
                    <div className="h-12 w-12 bg-slate-200 rounded-xl" />
                </div>
            </Card>
        );
    }

    return (
        <Card 
            className={cn(
                'group transition-all duration-300',
                onClick && 'cursor-pointer hover:-translate-y-1 hover:shadow-card-hover'
            )}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-500 group-hover:text-slate-600 transition-colors">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                        {value}
                    </p>
                    
                    {/* Trend indicator */}
                    {trend && trendValue && (
                        <div className="flex items-center gap-1.5 mt-3">
                            <span className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                trendColors[trend]
                            )}>
                                {TrendIcon && <TrendIcon className="w-3 h-3" />}
                                {trendValue}
                            </span>
                        </div>
                    )}
                    
                    {/* Subtitle */}
                    {subtitle && (
                        <p className="text-xs text-slate-400 mt-2">
                            {subtitle}
                        </p>
                    )}
                </div>
                
                {/* Icon */}
                <div className={cn(
                    'p-3 rounded-xl ring-1 ring-offset-2 transition-all duration-300',
                    'group-hover:scale-110 group-hover:shadow-lg',
                    iconVariants[variant]
                )}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </Card>
    );
}

// Compact Stat Card for smaller spaces
interface CompactStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function CompactStatCard({
    title,
    value,
    icon: Icon,
    change,
    changeType = 'neutral',
    variant = 'default',
}: CompactStatCardProps) {
    const changeColors = {
        positive: 'text-emerald-600',
        negative: 'text-rose-600',
        neutral: 'text-slate-500',
    };

    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn(
                'p-2.5 rounded-lg',
                iconVariants[variant]
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <p className="text-lg font-bold text-slate-900">{value}</p>
            </div>
            {change && (
                <span className={cn('text-xs font-medium', changeColors[changeType])}>
                    {change}
                </span>
            )}
        </div>
    );
}
