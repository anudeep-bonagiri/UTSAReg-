import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../utils/cn.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Leading icon or prefix text (rendered inside the field). */
    leadingAdornment?: ReactNode;
    /** Trailing icon, button, or hint (rendered inside the field). */
    trailingAdornment?: ReactNode;
    /** True if the field has a validation error — paints the border red. */
    invalid?: boolean;
    /** Smaller height for tight spaces (e.g. table-row inline edit). */
    compact?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            leadingAdornment,
            trailingAdornment,
            invalid = false,
            compact = false,
            disabled,
            type = 'text',
            ...props
        },
        ref
    ) => {
        const wrapperClass = cn(
            'group flex items-center gap-2 w-full',
            'bg-[--surface-default] border rounded-[8px]',
            'transition-colors duration-[120ms]',
            invalid
                ? 'border-[--status-danger]'
                : 'border-[--border-strong] focus-within:border-[--border-focus]',
            'focus-within:ring-2 focus-within:ring-[--border-focus]/35',
            compact ? 'h-8 px-2.5 text-[12px]' : 'h-10 px-3 text-[13px]',
            disabled && 'opacity-60 cursor-not-allowed bg-[--surface-muted]',
            className
        );
        return (
            <div className={wrapperClass}>
                {leadingAdornment && (
                    <span className="flex items-center text-[--ink-subtle] [&>svg]:w-4 [&>svg]:h-4">
                        {leadingAdornment}
                    </span>
                )}
                <input
                    ref={ref}
                    type={type}
                    disabled={disabled}
                    className={cn(
                        'flex-1 min-w-0 bg-transparent border-0 outline-none',
                        'placeholder:text-[--ink-subtle]',
                        'text-[--ink-strong]'
                    )}
                    aria-invalid={invalid || undefined}
                    {...props}
                />
                {trailingAdornment && (
                    <span className="flex items-center text-[--ink-muted] [&>svg]:w-4 [&>svg]:h-4">
                        {trailingAdornment}
                    </span>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';
