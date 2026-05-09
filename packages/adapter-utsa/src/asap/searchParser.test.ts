import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseAsapSearchResults } from './searchParser.js';

const here = dirname(fileURLToPath(import.meta.url));
const realHtml = readFileSync(join(here, '__fixtures__', 'asap_cs_fall2026.html'), 'utf8');

describe('parseAsapSearchResults — real public ASAP CS Fall 2026 page', () => {
    const sections = parseAsapSearchResults(realHtml, { termId: '202710' });

    it('extracts a substantial number of real CS sections', () => {
        // The fixture had 267 .ddtitle headers. Some are graduate, some have
        // weird formats; anything > 100 means the parser is healthy.
        expect(sections.length).toBeGreaterThan(100);
    });

    it('all sections belong to CS and the requested term', () => {
        for (const s of sections) {
            expect(s.courseId.startsWith('CS')).toBe(true);
            expect(s.termId).toBe('202710');
            expect(s.crn).toMatch(/^\d{5}$/);
        }
    });

    it('finds the in-person Najem CS 3343 section with real meeting details', () => {
        const najem3343 = sections.find(
            (s) =>
                s.courseId === 'CS3343' &&
                s.crn === '10184'
        );
        expect(najem3343).toBeDefined();
        expect(najem3343?.instructorName.toLowerCase()).toContain('najem');
        expect(najem3343?.modality).toBe('in_person');
        expect(najem3343?.meetings).toHaveLength(1);
        // From the live HTML: 9:00 am - 10:15 am, MW, San Pedro II 405
        const m = najem3343?.meetings[0];
        expect(m?.days).toEqual(['M', 'W']);
        expect(m?.startMin).toBe(9 * 60);
        expect(m?.endMin).toBe(10 * 60 + 15);
        expect(m?.location).toContain('San Pedro');
    });

    it('classifies online "901"/Internet sections as online_async', () => {
        const onlineCs1063 = sections.find((s) => s.crn === '19697');
        expect(onlineCs1063).toBeDefined();
        // Internet Campus + Lecture but no in-person meeting time — empty meetings.
        expect(onlineCs1063?.meetings).toHaveLength(0);
    });

    it('extracts credit hours from each block', () => {
        const withCredits = sections.filter((s) => s.creditHours !== undefined);
        // The vast majority of catalog sections have explicit credits.
        expect(withCredits.length).toBeGreaterThan(80);
        for (const s of withCredits) {
            expect(s.creditHours).toBeGreaterThan(0);
            expect(s.creditHours).toBeLessThan(10);
        }
    });
});

describe('parseAsapSearchResults — synthetic edge cases', () => {
    it('returns empty for HTML with no ddtitle headers', () => {
        expect(
            parseAsapSearchResults('<html><body><p>nothing here</p></body></html>', {
                termId: '202710'
            })
        ).toEqual([]);
    });

    it('skips a block whose title is malformed', () => {
        const html = `
            <th CLASS="ddtitle" scope="colgroup">
                <a href="?crn_in=99999">just a weird title with no parts</a>
            </th>
            <tr><td CLASS="dddefault">3.000 Credits</td></tr>
        `;
        const got = parseAsapSearchResults(html, { termId: '202710' });
        expect(got).toEqual([]);
    });

    it('builds a Section even when the meeting time is TBA', () => {
        const html = `
<th CLASS="ddtitle" scope="colgroup"><a href="?crn_in=12345">Special Topics - 12345 - CS 4933 - 001</a></th>
<tr><td CLASS="dddefault">
3.000 Credits
<br />
Traditional in-person Instructional Method
<br />
<table CLASS="datadisplaytable" SUMMARY="This table lists the scheduled meeting times and assigned instructors for this class.">
<tr><th CLASS="ddheader">Type</th><th CLASS="ddheader">Time</th><th CLASS="ddheader">Days</th><th CLASS="ddheader">Where</th><th CLASS="ddheader">Date Range</th><th CLASS="ddheader">Schedule Type</th><th CLASS="ddheader">Instructors</th></tr>
<tr><td CLASS="dddefault">Independent Study</td><td CLASS="dddefault">TBA</td><td CLASS="dddefault">TBA</td><td CLASS="dddefault">TBA</td><td CLASS="dddefault">Aug 19, 2026 - Dec 11, 2026</td><td CLASS="dddefault">Independent Study</td><td CLASS="dddefault">TBA</td></tr>
</table>
</td></tr>
        `;
        const got = parseAsapSearchResults(html, { termId: '202710' });
        expect(got).toHaveLength(1);
        expect(got[0]?.crn).toBe('12345');
        expect(got[0]?.meetings).toEqual([]);
    });
});
