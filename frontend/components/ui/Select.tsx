'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    options: SelectOption[];
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options = [], placeholder, required, className, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-slate-700">
                        {label}
                        {required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            'w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg',
                            'text-slate-900 appearance-none cursor-pointer',
                            'focus:outline-none focus:ring-2 focus:ring-slate-500',
                            className
                        )}
                        {...props}
                    >
                        {placeholder && <option value="">{placeholder}</option>}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
