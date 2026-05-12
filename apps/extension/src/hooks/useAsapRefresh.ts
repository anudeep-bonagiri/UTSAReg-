import { useCallback, useEffect, useState } from 'react';
import { sendToBackground } from '../messaging/protocol.js';
import type { RefreshAsapSubjectsResponse } from '../messaging/protocol.js';

/**
 * Just-in-time live ASAP refresh.
 *
 * The background service worker holds the rate-limit + dedupe state, so this
 * hook is just a thin imperative wrapper plus a "refresh these subjects on
 * mount" effect. Useful at three points:
 *
 *   1. Popup/dashboard mount — pre-warm subjects the user already cares about
 *      (saved + scheduled CRNs) so by the time they look, seat counts are live.
 *   2. Right before an action — when the user is about to Save / Add /
 *      open detail, refresh that section's subject so the decision is made
 *      against fresh data, not the 16h-old snapshot.
 *   3. Manual refresh button — `force: true` bypasses the SW rate limit.
 *
 * `refreshing` is the set of subjects currently being fetched, useful for
 * spinner state on per-section badges.
 */
export interface UseAsapRefreshResult {
    refresh: (subjects: string[], opts?: { force?: boolean }) => Promise<void>;
    refreshing: Set<string>;
    lastError: string | null;
}

export const useAsapRefresh = (termId: string | null): UseAsapRefreshResult => {
    const [refreshing, setRefreshing] = useState<Set<string>>(() => new Set());
    const [lastError, setLastError] = useState<string | null>(null);

    const refresh = useCallback(
        async (subjects: string[], opts?: { force?: boolean }): Promise<void> => {
            if (!termId) return;
            const upper = Array.from(
                new Set(
                    subjects
                        .map((s) => s.toUpperCase())
                        .filter((s) => /^[A-Z]{2,4}$/.test(s))
                )
            );
            if (upper.length === 0) return;

            setRefreshing((prev) => {
                const next = new Set(prev);
                for (const s of upper) next.add(s);
                return next;
            });

            try {
                const resp: RefreshAsapSubjectsResponse = await sendToBackground({
                    type: 'refreshAsapSubjects',
                    termId,
                    subjects: upper,
                    ...(opts?.force ? { force: true } : {})
                });
                if (!resp.ok) {
                    setLastError(resp.error);
                } else if (resp.errors.length > 0) {
                    setLastError(`${resp.errors[0]?.subject}: ${resp.errors[0]?.message}`);
                } else {
                    setLastError(null);
                }
            } catch (err) {
                setLastError(err instanceof Error ? err.message : String(err));
            } finally {
                setRefreshing((prev) => {
                    const next = new Set(prev);
                    for (const s of upper) next.delete(s);
                    return next;
                });
            }
        },
        [termId]
    );

    return { refresh, refreshing, lastError };
};

/**
 * Refresh a list of subjects exactly once on mount (or whenever the
 * dependency-stringified subject set changes). Hand it the subjects derived
 * from the user's saved + scheduled lists. The SW's rate limit makes
 * repeated mounts cheap.
 */
export const useAsapAutoRefresh = (
    refresh: UseAsapRefreshResult['refresh'],
    termId: string | null,
    subjects: string[]
): void => {
    // Stable key for the dep array.
    const key = subjects
        .map((s) => s.toUpperCase())
        .sort((a, b) => a.localeCompare(b))
        .join(',');
    useEffect(() => {
        if (!termId || key.length === 0) return;
        void refresh(key.split(','));
    }, [refresh, termId, key]);
};
