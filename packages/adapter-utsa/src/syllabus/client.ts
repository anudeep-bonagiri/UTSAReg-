import {
    SyllabusOrganizationListSchema,
    SyllabusTermListSchema,
    type SyllabusOrganization,
    type SyllabusTerm
} from './types.js';

/**
 * Live read-only client for utsa.simplesyllabus.com's public endpoints.
 *
 * No auth, no cookies, no CORS surprises (host is in extension manifest
 * permissions). Both endpoints are stable JSON list responses with the
 * { items, length, page } shape.
 */

export const SIMPLE_SYLLABUS_BASE = 'https://utsa.simplesyllabus.com';
const ORG_PATH = '/api/organization';
const TERM_PATH = '/api/term';

export interface SyllabusClientOptions {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
}

export class SyllabusFetchError extends Error {
    constructor(
        public readonly status: number,
        public readonly url: string
    ) {
        super(`Simple Syllabus fetch failed: HTTP ${status} for ${url}`);
        this.name = 'SyllabusFetchError';
    }
}

const fetchJson = async <T>(
    url: string,
    parser: (raw: unknown) => T,
    options: SyllabusClientOptions
): Promise<T> => {
    const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    const controller = new AbortController();
    const timer = setTimeout(() => {
        controller.abort();
    }, options.timeoutMs ?? 10000);
    try {
        const res = await fetchImpl(url, {
            headers: { Accept: 'application/json' },
            signal: controller.signal
        });
        if (!res.ok) throw new SyllabusFetchError(res.status, url);
        const raw: unknown = await res.json();
        return parser(raw);
    } finally {
        clearTimeout(timer);
    }
};

export const fetchUtsaOrganizations = async (
    options: SyllabusClientOptions = {}
): Promise<SyllabusOrganization[]> =>
    fetchJson(
        `${SIMPLE_SYLLABUS_BASE}${ORG_PATH}`,
        (raw) => SyllabusOrganizationListSchema.parse(raw).items,
        options
    );

export const fetchUtsaTerms = async (
    options: SyllabusClientOptions = {}
): Promise<SyllabusTerm[]> =>
    fetchJson(
        `${SIMPLE_SYLLABUS_BASE}${TERM_PATH}`,
        (raw) => SyllabusTermListSchema.parse(raw).items,
        options
    );

/**
 * The public library URL the user should follow to read the actual syllabi.
 * Format chosen so the SPA's search input pre-fills with our query.
 */
export const buildLibrarySearchUrl = (courseId: string): string => {
    // courseId comes in as "CS3343"; the UTSA library accepts "CS 3343".
    const formatted = courseId.replace(/^([A-Z]{2,4})(\d+)$/, '$1 $2');
    return `${SIMPLE_SYLLABUS_BASE}/en-US/syllabus-library?query=${encodeURIComponent(formatted)}`;
};
