import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'glass' | 'gradient' | 'bordered' | 'elevated';
    hover?: boolean;
    onClick?: () => void;
}

const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

const cardVariants = {
    default: `
        bg-white border border-slate-200/60
        shadow-sm shadow-slate-200/50
    `,
    glass: `
        bg-white/80 backdrop-blur-xl 
        border border-white/40
        shadow-glass
    `,
    gradient: `
        bg-gradient-to-br from-white to-slate-50
        border border-slate-200/60
        shadow-lg shadow-slate-200/50
    `,
    bordered: `
        bg-white
        border-2 border-slate-100
        hover:border-brand-200
    `,
    elevated: `
        bg-white
        shadow-lg shadow-slate-200/60
        border border-slate-100
    `,
};

export function Card({ 
    children, 
    className, 
    padding = 'md', 
    variant = 'default',
    hover = false,
    onClick 
}: CardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                // Base styles
                'rounded-2xl transition-all duration-300',
                // Variant styles
                cardVariants[variant],
                // Padding
                paddingSizes[padding],
                // Hover effects
                hover && 'cursor-pointer hover:-translate-y-1 hover:shadow-card-hover',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}

// Card Header Component
interface CardHeaderProps {
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
    return (
        <div className={cn('flex items-center justify-between mb-4', className)}>
            <div className="flex-1">{children}</div>
            {action && <div className="ml-4">{action}</div>}
        </div>
    );
}

// Card Title Component
interface CardTitleProps {
    children: ReactNode;
    className?: string;
    icon?: React.ReactElement;
}

export function CardTitle({ children, className, icon }: CardTitleProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {icon && <span className="text-brand-500">{icon}</span>}
            <h3 className="text-lg font-bold text-slate-900">{children}</h3>
        </div>
    );
}

// Card Description Component
interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p className={cn('text-sm text-slate-500 mt-1', className)}>
            {children}
        </p>
    );
}

// Card Content Component
interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return <div className={cn('', className)}>{children}</div>;
}

// Card Footer Component
interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={cn('mt-6 pt-4 border-t border-slate-100', className)}>
            {children}
        </div>
    );
}
