import { SectionSchema, type Meeting, type Section } from '@utsaregplus/core';
import { parseDays, parseTimeRange } from '@utsaregplus/core';

/**
 * Parser for UTSA's PUBLIC Banner 8 dynamic schedule HTML.
 *
 *   URL: https://asap.utsa.edu/pls/prod/bwckschd.p_get_crse_unsec
 *
 * No login required. Real CRNs, real instructors, real times, real seat
 * counts (when shown). This is the data path that turns the demo from
 * "static snapshot" into "live UTSA sections."
 *
 * DOM contract (verified May 2026):
 *
 *   <th class="ddtitle">
 *     <a href="...crn_in=12345">Title - CRN - SUBJ NUM - SECTION</a>
 *   </th>
 *   <tr><td class="dddefault">
 *     {Term, Registration Dates, Levels, Attributes,
 *      Campus, Schedule Type, Instructional Method, Credits, ...}
 *     <table class="datadisplaytable">
 *       Type | Time | Days | Where | Date Range | Schedule Type | Instructors
 *     </table>
 *   </td></tr>
 *
 * Pure: no network, no DOM. Tests run offline against a saved fixture.
 */

const decodeEntities = (s: string): string =>
    s
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#160;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

const stripTags = (s: string): string => s.replace(/<[^>]+>/g, '');
const collapseWs = (s: string): string => s.replace(/\s+/g, ' ').trim();

/**
 * Rough block extractor. We can't rely on a real DOM here (the parser must
 * run in service workers / Node), so we walk the markup with regex anchored
 * on the .ddtitle headers. Each match is everything from one ddtitle to the
 * next (or end of document).
 */
const BLOCK_RE =
    /<th\s+CLASS="ddtitle"[^>]*>\s*<a[^>]*href="[^"]*crn_in=(\d+)[^"]*"[^>]*>([^<]+)<\/a>\s*<\/th>([\s\S]*?)(?=<th\s+CLASS="ddtitle"|$)/gi;

const TITLE_RE = /^(.+?)\s+-\s+(\d{5})\s+-\s+([A-Z]{2,4})\s+(\d{4}[A-Z]?)\s+-\s+(\S+)$/;

const CREDITS_RE = /([\d.]+)\s+Credits/i;
const INSTRUCTIONAL_METHOD_RE = /<br\s*\/?>\s*([^<\n]+?)\s+Instructional\s+Method\s*<br/i;

interface MeetingRow {
    type: string;
    time: string;
    days: string;
    where: string;
    dateRange: string;
    scheduleType: string;
    instructor: string;
}

const MEETING_TABLE_RE =
    /<table\s+CLASS="datadisplaytable"[^>]*SUMMARY="This table lists the scheduled meeting times[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
const MEETING_ROW_RE = /<tr>\s*<td\s+CLASS="dddefault">([\s\S]*?)<\/td>\s*<\/tr>/gi;
const CELL_RE = /<td\s+CLASS="dddefault">([\s\S]*?)<\/td>/gi;

const parseMeetingRows = (block: string): MeetingRow[] => {
    const tableMatch = MEETING_TABLE_RE.exec(block);
    if (!tableMatch?.[1]) return [];
    const tableHtml = tableMatch[1];
    const rows: MeetingRow[] = [];
    MEETING_ROW_RE.lastIndex = 0;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = MEETING_ROW_RE.exec(tableHtml)) !== null) {
        const rowHtml = `<td CLASS="dddefault">${rowMatch[1] ?? ''}</td>`;
        const cells: string[] = [];
        CELL_RE.lastIndex = 0;
        let cellMatch: RegExpExecArray | null;
        while ((cellMatch = CELL_RE.exec(rowHtml)) !== null) {
            cells.push(collapseWs(decodeEntities(stripTags(cellMatch[1] ?? ''))));
        }
        if (cells.length >= 7) {
            rows.push({
                type: cells[0] ?? '',
                time: cells[1] ?? '',
                days: cells[2] ?? '',
                where: cells[3] ?? '',
                dateRange: cells[4] ?? '',
                scheduleType: cells[5] ?? '',
                instructor: cells[6] ?? ''
            });
        }
    }
    return rows;
};

const cleanInstructor = (raw: string): string => {
    if (!raw) return 'TBA';
    // Strip the (P) "Primary" marker, mailto image alt-text, and TBA placeholders.
    const cleaned = raw
        .replace(/\(P\)/g, '')
        .replace(/\bE-mail\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleaned || cleaned === 'TBA') return 'TBA';
    return cleaned;
};

const inferModality = (instructionalMethod: string, where: string): Section['modality'] => {
    const im = instructionalMethod.toLowerCase();
    const w = where.toLowerCase();
    if (im.includes('fully online') || im.includes('asynchronous online')) return 'online_async';
    if (im.includes('synchronous online') || im.includes('online lecture')) return 'online_sync';
    if (im.includes('hybrid') || im.includes('blended')) return 'hybrid';
    if (im.includes('traditional in-person') || w.includes('campus') || w === 'tba')
        return 'in_person';
    return 'unspecified';
};

export interface ParseAsapSearchOptions {
    /** Term ID to attach to every parsed section (e.g. "202710"). */
    termId: string;
    /** Optional warn callback for logging skipped rows. */
    warn?: (msg: string) => void;
}

/**
 * Parse a full bwckschd.p_get_crse_unsec response into Section records.
 * Skips malformed blocks rather than throwing — partial results beat zero.
 */
export const parseAsapSearchResults = (
    html: string,
    options: ParseAsapSearchOptions
): Section[] => {
    const sections: Section[] = [];
    const warn = options.warn;
    BLOCK_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = BLOCK_RE.exec(html)) !== null) {
        const crn = match[1];
        const titleRaw = decodeEntities(match[2] ?? '');
        const block = match[3] ?? '';
        if (!crn) continue;

        const titleParts = TITLE_RE.exec(titleRaw.trim());
        if (!titleParts) {
            warn?.(`[asap] could not parse title: ${titleRaw}`);
            continue;
        }
        const title = (titleParts[1] ?? '').trim();
        const subject = (titleParts[3] ?? '').trim();
        const number = (titleParts[4] ?? '').trim();
        const sectionCode = (titleParts[5] ?? '').trim();

        const creditsMatch = CREDITS_RE.exec(block);
        const credits = creditsMatch ? parseFloat(creditsMatch[1] ?? '0') : undefined;

        const instructionalMethod = (INSTRUCTIONAL_METHOD_RE.exec(block)?.[1] ?? '').trim();

        const rows = parseMeetingRows(block);
        const meetings: Meeting[] = [];
        let primaryInstructor = 'TBA';
        let firstWhere = '';
        for (const row of rows) {
            if (row.instructor && row.instructor !== 'TBA') {
                primaryInstructor = cleanInstructor(row.instructor);
            }
            if (!firstWhere && row.where) firstWhere = row.where;
            // Time of "TBA" or empty days = skip the meeting (online/TBA blocks).
            if (!row.days || /^TBA$/i.test(row.time) || !row.time) continue;
            try {
                const days = parseDays(row.days);
                if (days.length === 0) continue;
                const range = parseTimeRange(row.time);
                meetings.push({
                    days,
                    startMin: range.startMin,
                    endMin: range.endMin,
                    location: row.where
                });
            } catch (err) {
                warn?.(
                    `[asap] meeting parse skipped (${crn}, ${row.days} ${row.time}): ${
                        err instanceof Error ? err.message : 'unknown'
                    }`
                );
            }
        }

        const modality = inferModality(instructionalMethod, firstWhere);

        try {
            const section = SectionSchema.parse({
                crn,
                termId: options.termId,
                courseId: `${subject}${number}`,
                sectionCode,
                title,
                instructorName: primaryInstructor,
                meetings,
                modality,
                status: 'open', // public dyn-sched does not expose status; harvester refines
                creditHours: credits
            });
            sections.push(section);
        } catch (err) {
            warn?.(
                `[asap] schema rejected ${subject} ${number} ${crn}: ${
                    err instanceof Error ? err.message : 'unknown'
                }`
            );
        }
    }
    return sections;
};
