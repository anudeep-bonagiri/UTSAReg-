import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import * as Radix from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn.js';

export const SelectRoot = Radix.Root;
export const SelectGroup = Radix.Group;
export const SelectValue = Radix.Value;
export const SelectPortal = Radix.Portal;

interface SelectTriggerProps extends ComponentPropsWithoutRef<typeof Radix.Trigger> {
    /** Smaller height for compact toolbars. */
    compact?: boolean;
    /** Show validation error border. */
    invalid?: boolean;
}

export const SelectTrigger = forwardRef<ElementRef<typeof Radix.Trigger>, SelectTriggerProps>(
    ({ className, children, compact = false, invalid = false, ...props }, ref) => (
        <Radix.Trigger
            ref={ref}
            className={cn(
                'inline-flex items-center justify-between gap-2 w-full',
                'bg-[var(--surface-default)] text-[var(--ink-strong)]',
                'border rounded-[8px] transition-colors duration-[120ms]',
                invalid
                    ? 'border-[var(--status-danger)]'
                    : 'border-[var(--border-strong)] hover:border-[var(--ink-subtle)]',
                'focus-visible:outline-none focus-visible:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-(--border-focus)/35',
                compact ? 'h-8 px-2.5 text-[12px]' : 'h-10 px-3 text-[13px]',
                'data-[placeholder]:text-[var(--ink-subtle)]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                className
            )}
            {...props}
        >
            {children}
            <Radix.Icon asChild>
                <ChevronDown className="w-4 h-4 text-[var(--ink-muted)] shrink-0" />
            </Radix.Icon>
        </Radix.Trigger>
    )
);
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = forwardRef<
    ElementRef<typeof Radix.Content>,
    ComponentPropsWithoutRef<typeof Radix.Content>
>(({ className, children, position = 'popper', sideOffset = 6, ...props }, ref) => (
    <SelectPortal>
        <Radix.Content
            ref={ref}
            position={position}
            sideOffset={sideOffset}
            className={cn(
                'z-[10001] overflow-hidden',
                'bg-[var(--surface-raised)] text-[var(--ink-default)]',
                'border border-[var(--border-default)] rounded-[10px]',
                'shadow-[0_8px_24px_-4px_rgba(3,32,68,0.18)]',
                'min-w-[var(--radix-select-trigger-width)]',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
                'duration-[120ms]',
                className
            )}
            {...props}
        >
            <Radix.Viewport className="p-1">{children}</Radix.Viewport>
        </Radix.Content>
    </SelectPortal>
));
SelectContent.displayName = 'SelectContent';

export const SelectLabel = forwardRef<
    ElementRef<typeof Radix.Label>,
    ComponentPropsWithoutRef<typeof Radix.Label>
>(({ className, ...props }, ref) => (
    <Radix.Label
        ref={ref}
        className={cn(
            'px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-bold text-[var(--ink-subtle)]',
            className
        )}
        {...props}
    />
));
SelectLabel.displayName = 'SelectLabel';

interface SelectItemProps extends ComponentPropsWithoutRef<typeof Radix.Item> {
    children: ReactNode;
}

export const SelectItem = forwardRef<ElementRef<typeof Radix.Item>, SelectItemProps>(
    ({ className, children, ...props }, ref) => (
        <Radix.Item
            ref={ref}
            className={cn(
                'relative flex items-center justify-between gap-2',
                'px-2.5 py-1.5 rounded-[6px]',
                'text-[13px] text-[var(--ink-default)] cursor-pointer select-none outline-none',
                'data-[highlighted]:bg-[var(--surface-muted)]',
                'data-[state=checked]:text-[var(--ink-strong)] data-[state=checked]:font-semibold',
                'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
                className
            )}
            {...props}
        >
            <Radix.ItemText>{children}</Radix.ItemText>
            <Radix.ItemIndicator>
                <Check className="w-3.5 h-3.5 text-[var(--accent-default)]" />
            </Radix.ItemIndicator>
        </Radix.Item>
    )
);
SelectItem.displayName = 'SelectItem';

export const SelectSeparator = forwardRef<
    ElementRef<typeof Radix.Separator>,
    ComponentPropsWithoutRef<typeof Radix.Separator>
>(({ className, ...props }, ref) => (
    <Radix.Separator
        ref={ref}
        className={cn('h-px bg-[var(--border-default)] my-1', className)}
        {...props}
    />
));
SelectSeparator.displayName = 'SelectSeparator';
