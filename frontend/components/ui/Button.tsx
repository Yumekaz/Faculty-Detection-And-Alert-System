'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'gradient' | 'outline' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
    children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant = 'primary',
        size = 'md',
        disabled,
        className,
        icon: Icon,
        iconPosition = 'left',
        loading = false,
        fullWidth = false,
        ...props
    }, ref) => {
        const variants = {
            primary: `
                bg-brand-600 text-white 
                hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30
                active:bg-brand-800
                shadow-md shadow-brand-500/20
            `,
            secondary: `
                bg-white text-slate-700 
                border border-slate-200 
                hover:bg-slate-50 hover:border-slate-300 hover:shadow-md
                active:bg-slate-100
            `,
            danger: `
                bg-rose-600 text-white 
                hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/30
                active:bg-rose-800
                shadow-md shadow-rose-500/20
            `,
            success: `
                bg-emerald-600 text-white 
                hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30
                active:bg-emerald-800
                shadow-md shadow-emerald-500/20
            `,
            ghost: `
                text-slate-600 
                hover:bg-slate-100 hover:text-slate-900
                active:bg-slate-200
            `,
            gradient: `
                bg-gradient-to-r from-brand-600 via-brand-500 to-accent-purple
                text-white
                hover:from-brand-700 hover:via-brand-600 hover:to-accent-purple/90
                hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5
                active:translate-y-0
                shadow-lg shadow-brand-500/25
            `,
            outline: `
                bg-transparent text-brand-600
                border-2 border-brand-600
                hover:bg-brand-50 hover:shadow-md
                active:bg-brand-100
            `,
            glass: `
                bg-white/10 backdrop-blur-md text-white
                border border-white/20
                hover:bg-white/20 hover:shadow-lg
                active:bg-white/30
            `,
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm gap-1.5',
            md: 'px-4 py-2.5 text-sm gap-2',
            lg: 'px-6 py-3 text-base gap-2.5',
            xl: 'px-8 py-4 text-lg gap-3',
        };

        const iconSizes = {
            sm: 'w-4 h-4',
            md: 'w-4 h-4',
            lg: 'w-5 h-5',
            xl: 'w-6 h-6',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center font-semibold rounded-xl',
                    'transition-all duration-200 ease-out',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none',
                    // Variant styles
                    variants[variant],
                    // Size styles
                    sizes[size],
                    // Width
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
                        {children}
                    </>
                ) : (
                    <>
                        {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
                        {children}
                        {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
