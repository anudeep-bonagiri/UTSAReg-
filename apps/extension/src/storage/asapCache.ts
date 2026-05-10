import { SectionSchema, type Section } from '@utsaregplus/core';

/**
 * Read the live ASAP harvest from chrome.storage.local.
 *
 * Written by the content script (apps/extension/src/content/index.tsx)
 * each time the user lands on the public bwckschd dynamic schedule.
 * Read by popup + dashboard so they can render LIVE sections instead of
 * (or merged with) the bundled snapshot.
 */

const STORAGE_KEY = 'asap:sections:v1';

export interface AsapHarvest {
    schemaVersion: 1;
    fetchedAt: string;
    termId: string | null;
    sourceUrl: string;
    sections: Section[];
}

interface RawHarvest {
    schemaVersion: number;
    fetchedAt: string;
    termId: string | null;
    sourceUrl: string;
    sections: unknown[];
}

const isRawHarvest = (v: unknown): v is RawHarvest =>
    typeof v === 'object' &&
    v !== null &&
    typeof (v as RawHarvest).schemaVersion === 'number' &&
    typeof (v as RawHarvest).fetchedAt === 'string' &&
    Array.isArray((v as RawHarvest).sections);

export const getAsapHarvest = async (): Promise<AsapHarvest | null> => {
    try {
        const got = await chrome.storage.local.get(STORAGE_KEY);
        const raw = got[STORAGE_KEY];
        if (!isRawHarvest(raw)) return null;
        if (raw.schemaVersion !== 1) return null;
        const sections: Section[] = [];
        for (const s of raw.sections) {
            const parsed = SectionSchema.safeParse(s);
            if (parsed.success) sections.push(parsed.data);
        }
        return {
            schemaVersion: 1,
            fetchedAt: raw.fetchedAt,
            termId: raw.termId,
            sourceUrl: raw.sourceUrl,
            sections
        };
    } catch {
        return null;
    }
};

export const clearAsapHarvest = async (): Promise<void> => {
    await chrome.storage.local.remove(STORAGE_KEY);
};

/**
 * Subscribe to harvest updates so the UI re-renders when the content script
 * writes a fresh batch. Returns an unsubscribe function.
 */
export const onAsapHarvestChange = (
    handler: (harvest: AsapHarvest | null) => void
): (() => void) => {
    const listener = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string
    ): void => {
        if (areaName !== 'local') return;
        if (!(STORAGE_KEY in changes)) return;
        const next = changes[STORAGE_KEY]?.newValue;
        if (!next) {
            handler(null);
            return;
        }
        if (isRawHarvest(next) && next.schemaVersion === 1) {
            const sections: Section[] = [];
            for (const s of next.sections) {
                const parsed = SectionSchema.safeParse(s);
                if (parsed.success) sections.push(parsed.data);
            }
            handler({
                schemaVersion: 1,
                fetchedAt: next.fetchedAt,
                termId: next.termId,
                sourceUrl: next.sourceUrl,
                sections
            });
        }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
        chrome.storage.onChanged.removeListener(listener);
    };
};
