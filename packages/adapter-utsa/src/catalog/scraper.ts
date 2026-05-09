import { type Course } from '@utsaregplus/core';
import { parseCatalogHtml } from './parser.js';

/**
 * Fetch a single subject's course descriptions from catalog.utsa.edu and
 * return parsed Course records.
 *
 * The catalog publishes each subject at a stable URL:
 *   https://catalog.utsa.edu/undergraduate/coursedescriptions/{slug}/
 *   https://catalog.utsa.edu/graduate/coursedescriptions/{slug}/
 *
 * `slug` is the lowercase subject prefix (e.g. "cs", "mat", "is").
 */

export const CATALOG_BASE_URL = 'https://catalog.utsa.edu';

export interface FetchSubjectOptions {
    /** Defaults to "undergraduate". Pass "graduate" for grad-level offerings. */
    level?: 'undergraduate' | 'graduate';
    /** Override the global fetch (for tests). */
    fetchImpl?: typeof fetch;
    /** Hard timeout in ms. */
    timeoutMs?: number;
}

export class CatalogFetchError extends Error {
    constructor(
        public readonly status: number,
        public readonly url: string
    ) {
        super(`Catalog fetch failed: HTTP ${status} for ${url}`);
        this.name = 'CatalogFetchError';
    }
}

export const fetchSubject = async (
    subjectSlug: string,
    options: FetchSubjectOptions = {}
): Promise<Course[]> => {
    const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    const level = options.level ?? 'undergraduate';
    const slug = subjectSlug.toLowerCase();
    const url = `${CATALOG_BASE_URL}/${level}/coursedescriptions/${slug}/`;

    const controller = new AbortController();
    const timer = setTimeout(() => {
        controller.abort();
    }, options.timeoutMs ?? 12000);
    try {
        const res = await fetchImpl(url, {
            headers: {
                'User-Agent': 'UTSARegPlus/0.1 (catalog scraper; +https://utsaregplus.com)',
                Accept: 'text/html'
            },
            signal: controller.signal
        });
        if (!res.ok) {
            throw new CatalogFetchError(res.status, url);
        }
        const html = await res.text();
        return parseCatalogHtml(html, { expectedSubject: subjectSlug.toUpperCase() });
    } finally {
        clearTimeout(timer);
    }
};

/**
 * Fetch many subjects in parallel with bounded concurrency. Failures are
 * logged but do not abort the run — partial catalogs are still useful.
 */
export const fetchSubjects = async (
    subjects: string[],
    options: FetchSubjectOptions & { concurrency?: number } = {}
): Promise<Map<string, Course[]>> => {
    const concurrency = options.concurrency ?? 4;
    const result = new Map<string, Course[]>();
    const queue = [...subjects];
    const errors: { subject: string; error: unknown }[] = [];

    const worker = async (): Promise<void> => {
        while (queue.length > 0) {
            const subject = queue.shift();
            if (!subject) return;
            try {
                const courses = await fetchSubject(subject, options);
                result.set(subject.toUpperCase(), courses);
            } catch (err) {
                errors.push({ subject, error: err });
                result.set(subject.toUpperCase(), []);
            }
        }
    };

    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    if (errors.length > 0) {
        for (const { subject, error } of errors) {
            // eslint-disable-next-line no-console -- intentional script-time logging
            console.warn(
                `[catalog] failed to fetch ${subject}: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    return result;
};
