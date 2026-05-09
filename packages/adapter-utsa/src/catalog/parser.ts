import { CourseSchema, type Course } from '@utsaregplus/core';

/**
 * Parse a catalog.utsa.edu course-descriptions HTML page into structured
 * Course records.
 *
 * Page DOM (as of May 2026):
 *   <div class="courseblock">
 *     <p class="courseblocktitle"><strong>SUBJ&#160;NUM. Title. (lec-lab) credits Credit Hours. (TCCN ...) </strong></p>
 *     <p class="courseblockdesc">Free-text including <a class="bubblelink"> prereq references</a></p>
 *   </div>
 *
 * Pure function — no network. The scraper fetches HTML; we just parse.
 */

const decodeEntities = (s: string): string =>
    s
        .replace(/&#160;/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

const stripTags = (s: string): string => s.replace(/<[^>]+>/g, '');
const collapseWs = (s: string): string => s.replace(/\s+/g, ' ').trim();

const COURSEBLOCK_RE = /<div class="courseblock"[^>]*>([\s\S]*?)<\/div>/g;
const TITLE_BLOCK_RE = /<p class="courseblocktitle"><strong>([\s\S]*?)<\/strong><\/p>/;
const DESC_BLOCK_RE = /<p class="courseblockdesc">([\s\S]*?)<\/p>/;

/**
 * Extract subject / number / title / credit hours from the courseblocktitle
 * text. Two common shapes:
 *   "CS 1063. Introduction to Computer Programming I. (3-0) 3 Credit Hours."
 *   "CS 1083. Programming I for Computer Scientists. (3-0) 3 Credit Hours. (TCCN = COSC 1336)"
 */
const TITLE_RE =
    /^([A-Z]{2,4})\s+(\d{4})\.\s+(.+?)\.\s+(?:\([^)]+\)\s+)?(\d+(?:\.\d+)?)\s+Credit\s+Hours/i;

export interface ParseCatalogOptions {
    /** Restrict output to a single subject (e.g. "CS"). Default: keep all. */
    expectedSubject?: string;
    /** Print warnings for skipped/invalid entries. Default: silent. */
    warn?: (msg: string) => void;
}

export const parseCatalogHtml = (
    html: string,
    options: ParseCatalogOptions = {}
): Course[] => {
    const courses: Course[] = [];
    const warn = options.warn;
    const expected = options.expectedSubject;

    let match: RegExpExecArray | null;
    COURSEBLOCK_RE.lastIndex = 0;
    while ((match = COURSEBLOCK_RE.exec(html)) !== null) {
        const block = match[1];
        if (!block) continue;
        const titleMatch = TITLE_BLOCK_RE.exec(block);
        if (!titleMatch?.[1]) continue;
        const titleRaw = collapseWs(decodeEntities(titleMatch[1]));
        const titleParts = TITLE_RE.exec(titleRaw);
        if (!titleParts) {
            warn?.(`[catalog] could not parse title: ${titleRaw.slice(0, 80)}`);
            continue;
        }
        const subject = titleParts[1] ?? '';
        const number = titleParts[2] ?? '';
        const title = titleParts[3] ?? '';
        const credits = titleParts[4] ?? '0';
        if (expected && subject !== expected) continue;

        const descMatch = DESC_BLOCK_RE.exec(block);
        const description = descMatch?.[1]
            ? collapseWs(decodeEntities(stripTags(descMatch[1])))
            : '';

        // First-sentence "Prerequisite(s):" extraction. Catalog also uses
        // "Prerequisite:" (singular) and occasionally "Prerequisites and ..."
        const prereqMatch = /^Prerequisites?[^:]*:\s*([^.]+(?:\.\s+[^.A-Z][^.]*)*)\.?/.exec(
            description
        );
        const prereqsRaw = prereqMatch?.[1]?.trim() ?? '';

        const numericNumber = parseInt(number, 10);
        const level: Course['level'] = numericNumber >= 5000 ? 'graduate' : 'undergraduate';

        try {
            const course = CourseSchema.parse({
                id: `${subject}${number}`,
                subject,
                number,
                title,
                description,
                creditHours: parseFloat(credits),
                prereqsRaw,
                level
            });
            courses.push(course);
        } catch (err) {
            warn?.(
                `[catalog] schema rejected ${subject} ${number}: ${
                    err instanceof Error ? err.message : 'unknown'
                }`
            );
        }
    }
    return courses;
};
