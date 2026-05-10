import { useEffect, useMemo, useState } from 'react';
import type { Freshness, Section } from '@utsaregplus/core';
import { ALL_SECTIONS, SECTIONS_FETCHED_AT } from '../data/index.js';
import {
    getAsapHarvest,
    onAsapHarvestChange,
    type AsapHarvest
} from '../storage/asapCache.js';

export interface UseSectionsResult {
    sections: Section[];
    /** How fresh the data the UI is rendering actually is. */
    freshness: Freshness;
    /** True if at least one section came from a live harvest. */
    hasLive: boolean;
    /** Term currently displayed (Banner six-digit). */
    termId: string | null;
    /**
     * Per-subject last-fetch timestamp from the live harvest, e.g.
     * { CS: "2026-05-10T14:33:01Z" }. Empty when nothing has been refreshed
     * live yet. UI uses this to render per-section staleness ("Live · 12s ago"
     * vs "Snapshot · 16h ago") without falling back to the global timestamp.
     */
    subjectFetchedAt: Record<string, string>;
}

/**
 * Merged sections data source. Live ASAP harvest (when available) wins over
 * the bundled snapshot for any CRN they share. Bundled snapshot fills in
 * the rest so the UI always has SOMETHING to render before the user has
 * visited ASAP.
 *
 * Subscribes to chrome.storage.onChanged so the popup/dashboard re-renders
 * the moment the content script writes a fresh harvest (the user comes back
 * from a search on asap.utsa.edu and the UI updates without a reload).
 */
export const useSections = (): UseSectionsResult => {
    const [harvest, setHarvest] = useState<AsapHarvest | null>(null);

    useEffect(() => {
        let cancelled = false;
        getAsapHarvest()
            .then((h) => {
                if (!cancelled) setHarvest(h);
            })
            .catch(() => {
                if (!cancelled) setHarvest(null);
            });
        const unsubscribe = onAsapHarvestChange((h) => {
            setHarvest(h);
        });
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    return useMemo<UseSectionsResult>(() => {
        if (!harvest || harvest.sections.length === 0) {
            return {
                sections: ALL_SECTIONS,
                freshness: { source: 'snapshot', fetchedAt: SECTIONS_FETCHED_AT },
                hasLive: false,
                termId: null,
                subjectFetchedAt: {}
            };
        }
        // Merge: harvest wins on shared CRNs.
        const byCrn = new Map<string, Section>();
        for (const s of ALL_SECTIONS) byCrn.set(s.crn, s);
        for (const s of harvest.sections) byCrn.set(s.crn, s);
        return {
            sections: Array.from(byCrn.values()),
            freshness: {
                source: 'live',
                fetchedAt: harvest.fetchedAt,
                maxAgeMs: 24 * 60 * 60 * 1000
            },
            hasLive: true,
            termId: harvest.termId,
            subjectFetchedAt: harvest.subjectFetchedAt ?? {}
        };
    }, [harvest]);
};
