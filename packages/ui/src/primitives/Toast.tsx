import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import * as Radix from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../utils/cn.js';

export const ToastProvider = Radix.Provider;
export const ToastTitle = Radix.Title;
export const ToastDescription = Radix.Description;
export const ToastClose = Radix.Close;
export const ToastAction = Radix.Action;

export const ToastViewport = forwardRef<
    ElementRef<typeof Radix.Viewport>,
    ComponentPropsWithoutRef<typeof Radix.Viewport>
>(({ className, ...props }, ref) => (
    <Radix.Viewport
        ref={ref}
        className={cn(
            'fixed bottom-0 right-0 z-[10002]',
            'p-4 flex flex-col gap-2 max-w-[min(420px,calc(100vw-32px))]',
            'list-none outline-none',
            className
        )}
        {...props}
    />
));
ToastViewport.displayName = 'ToastViewport';

const toastStyles = cva(
    [
        'group pointer-events-auto',
        'flex items-start gap-3 w-full',
        'p-3 pr-10 rounded-[10px] border',
        'bg-[var(--surface-raised)]',
        'shadow-[0_8px_24px_-4px_rgba(3,32,68,0.18),0_4px_8px_-2px_rgba(3,32,68,0.05)]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0',
        'duration-[200ms]',
        'relative'
    ],
    {
        variants: {
            tone: {
                neutral: 'border-[var(--border-default)]',
                success: 'border-(--status-open)/40',
                warn: 'border-(--status-warn)/40',
                danger: 'border-(--status-danger)/40',
                info: 'border-(--status-info)/40'
            }
        },
        defaultVariants: { tone: 'neutral' }
    }
);

const ToneIcon: Record<NonNullable<VariantProps<typeof toastStyles>['tone']>, ReactNode> = {
    neutral: <Info className="w-4 h-4 text-[var(--ink-muted)]" />,
    success: <CheckCircle2 className="w-4 h-4 text-[var(--status-open)]" />,
    warn: <AlertCircle className="w-4 h-4 text-[var(--status-warn)]" />,
    danger: <XCircle className="w-4 h-4 text-[var(--status-danger)]" />,
    info: <Info className="w-4 h-4 text-[var(--status-info)]" />
};

interface ToastProps
    extends ComponentPropsWithoutRef<typeof Radix.Root>, VariantProps<typeof toastStyles> {
    icon?: ReactNode;
}

export const Toast = forwardRef<ElementRef<typeof Radix.Root>, ToastProps>(
    ({ className, tone = 'neutral', icon, children, ...props }, ref) => (
        <Radix.Root ref={ref} className={cn(toastStyles({ tone }), className)} {...props}>
            <span className="mt-0.5 shrink-0">{icon ?? ToneIcon[tone ?? 'neutral']}</span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">{children}</div>
            <Radix.Close
                aria-label="Dismiss"
                className={cn(
                    'absolute top-2 right-2',
                    'h-7 w-7 inline-flex items-center justify-center rounded-full',
                    'text-[var(--ink-muted)] hover:text-[var(--ink-strong)] hover:bg-[var(--surface-muted)]',
                    'opacity-0 group-hover:opacity-100 focus:opacity-100',
                    'transition-opacity'
                )}
            >
                ×
            </Radix.Close>
        </Radix.Root>
    )
);
Toast.displayName = 'Toast';
