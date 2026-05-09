import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

/**
 * Tiny status pill. Purposely opinionated: tone maps to a fixed set of
 * meanings, so a green Badge ALWAYS means "good/open" and never gets
 * repurposed for "info."
 */
const badgeStyles = cva(
    [
        'inline-flex items-center gap-1 rounded-full',
        'font-semibold uppercase tracking-wider',
        'whitespace-nowrap select-none',
        'utsa-tabular'
    ],
    {
        variants: {
            tone: {
                neutral: 'bg-[--surface-muted] text-[--ink-muted] border border-[--border-default]',
                brand: 'bg-[--brand-soft] text-[--brand-default]',
                accent: 'bg-[--accent-soft] text-[--accent-active]',
                open: 'bg-[--status-open-soft] text-[--status-open]',
                warn: 'bg-[--status-warn-soft] text-[--status-warn]',
                danger: 'bg-[--status-danger-soft] text-[--status-danger]',
                info: 'bg-[--status-info-soft] text-[--status-info]'
            },
            size: {
                sm: 'h-5 px-2 text-[9px]',
                md: 'h-6 px-2.5 text-[10px]'
            },
            withDot: {
                true: '',
                false: ''
            }
        },
        defaultVariants: { tone: 'neutral', size: 'sm', withDot: false }
    }
);

export interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {
    /** Show a colored dot before the label (live indicator). */
    withDot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, tone, size, withDot = false, children, ...props }, ref) => (
        <span ref={ref} className={cn(badgeStyles({ tone, size, withDot }), className)} {...props}>
            {withDot && <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-current" />}
            {children}
        </span>
    )
);
Badge.displayName = 'Badge';
