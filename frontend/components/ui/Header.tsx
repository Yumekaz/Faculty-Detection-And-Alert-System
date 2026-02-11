import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactElement;
    action?: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const titleSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
};

export function Header({ 
    title, 
    subtitle, 
    icon, 
    action, 
    className,
    size = 'md' 
}: HeaderProps) {
    return (
        <div className={cn('mb-8', className)}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600">
                                {icon}
                            </div>
                        )}
                        <h1 className={cn(
                            'font-bold text-slate-900 tracking-tight',
                            titleSizes[size]
                        )}>
                            {title}
                        </h1>
                    </div>
                    {subtitle && (
                        <p className="text-slate-500 mt-1 text-sm">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}
            </div>
            
            {/* Decorative gradient line */}
            <div className="mt-4 h-px bg-gradient-to-r from-brand-200 via-brand-100 to-transparent" />
        </div>
    );
}

// Page Header with Breadcrumbs
interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    action?: ReactNode;
    className?: string;
}

export function PageHeader({ title, breadcrumbs, action, className }: PageHeaderProps) {
    return (
        <div className={cn('mb-8', className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    {breadcrumbs.map((item, index) => (
                        <span key={index} className="flex items-center gap-2">
                            {index > 0 && <span className="text-slate-300">/</span>}
                            {item.href ? (
                                <a 
                                    href={item.href} 
                                    className="hover:text-brand-600 transition-colors"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <span className="text-slate-900 font-medium">{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {title}
                </h1>
                {action && <div>{action}</div>}
            </div>
        </div>
    );
}

// Section Header for dividing content
interface SectionHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
            <div>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                {description && (
                    <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
