import type { Section } from '@utsaregplus/core';
import { parseAsapSearchResults } from './searchParser.js';

/**
 * Live client for UTSA's PUBLIC class schedule.
 *
 * Two-step Banner 8 form flow:
 *   1. POST /pls/prod/bwckgens.p_proc_term_date  (selects the term)
 *   2. POST /pls/prod/bwckschd.p_get_crse_unsec  (runs the search, returns results)
 *
 * No login. No session cookies. No auth headers. Public per UTSA's
 * registrar publication.
 */

export const ASAP_BASE_URL = 'https://asap.utsa.edu';
const TERM_PROC_PATH = '/pls/prod/bwckgens.p_proc_term_date';
const SEARCH_PATH = '/pls/prod/bwckschd.p_get_crse_unsec';

export interface AsapSearchOptions {
    termId: string;
    subjects: string[];
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
    /** Warn callback forwarded to the parser. */
    warn?: (msg: string) => void;
}

export class AsapFetchError extends Error {
    constructor(
        public readonly status: number,
        public readonly url: string
    ) {
        super(`ASAP fetch failed: HTTP ${status} for ${url}`);
        this.name = 'AsapFetchError';
    }
}

/**
 * The Banner search form requires a strict pile of "dummy" sentinel inputs
 * for the multi-select fields. Encoding them by hand is the only way that
 * works reliably across browsers and Node.
 */
const buildSearchBody = (termId: string, subjects: string[]): string => {
    const params: [string, string][] = [
        ['term_in', termId],
        ['sel_subj', 'dummy'],
        ...subjects.map<[string, string]>((s) => ['sel_subj', s]),
        ['sel_day', 'dummy'],
        ['sel_schd', 'dummy'],
        ['sel_insm', 'dummy'],
        ['sel_camp', 'dummy'],
        ['sel_levl', 'dummy'],
        ['sel_sess', 'dummy'],
        ['sel_instr', 'dummy'],
        ['sel_ptrm', 'dummy'],
        ['sel_attr', 'dummy'],
        ['sel_crse', ''],
        ['sel_title', ''],
        ['sel_from_cred', ''],
        ['sel_to_cred', ''],
        ['begin_hh', '0'],
        ['begin_mi', '0'],
        ['begin_ap', 'a'],
        ['end_hh', '0'],
        ['end_mi', '0'],
        ['end_ap', 'a']
    ];
    return params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
};

/**
 * Step 1: tell Banner which term we're searching. Required even though we
 * pass term_in to step 2 — Banner stores the term in session state.
 */
const submitTermSelection = async (
    fetchImpl: typeof fetch,
    termId: string,
    signal: AbortSignal
): Promise<void> => {
    const body = `p_calling_proc=bwckschd.p_disp_dyn_sched&p_term=${encodeURIComponent(termId)}`;
    const url = `${ASAP_BASE_URL}${TERM_PROC_PATH}`;
    const res = await fetchImpl(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/html'
        },
        body,
        signal
    });
    if (!res.ok) throw new AsapFetchError(res.status, url);
    // Discard body — we only need the side effect.
    await res.text();
};

const submitSearch = async (
    fetchImpl: typeof fetch,
    options: AsapSearchOptions,
    signal: AbortSignal
): Promise<string> => {
    const url = `${ASAP_BASE_URL}${SEARCH_PATH}`;
    const res = await fetchImpl(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'text/html'
        },
        body: buildSearchBody(options.termId, options.subjects),
        signal
    });
    if (!res.ok) throw new AsapFetchError(res.status, url);
    return res.text();
};

/**
 * High-level entry point. Returns parsed Section records for the requested
 * (term, subjects) tuple. Handles the two-step form flow internally.
 */
export const fetchAsapSections = async (options: AsapSearchOptions): Promise<Section[]> => {
    const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    const controller = new AbortController();
    const timer = setTimeout(() => {
        controller.abort();
    }, options.timeoutMs ?? 20000);
    try {
        await submitTermSelection(fetchImpl, options.termId, controller.signal);
        const html = await submitSearch(fetchImpl, options, controller.signal);
        return parseAsapSearchResults(html, {
            termId: options.termId,
            ...(options.warn ? { warn: options.warn } : {})
        });
    } finally {
        clearTimeout(timer);
    }
};
