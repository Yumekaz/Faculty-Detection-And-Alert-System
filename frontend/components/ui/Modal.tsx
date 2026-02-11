'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div className={cn('relative bg-white rounded-2xl shadow-2xl w-full', sizes[size])}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
