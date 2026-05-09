import type { SyllabusOrganization } from './types.js';

/**
 * Map a UTSA subject prefix to the most likely Simple Syllabus organization.
 *
 * Simple Syllabus organizes UTSA into 73 entities — colleges (level 2),
 * departments (level 3), and a few sub-units. Subject codes don't appear
 * in the org records themselves, so we map by department name keyword.
 *
 * The mapping is empirical: we keep the keyword most likely to find the
 * right department in a substring search. Entries below 95% confidence
 * are deliberately omitted; the dialog falls back to the parent college.
 */
const SUBJECT_KEYWORDS: Record<string, string[]> = {
    CS: ['computer science'],
    CPE: ['computer engineering'],
    EE: ['electrical engineering'],
    IS: ['information systems', 'information technology'],
    MAT: ['mathematics'],
    STA: ['statistics'],
    BIO: ['biology', 'biological'],
    CHE: ['chemistry'],
    PHY: ['physics'],
    ENG: ['english'],
    HIS: ['history'],
    POL: ['political science'],
    PSY: ['psychology'],
    ECO: ['economics'],
    COM: ['communication']
};

const norm = (s: string): string => s.toLowerCase();

export const findDepartmentForSubject = (
    subject: string,
    orgs: SyllabusOrganization[]
): SyllabusOrganization | undefined => {
    const keywords = SUBJECT_KEYWORDS[subject];
    if (!keywords) return undefined;
    // Prefer level-3 (departments). Fall back to level-2 (colleges) if no dept matches.
    const departments = orgs.filter((o) => o.level === 3);
    for (const kw of keywords) {
        const hit = departments.find((d) => norm(d.name).includes(kw));
        if (hit) return hit;
    }
    const colleges = orgs.filter((o) => o.level === 2);
    for (const kw of keywords) {
        const hit = colleges.find((c) => norm(c.name).includes(kw));
        if (hit) return hit;
    }
    return undefined;
};

/**
 * Pull a UTSA subject (e.g. "CS") off a CourseId ("CS3343").
 */
export const subjectFromCourseId = (courseId: string): string => {
    const match = /^([A-Z]{2,4})\d+$/.exec(courseId);
    return match?.[1] ?? '';
};
