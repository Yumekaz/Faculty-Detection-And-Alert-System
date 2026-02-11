'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
    helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon: Icon, required, disabled, className, error, helper, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);

        return (
            <div className="space-y-1.5">
                {label && (
                    <label className={cn(
                        "block text-sm font-medium transition-colors",
                        isFocused ? 'text-brand-600' : 'text-slate-700',
                        error && 'text-rose-500'
                    )}>
                        {label}
                        {required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative group">
                    {Icon && (
                        <div className={cn(
                            "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors",
                            isFocused ? 'text-brand-500' : 'text-slate-400',
                            error && 'text-rose-400'
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                    <input
                        ref={ref}
                        disabled={disabled}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        className={cn(
                            // Base styles
                            'w-full bg-slate-50 border-2 rounded-xl',
                            'text-slate-900 placeholder-slate-400',
                            'transition-all duration-200 outline-none',
                            // Focus styles
                            'focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
                            // Hover styles
                            'hover:border-slate-300',
                            // Icon padding
                            Icon && 'pl-11',
                            // Error styles
                            error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10',
                            // Disabled styles
                            disabled && 'bg-slate-100 text-slate-500 cursor-not-allowed',
                            // Padding
                            'py-3 pr-4',
                            !Icon && 'pl-4',
                            className
                        )}
                        {...props}
                    />
                    {/* Focus indicator line */}
                    <div className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-brand-500 transition-all duration-300 rounded-full",
                        isFocused ? 'w-full' : 'w-0'
                    )} />
                </div>
                {error && <p className="text-sm text-rose-500 animate-fade-in">{error}</p>}
                {helper && !error && <p className="text-sm text-slate-500">{helper}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
