/**
 * Content script — live ASAP harvester for the public Banner 8 dynamic
 * schedule pages (asap.utsa.edu/pls/prod/bwckschd...).
 *
 * Strategy:
 *   1. On a matching page, parse document.documentElement.outerHTML through
 *      parseAsapSearchResults.
 *   2. Pull the term ID from the page (input[name="term_in"] or visible label).
 *   3. Merge with whatever's already in chrome.storage.local under
 *      asap:sections:v1 — preserve sections from other subjects, add/replace
 *      the ones in the current page.
 *   4. Stamp { fetchedAt, sourceUrl } so the UI can show "Live · just now".
 *
 * No data leaves the user's browser. The harvest happens in their tab,
 * writes to their local storage, and is read back by the popup.
 *
 * Vite is configured to inline all imports for the content entry so the
 * bundle works inside MV3's isolated content-script world.
 */

import { parseAsapSearchResults } from '@utsaregplus/adapter-utsa/asap';
import type { Section } from '@utsaregplus/core';

const STORAGE_KEY = 'asap:sections:v1';
const HARVEST_PATH_PATTERNS = [
    '/pls/prod/bwckschd.p_get_crse_unsec',
    '/pls/prod/bwckschd.p_disp_listcrse',
    '/pls/prod/bwckschd.p_disp_dyn_sched'
];

interface HarvestPayload {
    schemaVersion: 1;
    fetchedAt: string;
    termId: string | null;
    sourceUrl: string;
    sections: Section[];
}

const log = (...args: unknown[]): void => {
    console.info('[utsa-reg+ harvest]', ...args);
};

const detectTermId = (): string | null => {
    // Banner 8 stores the term in a few places on these pages.
    const termInput = document.querySelector<HTMLInputElement>('input[name="term_in"]');
    if (termInput?.value && /^\d{6}$/.test(termInput.value)) return termInput.value;

    const select = document.querySelector<HTMLSelectElement>('select[name="p_term"]');
    if (select?.value && /^\d{6}$/.test(select.value)) return select.value;

    // Last resort: scan for a "Fall 2026" / "Spring 2026" label.
    const seasonCode: Record<string, string> = {
        spring: '20',
        summer: '30',
        fall: '10',
        winter: '40'
    };
    const match = /(spring|summer|fall|winter)\s+(\d{4})/i.exec(document.body.innerText);
    if (match) {
        const season = (match[1] ?? '').toLowerCase();
        const year = parseInt(match[2] ?? '0', 10);
        const code = seasonCode[season];
        // UTSA Banner uses Fall = (year + 1) + 10
        const yearForCode = season === 'fall' ? year + 1 : year;
        if (code && Number.isFinite(yearForCode) && yearForCode > 0) {
            return `${yearForCode}${code}`;
        }
    }
    return null;
};

const harvest = async (): Promise<void> => {
    const path = window.location.pathname;
    if (!HARVEST_PATH_PATTERNS.some((p) => path.includes(p))) return;

    const termId = detectTermId();
    if (!termId) {
        log('cannot detect term ID; skipping harvest');
        return;
    }

    let sections: Section[] = [];
    try {
        sections = parseAsapSearchResults(document.documentElement.outerHTML, {
            termId,
            warn: (msg) => {
                log(msg);
            }
        });
    } catch (err) {
        log('parser threw:', err);
        return;
    }

    if (sections.length === 0) {
        log('no parseable sections on this page');
        return;
    }

    let existing: HarvestPayload | null = null;
    try {
        const got = await chrome.storage.local.get(STORAGE_KEY);
        existing = (got[STORAGE_KEY] as HarvestPayload | undefined) ?? null;
    } catch (err) {
        log('storage read failed:', err);
    }

    // Merge: new sections replace old by CRN; sections from other subjects
    // (different page) are preserved as long as the term matches.
    const byCrn = new Map<string, Section>();
    if (existing?.termId === termId) {
        for (const s of existing.sections) byCrn.set(s.crn, s);
    }
    for (const s of sections) byCrn.set(s.crn, s);

    const payload: HarvestPayload = {
        schemaVersion: 1,
        fetchedAt: new Date().toISOString(),
        termId,
        sourceUrl: window.location.href,
        sections: Array.from(byCrn.values())
    };

    try {
        await chrome.storage.local.set({ [STORAGE_KEY]: payload });
        log(
            `harvested ${sections.length} sections for term ${termId}; cache now holds ${payload.sections.length} total.`
        );
    } catch (err) {
        log('storage write failed:', err);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        void harvest();
    });
} else {
    void harvest();
}
window.setTimeout(() => {
    void harvest();
}, 1500);
