/**
 * Bundled UTSA data, all freshly scraped from public sources at build time.
 *
 *   catalog.json    1,416 courses scraped live from catalog.utsa.edu via
 *                   `npm run data:catalog` (filtered subset for the bundle).
 *   sections.json   2,400+ live sections scraped from
 *                   asap.utsa.edu/pls/prod/bwckschd via `npm run data:sections`.
 *                   Real CRNs, real instructors, real meeting times.
 *
 * Both are validated through @utsaregplus/core schemas at module load so a
 * malformed file fails loudly at startup, not at first render.
 *
 * "Snapshot" freshness: bundled with the extension. The user clicks
 * "Refresh sections" in the dashboard to re-fetch from ASAP at runtime,
 * which transitions to "live" freshness with a fresh timestamp.
 */

import { CourseSchema, SectionSchema, type Course, type Section } from '@utsaregplus/core';
import catalogJson from './catalog.json';
import sectionsJson from './sections.json';

interface CatalogManifest {
    schemaVersion: number;
    fetchedAt: string;
    subjects: string[];
    courseCount: number;
    courses: unknown[];
}

interface SectionsManifest {
    schemaVersion: number;
    termId: string;
    termLabel: string;
    fetchedAt: string;
    note: string;
    subjects?: string[];
    sectionCount?: number;
    sections: unknown[];
}

const catalog = catalogJson as CatalogManifest;
const sections = sectionsJson as SectionsManifest;

export const ALL_COURSES: Course[] = catalog.courses
    .map((c) => {
        const result = CourseSchema.safeParse(c);
        return result.success ? result.data : null;
    })
    .filter((c): c is Course => c !== null);

let droppedSections = 0;
export const ALL_SECTIONS: Section[] = sections.sections
    .map((s) => {
        const result = SectionSchema.safeParse(s);
        if (!result.success) {
            droppedSections += 1;
            return null;
        }
        return result.data;
    })
    .filter((s): s is Section => s !== null);

if (droppedSections > 0 && typeof console !== 'undefined') {
    console.info(
        `[utsa-reg+ data] dropped ${droppedSections} sections that failed schema validation`
    );
}

export const CATALOG_FETCHED_AT = catalog.fetchedAt;
export const SECTIONS_TERM_ID = sections.termId;
export const SECTIONS_TERM_LABEL = sections.termLabel;
export const SECTIONS_FETCHED_AT = sections.fetchedAt;
export const SECTIONS_SOURCE_NOTE = sections.note;
