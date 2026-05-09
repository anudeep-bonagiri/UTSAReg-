import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'schedule:v1';

interface ScheduleState {
    /** CRNs of sections the user has added to their schedule. */
    crns: string[];
    /** CRNs the user has bookmarked (not committed to schedule). */
    saved: string[];
}

const EMPTY: ScheduleState = { crns: [], saved: [] };

const isScheduleState = (v: unknown): v is ScheduleState =>
    typeof v === 'object' &&
    v !== null &&
    Array.isArray((v as { crns?: unknown }).crns) &&
    Array.isArray((v as { saved?: unknown }).saved);

/**
 * React hook that persists the user's schedule into chrome.storage.local.
 *
 *   const { crns, saved, addSection, removeSection, toggleSaved } = usePersistedSchedule();
 *
 * Multiple surfaces (popup, dashboard, content script overlay) reading at
 * the same time stay in sync via the chrome.storage.onChanged event.
 */
export const usePersistedSchedule = () => {
    const [state, setState] = useState<ScheduleState>(EMPTY);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        let cancelled = false;
        chrome.storage.local
            .get(STORAGE_KEY)
            .then((result) => {
                if (cancelled) return;
                const raw = result[STORAGE_KEY];
                setState(isScheduleState(raw) ? raw : EMPTY);
                setHydrated(true);
            })
            .catch(() => {
                if (cancelled) return;
                setState(EMPTY);
                setHydrated(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Cross-surface sync: pick up changes made in another popup / dashboard / tab.
    useEffect(() => {
        const listener = (
            changes: Record<string, chrome.storage.StorageChange>,
            areaName: string
        ): void => {
            if (areaName !== 'local') return;
            const change = changes[STORAGE_KEY];
            if (change && isScheduleState(change.newValue)) {
                setState(change.newValue);
            }
        };
        chrome.storage.onChanged.addListener(listener);
        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    const persist = useCallback((next: ScheduleState) => {
        setState(next);
        void chrome.storage.local.set({ [STORAGE_KEY]: next });
    }, []);

    const addSection = useCallback(
        (crn: string) => {
            persist({
                crns: state.crns.includes(crn) ? state.crns : [...state.crns, crn],
                saved: state.saved
            });
        },
        [persist, state]
    );

    const removeSection = useCallback(
        (crn: string) => {
            persist({
                crns: state.crns.filter((c) => c !== crn),
                saved: state.saved
            });
        },
        [persist, state]
    );

    const toggleSaved = useCallback(
        (crn: string) => {
            const isSaved = state.saved.includes(crn);
            persist({
                crns: state.crns,
                saved: isSaved ? state.saved.filter((c) => c !== crn) : [...state.saved, crn]
            });
        },
        [persist, state]
    );

    const clearAll = useCallback(() => {
        persist(EMPTY);
    }, [persist]);

    return {
        ...state,
        hydrated,
        addSection,
        removeSection,
        toggleSaved,
        clearAll
    };
};
