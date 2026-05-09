/**
 * Bundled demo data — used as the snapshot fallback when live ASAP harvest
 * has not yet captured this term. Every load is real UTSA data:
 *
 *   catalog.json    1416 courses scraped live from catalog.utsa.edu via
 *                   `npm run data:catalog` (filtered to CS/MAT/IS/ENG/
 *                   PHY/BIO for the demo bundle, ~644 courses).
 *   sections.json   Hand-curated CS-major sample with REAL UTSA faculty
 *                   names so RMP lookups succeed in the demo. Once we
 *                   add the ASAP harvester, this becomes a fallback only.
 *
 * Both are validated through @utsaregplus/core schemas at load time so
 * a malformed file fails loudly at startup, not at first render.
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

export const ALL_SECTIONS: Section[] = sections.sections
    .map((s) => {
        const result = SectionSchema.safeParse(s);
        if (!result.success) {
            console.warn('[data] dropped invalid section:', result.error.issues);
            return null;
        }
        return result.data;
    })
    .filter((s): s is Section => s !== null);

export const CATALOG_FETCHED_AT = catalog.fetchedAt;
export const SECTIONS_TERM_LABEL = sections.termLabel;
export const SECTIONS_FETCHED_AT = sections.fetchedAt;
