import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const cardStyles = cva(
    [
        'bg-[--surface-default] text-[--ink-default]',
        'border border-[--border-default]',
        'rounded-[12px]',
        'transition-shadow duration-[200ms] ease-out'
    ],
    {
        variants: {
            elevation: {
                flat: 'shadow-none',
                low: 'shadow-[0_1px_2px_0_rgba(3,32,68,0.04)]',
                mid: 'shadow-[0_2px_8px_-1px_rgba(3,32,68,0.06),0_1px_3px_-1px_rgba(3,32,68,0.04)]',
                high: 'shadow-[0_8px_24px_-4px_rgba(3,32,68,0.10),0_4px_8px_-2px_rgba(3,32,68,0.05)]'
            },
            interactive: {
                true: 'cursor-pointer hover:border-[--border-strong] hover:shadow-[0_8px_24px_-4px_rgba(3,32,68,0.10)] focus-within:border-[--border-focus]',
                false: ''
            },
            padding: {
                none: 'p-0',
                sm: 'p-3',
                md: 'p-4',
                lg: 'p-6'
            }
        },
        defaultVariants: {
            elevation: 'low',
            interactive: false,
            padding: 'md'
        }
    }
);

export interface CardProps
    extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardStyles> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, elevation, interactive, padding, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardStyles({ elevation, interactive, padding }), className)}
            {...props}
        />
    )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col gap-1 mb-3', className)} {...props} />
    )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn(
                'text-[15px] font-bold leading-tight text-[--ink-strong] tracking-tight',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-[13px] leading-snug text-[--ink-muted]', className)}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center gap-2 mt-4', className)} {...props} />
    )
);
CardFooter.displayName = 'CardFooter';
