import { type ReactNode } from 'react';
import * as Radix from '@radix-ui/react-tooltip';
import { cn } from '../utils/cn.js';

export const TooltipProvider = Radix.Provider;

export interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    /** Delay before showing, in ms. Defaults to 250. */
    delayMs?: number;
    /** Side to render on. */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Distance from anchor in px. */
    sideOffset?: number;
    /** When true, disables the tooltip without conditional rendering. */
    disabled?: boolean;
}

export const Tooltip = ({
    children,
    content,
    delayMs = 250,
    side = 'top',
    sideOffset = 6,
    disabled = false
}: TooltipProps) => {
    if (disabled) return <>{children}</>;
    return (
        <Radix.Root delayDuration={delayMs}>
            <Radix.Trigger asChild>{children}</Radix.Trigger>
            <Radix.Portal>
                <Radix.Content
                    side={side}
                    sideOffset={sideOffset}
                    collisionPadding={8}
                    className={cn(
                        'z-[10001]',
                        'bg-[var(--brand-default)] text-[var(--ink-on-brand)]',
                        'px-2.5 py-1.5 rounded-md text-[12px] font-medium leading-tight',
                        'shadow-[0_8px_24px_-4px_rgba(3,32,68,0.30)]',
                        'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0',
                        'data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95',
                        'duration-[120ms]'
                    )}
                >
                    {content}
                    <Radix.Arrow className="fill-[var(--brand-default)]" />
                </Radix.Content>
            </Radix.Portal>
        </Radix.Root>
    );
};
