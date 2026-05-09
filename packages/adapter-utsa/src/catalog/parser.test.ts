import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseCatalogHtml } from './parser.js';

const here = dirname(fileURLToPath(import.meta.url));
const realCatalogHtml = readFileSync(
    join(here, '__fixtures__', 'cs_catalog_2026.html'),
    'utf8'
);

describe('parseCatalogHtml — real catalog.utsa.edu CS page', () => {
    const courses = parseCatalogHtml(realCatalogHtml, { expectedSubject: 'CS' });

    it('extracts a substantial number of CS courses', () => {
        // Catalog had 243 courseblock occurrences in the source HTML; some are
        // grad-level, some have variable credits we skip. Anything north of 50
        // means the parser is healthy.
        expect(courses.length).toBeGreaterThan(50);
    });

    it('every parsed course matches the CourseSchema', () => {
        for (const course of courses) {
            expect(course.subject).toBe('CS');
            expect(course.id).toMatch(/^CS\d{4}$/);
            expect(course.title.length).toBeGreaterThan(0);
            expect(course.creditHours).toBeGreaterThanOrEqual(0);
        }
    });

    it('finds CS 3343 (Algorithms) with the right title', () => {
        const algo = courses.find((c) => c.id === 'CS3343');
        expect(algo).toBeDefined();
        expect(algo?.title.toLowerCase()).toContain('algorithm');
        expect(algo?.creditHours).toBe(3);
    });

    it('captures the prerequisite line on a course that has one', () => {
        const ds = courses.find((c) => c.id === 'CS2123');
        expect(ds?.prereqsRaw.length).toBeGreaterThan(0);
        expect(ds?.prereqsRaw.toLowerCase()).toContain('cs 2113');
    });

    it('classifies levels correctly: this fixture is the undergrad page so all are UG', () => {
        // Fixture URL: /undergraduate/coursedescriptions/cs/ — graduate courses
        // live on a parallel /graduate/ URL we'll fetch separately at scrape time.
        for (const c of courses) {
            expect(c.level).toBe('undergraduate');
            expect(parseInt(c.number, 10)).toBeLessThan(5000);
        }
    });
});

describe('parseCatalogHtml — synthetic edge cases', () => {
    it('returns empty for a page with no courseblocks', () => {
        expect(parseCatalogHtml('<html><body><p>nothing</p></body></html>')).toEqual([]);
    });

    it('skips a courseblock with a malformed title', () => {
        const html = `
            <div class="courseblock">
                <p class="courseblocktitle"><strong>Garbage title without a number.</strong></p>
                <p class="courseblockdesc">whatever</p>
            </div>
        `;
        expect(parseCatalogHtml(html)).toEqual([]);
    });

    it('handles the (TCCN = ...) suffix without crashing', () => {
        const html = `
            <div class="courseblock">
                <p class="courseblocktitle"><strong>CS&#160;1083.  Programming I for Computer Scientists.  (3-0) 3 Credit Hours. (TCCN = COSC 1336)</strong></p>
                <p class="courseblockdesc">Prerequisite: <a class="bubblelink code">MAT&#160;1073</a> or equivalent. Intro to programming.</p>
            </div>
        `;
        const result = parseCatalogHtml(html);
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe('CS1083');
        expect(result[0]?.creditHours).toBe(3);
    });

    it('respects the expectedSubject filter', () => {
        const html = `
            <div class="courseblock">
                <p class="courseblocktitle"><strong>CS&#160;1063.  Intro.  (3-0) 3 Credit Hours.</strong></p>
                <p class="courseblockdesc">desc</p>
            </div>
            <div class="courseblock">
                <p class="courseblocktitle"><strong>MAT&#160;1214.  Calculus I.  (3-0) 4 Credit Hours.</strong></p>
                <p class="courseblockdesc">calc</p>
            </div>
        `;
        const cs = parseCatalogHtml(html, { expectedSubject: 'CS' });
        expect(cs).toHaveLength(1);
        expect(cs[0]?.id).toBe('CS1063');
    });
});
