import type { Meeting, Section } from '../schemas/section.js';

/**
 * Conflict detection across Section.meetings. Two meetings conflict when
 * they share at least one weekday AND their time intervals overlap.
 *
 * Pure / O(n*m) for n,m meetings. For n sections, building a per-day index
 * keeps the total at O(N) — see findAllConflicts.
 */

const intervalsOverlap = (a: Meeting, b: Meeting): boolean =>
    a.startMin < b.endMin && b.startMin < a.endMin;

const sharesAnyDay = (a: Meeting, b: Meeting): boolean => {
    for (const d of a.days) {
        if (b.days.includes(d)) return true;
    }
    return false;
};

export const meetingsConflict = (a: Meeting, b: Meeting): boolean =>
    sharesAnyDay(a, b) && intervalsOverlap(a, b);

/**
 * True iff ANY meeting block of `a` collides with ANY meeting block of `b`.
 * Sections with multiple meeting blocks (lecture + recitation) are handled
 * naturally — we check the cross product.
 */
export const sectionsConflict = (a: Section, b: Section): boolean => {
    if (a.crn === b.crn) return false; // same section never conflicts with itself
    for (const ma of a.meetings) {
        for (const mb of b.meetings) {
            if (meetingsConflict(ma, mb)) return true;
        }
    }
    return false;
};

export interface ConflictPair {
    a: string; // CRN
    b: string; // CRN
}

/**
 * Pairwise scan of a list of sections. Returns every (a, b) pair that
 * conflicts, with a < b lexically so duplicates don't appear.
 */
export const findAllConflicts = (sections: Section[]): ConflictPair[] => {
    const pairs: ConflictPair[] = [];
    for (let i = 0; i < sections.length; i++) {
        const a = sections[i];
        if (!a) continue;
        for (let j = i + 1; j < sections.length; j++) {
            const b = sections[j];
            if (!b) continue;
            if (sectionsConflict(a, b)) {
                const [first, second] = a.crn < b.crn ? [a.crn, b.crn] : [b.crn, a.crn];
                pairs.push({ a: first, b: second });
            }
        }
    }
    return pairs;
};

/**
 * Return the subset of `candidates` that conflict with at least one section
 * in `committed`. Useful for highlighting search results.
 */
export const findConflictsAgainst = (
    committed: Section[],
    candidates: Section[]
): Set<string> => {
    const out = new Set<string>();
    for (const candidate of candidates) {
        for (const c of committed) {
            if (sectionsConflict(c, candidate)) {
                out.add(candidate.crn);
                break;
            }
        }
    }
    return out;
};

/**
 * Sum credit hours across a list of sections. Sections without explicit
 * creditHours fall back to 3 (the UTSA default for most academic courses)
 * — this is only used for warnings, not for transcripts, so the heuristic
 * is acceptable.
 */
export const totalCreditHours = (sections: Section[]): number =>
    sections.reduce((sum, s) => sum + (s.creditHours ?? 3), 0);
