import { z } from 'zod';

/**
 * Where this slice of data came from and how recent it is.
 *
 *   live           Just fetched from the network this very moment.
 *   cache-fresh    From local cache, within its TTL — equivalent to live.
 *   cache-stale    From local cache, past its TTL. We're returning it
 *                  because it's better than nothing while a refresh runs;
 *                  UI should show the timestamp prominently.
 *   snapshot       Bundled with the extension build (catalog / grades).
 *                  Updates only when the user updates the extension.
 *   user-input     Hand-pasted by the user (e.g. ASAP HTML during prep).
 *
 * Freshness is part of the response envelope, never inferred from data
 * shape. UI never says "Live" unless this says so.
 */
export const FreshnessSourceSchema = z.enum([
    'live',
    'cache-fresh',
    'cache-stale',
    'snapshot',
    'user-input'
]);

export const FreshnessSchema = z.object({
    source: FreshnessSourceSchema,
    /** ISO timestamp of when this data was originally produced. */
    fetchedAt: z.string().datetime(),
    /**
     * The TTL the cache layer used when storing this entry, in ms. Lets the
     * UI calculate "stale-by" countdowns without re-deriving policy.
     */
    maxAgeMs: z.number().int().positive().optional()
});

export type FreshnessSource = z.infer<typeof FreshnessSourceSchema>;
export type Freshness = z.infer<typeof FreshnessSchema>;

/** Standard envelope: every adapter returns Fresh<T>, never bare T. */
export interface Fresh<T> {
    data: T;
    freshness: Freshness;
}

/**
 * Render-ready relative-time label, deterministic given (now, fetchedAt).
 * Pure function so it can be unit-tested without faking Date.now().
 */
export const formatRelativeFreshness = (fetchedAt: string, nowMs: number = Date.now()): string => {
    const diffMs = nowMs - new Date(fetchedAt).getTime();
    if (diffMs < 0) return 'just now';
    const sec = Math.floor(diffMs / 1000);
    if (sec < 10) return 'just now';
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
};

/**
 * Has the cached entry exceeded its TTL?
 * `now` injectable so tests don't have to mock Date.
 */
export const isStale = (freshness: Freshness, nowMs: number = Date.now()): boolean => {
    if (freshness.source === 'snapshot') return false;
    if (freshness.source === 'cache-stale') return true;
    if (!freshness.maxAgeMs) return false;
    return nowMs - new Date(freshness.fetchedAt).getTime() > freshness.maxAgeMs;
};

/** Helper for adapters: wrap a value with live freshness as of now. */
export const liveNow = <T>(data: T, maxAgeMs?: number): Fresh<T> => {
    const freshness: Freshness = {
        source: 'live',
        fetchedAt: new Date().toISOString(),
        ...(maxAgeMs !== undefined ? { maxAgeMs } : {})
    };
    return { data, freshness };
};
