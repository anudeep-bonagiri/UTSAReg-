import { useEffect, useState, type HTMLAttributes } from 'react';
import { Wifi, Database, Clock, AlertCircle, FileText } from 'lucide-react';
import { formatRelativeFreshness, type Freshness, type FreshnessSource } from '@utsaregplus/core';
import { cn } from '../utils/cn.js';

/**
 * Visual indicator of how fresh a piece of data is.
 *
 * The whole product is built around the rule "never lie about how live the
 * data is." This component is the user-facing manifestation: a chip glued
 * next to any data that came from a network/cache, showing exactly when it
 * was fetched and from where.
 *
 * Tone is encoded by source, never overrideable — this prevents accidentally
 * marking stale data as "live" via the wrong color.
 */

const sourceTone: Record<
    FreshnessSource,
    {
        label: string;
        toneClass: string;
        Icon: typeof Wifi;
    }
> = {
    live: {
        label: 'Live',
        toneClass: 'bg-[var(--status-open-soft)] text-[var(--status-open)]',
        Icon: Wifi
    },
    'cache-fresh': {
        label: 'Cached',
        toneClass: 'bg-[var(--status-info-soft)] text-[var(--status-info)]',
        Icon: Database
    },
    'cache-stale': {
        label: 'Stale',
        toneClass: 'bg-[var(--status-warn-soft)] text-[var(--status-warn)]',
        Icon: AlertCircle
    },
    snapshot: {
        label: 'Snapshot',
        toneClass: 'bg-[var(--brand-soft)] text-[var(--brand-default)]',
        Icon: FileText
    },
    'user-input': {
        label: 'Pasted',
        toneClass:
            'bg-[var(--surface-muted)] text-[var(--ink-muted)] border border-[var(--border-default)]',
        Icon: Clock
    }
};

export interface FreshnessChipProps extends HTMLAttributes<HTMLSpanElement> {
    freshness: Freshness;
    /** Hide the source label, show only the relative time. */
    timeOnly?: boolean;
    /** How often to recompute the relative-time label (ms). Default 30s. */
    tickMs?: number;
}

export const FreshnessChip = ({
    freshness,
    timeOnly = false,
    tickMs = 30_000,
    className,
    ...props
}: FreshnessChipProps) => {
    const [now, setNow] = useState(() => Date.now());

    // Self-tick so a chip rendered at "5 min ago" advances to "6 min ago"
    // without the parent having to re-render. Stops when unmounted.
    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), tickMs);
        return () => {
            window.clearInterval(id);
        };
    }, [tickMs]);

    // noUncheckedIndexedAccess narrows even closed Record<K,V> lookups to V|undefined,
    // so fall back to a neutral tone for forward-compatibility (new sources from core).
    const tone = sourceTone[freshness.source] ?? sourceTone['cache-fresh'];
    const relative = formatRelativeFreshness(freshness.fetchedAt, now);
    const labelText = timeOnly ? relative : `${tone.label} · ${relative}`;
    const titleText = `${tone.label} — fetched ${new Date(freshness.fetchedAt).toLocaleString()}`;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full',
                'px-2 h-5 text-[10px] font-semibold uppercase tracking-wider',
                'utsa-tabular select-none',
                tone.toneClass,
                className
            )}
            title={titleText}
            aria-label={titleText}
            {...props}
        >
            <tone.Icon aria-hidden className="w-3 h-3" />
            <span>{labelText}</span>
        </span>
    );
};
