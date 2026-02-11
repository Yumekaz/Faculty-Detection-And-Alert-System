'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, required, disabled, className, error, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-slate-700">
                        {label}
                        {required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    disabled={disabled}
                    className={cn(
                        'w-full min-h-[120px] px-4 py-2.5 bg-white border border-slate-300 rounded-lg',
                        'text-slate-900 placeholder-slate-400 transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
                        disabled && 'bg-slate-50 text-slate-500',
                        error && 'border-rose-500 focus:ring-rose-500',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-sm text-rose-500">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
