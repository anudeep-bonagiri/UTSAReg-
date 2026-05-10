import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import * as Radix from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../utils/cn.js';

export const DialogRoot = Radix.Root;
export const DialogTrigger = Radix.Trigger;
export const DialogClose = Radix.Close;
export const DialogPortal = Radix.Portal;

export const DialogOverlay = forwardRef<
    ElementRef<typeof Radix.Overlay>,
    ComponentPropsWithoutRef<typeof Radix.Overlay>
>(({ className, ...props }, ref) => (
    <Radix.Overlay
        ref={ref}
        className={cn(
            'fixed inset-0 z-[10000] bg-black/45 backdrop-blur-[2px]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'duration-[200ms]',
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = 'DialogOverlay';

interface DialogContentProps extends ComponentPropsWithoutRef<typeof Radix.Content> {
    /** Whether to show the built-in × close button (default true). */
    showCloseButton?: boolean;
    /** Visually hide the close button without removing it. Use sparingly. */
    overlayChildren?: ReactNode;
}

export const DialogContent = forwardRef<ElementRef<typeof Radix.Content>, DialogContentProps>(
    ({ className, children, showCloseButton = true, overlayChildren, ...props }, ref) => (
        <DialogPortal>
            <DialogOverlay>{overlayChildren}</DialogOverlay>
            <Radix.Content
                ref={ref}
                className={cn(
                    'fixed left-1/2 top-1/2 z-[10001] -translate-x-1/2 -translate-y-1/2',
                    'w-[min(540px,calc(100vw-32px))] max-h-[min(85vh,720px)]',
                    'bg-[var(--surface-raised)] text-[var(--ink-default)]',
                    'border border-[var(--border-default)] rounded-[16px]',
                    'shadow-[0_20px_40px_-8px_rgba(3,32,68,0.18),0_8px_16px_-4px_rgba(3,32,68,0.08)]',
                    'flex flex-col overflow-hidden',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out',
                    'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
                    'data-[state=open]:zoom-in-[0.97] data-[state=closed]:zoom-out-[0.97]',
                    'duration-[200ms]',
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <Radix.Close
                        aria-label="Close dialog"
                        className={cn(
                            'absolute top-3 right-3',
                            'h-8 w-8 inline-flex items-center justify-center',
                            'rounded-full text-[var(--ink-muted)]',
                            'hover:bg-[var(--surface-muted)] hover:text-[var(--ink-strong)]',
                            'transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)/55'
                        )}
                    >
                        <X className="w-4 h-4" />
                    </Radix.Close>
                )}
            </Radix.Content>
        </DialogPortal>
    )
);
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
    <div
        className={cn(
            'px-6 pt-6 pb-4 border-b border-[var(--border-default)]',
            'flex flex-col gap-1',
            className
        )}
        {...props}
    />
);

export const DialogTitle = forwardRef<
    ElementRef<typeof Radix.Title>,
    ComponentPropsWithoutRef<typeof Radix.Title>
>(({ className, ...props }, ref) => (
    <Radix.Title
        ref={ref}
        className={cn('text-[18px] font-bold leading-tight text-[var(--ink-strong)]', className)}
        {...props}
    />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = forwardRef<
    ElementRef<typeof Radix.Description>,
    ComponentPropsWithoutRef<typeof Radix.Description>
>(({ className, ...props }, ref) => (
    <Radix.Description
        ref={ref}
        className={cn('text-[13px] leading-snug text-[var(--ink-muted)]', className)}
        {...props}
    />
));
DialogDescription.displayName = 'DialogDescription';

export const DialogBody = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
    <div className={cn('px-6 py-5 flex-1 overflow-y-auto', className)} {...props} />
);

export const DialogFooter = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
    <div
        className={cn(
            'px-6 py-4 border-t border-[var(--border-default)]',
            'flex items-center justify-end gap-3',
            'bg-[var(--surface-canvas)]',
            className
        )}
        {...props}
    />
);
