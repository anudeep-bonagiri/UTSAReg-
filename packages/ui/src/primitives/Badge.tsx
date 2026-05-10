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
                neutral:
                    'bg-[var(--surface-muted)] text-[var(--ink-muted)] border border-[var(--border-default)]',
                brand: 'bg-[var(--brand-soft)] text-[var(--brand-default)]',
                accent: 'bg-[var(--accent-soft)] text-[var(--accent-active)]',
                open: 'bg-[var(--status-open-soft)] text-[var(--status-open)]',
                warn: 'bg-[var(--status-warn-soft)] text-[var(--status-warn)]',
                danger: 'bg-[var(--status-danger-soft)] text-[var(--status-danger)]',
                info: 'bg-[var(--status-info-soft)] text-[var(--status-info)]'
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
