import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    });
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
