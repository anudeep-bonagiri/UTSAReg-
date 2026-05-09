import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose class names with conflict-resolution.
 * `clsx` handles conditionals; `twMerge` resolves Tailwind conflicts so
 * `cn("p-2", flag && "p-4")` collapses to "p-4" when flag is truthy.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
