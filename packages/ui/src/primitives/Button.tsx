import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

/**
 * The single Button primitive every CTA in the app should use.
 *
 * Variants encode role, not color: callers pick "primary" / "secondary" /
 * "ghost" / "destructive" — they never reach for color tokens directly. This
 * keeps the visual hierarchy consistent: only ONE primary on a screen, etc.
 */
const buttonStyles = cva(
    [
        'inline-flex items-center justify-center gap-2',
        'rounded-[8px] font-semibold whitespace-nowrap',
        'transition-[background-color,box-shadow,transform] duration-[120ms] ease-out',
        'select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-canvas)]',
        // SVG icons inside take their color from the button text.
        '[&>svg]:shrink-0 [&>svg]:[stroke-width:2.25]'
    ],
    {
        variants: {
            variant: {
                primary: [
                    'bg-[var(--accent-default)] text-[var(--ink-on-accent)]',
                    'hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)]',
                    'shadow-[0_1px_2px_0_rgba(241,90,34,0.25)]',
                    'active:translate-y-[1px]'
                ],
                secondary: [
                    'bg-[var(--brand-default)] text-[var(--ink-on-brand)]',
                    'hover:bg-[var(--brand-hover)] active:bg-[var(--brand-default)]',
                    'active:translate-y-[1px]'
                ],
                outline: [
                    'bg-[var(--surface-default)] text-[var(--ink-strong)]',
                    'border border-[var(--border-strong)]',
                    'hover:bg-[var(--surface-muted)]'
                ],
                ghost: [
                    'bg-transparent text-[var(--ink-default)]',
                    'hover:bg-[var(--surface-muted)]'
                ],
                destructive: [
                    'bg-[var(--status-danger)] text-white',
                    'hover:opacity-90 active:opacity-80'
                ],
                link: [
                    'bg-transparent text-[var(--accent-default)] underline-offset-4',
                    'hover:underline px-0 py-0'
                ]
            },
            size: {
                sm: 'h-8 px-3 text-[12px]',
                md: 'h-10 px-4 text-[13px]',
                lg: 'h-12 px-5 text-[14px]',
                icon: 'h-9 w-9 p-0'
            },
            full: {
                true: 'w-full',
                false: ''
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            full: false
        }
    }
);

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export interface ButtonProps extends NativeButtonProps, VariantProps<typeof buttonStyles> {
    /** Render as a different element (e.g. an <a>) while keeping styles. */
    asChild?: boolean;
    /** Optional icon rendered to the left of children. */
    leadingIcon?: ReactNode;
    /** Optional icon rendered to the right of children. */
    trailingIcon?: ReactNode;
    /** Aria-label override for icon-only buttons (size="icon"). */
    'aria-label'?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            full,
            asChild = false,
            leadingIcon,
            trailingIcon,
            children,
            type,
            ...props
        },
        ref
    ) => {
        const sharedClassName = cn(buttonStyles({ variant, size, full }), className);
        if (asChild) {
            // When wrapping an existing element (anchor, NavLink, etc.) we trust
            // the caller to supply the full content; leading/trailing icon slots
            // would force a Fragment that Slot can't merge into.
            return (
                <Slot ref={ref} className={sharedClassName} {...props}>
                    {children}
                </Slot>
            );
        }
        // Native <button> defaults to type=submit inside a <form>, which has
        // bitten countless React apps. Force "button" unless caller opts in.
        return (
            <button ref={ref} type={type ?? 'button'} className={sharedClassName} {...props}>
                {leadingIcon}
                {children}
                {trailingIcon}
            </button>
        );
    }
);
Button.displayName = 'Button';
