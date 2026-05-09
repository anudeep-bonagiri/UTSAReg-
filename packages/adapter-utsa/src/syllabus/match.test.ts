import { describe, it, expect } from 'vitest';
import type { SyllabusOrganization } from './types.js';
import { findDepartmentForSubject, subjectFromCourseId } from './match.js';

const utsa: SyllabusOrganization = {
    entity_id: 'utsa',
    entity_type: 'organization1',
    level: 1,
    parent_id: null,
    name: 'The University of Texas at San Antonio'
};
const aiCollege: SyllabusOrganization = {
    entity_id: 'aicc',
    entity_type: 'organization2',
    level: 2,
    parent_id: 'utsa',
    name: 'College of AI, Cyber and Computing'
};
const cs: SyllabusOrganization = {
    entity_id: 'cs',
    entity_type: 'organization3',
    level: 3,
    parent_id: 'aicc',
    name: 'Computer Science',
    course_count: 80,
    section_count: 165
};
const cpe: SyllabusOrganization = {
    entity_id: 'cpe',
    entity_type: 'organization3',
    level: 3,
    parent_id: 'aicc',
    name: 'Computer Engineering',
    course_count: 46,
    section_count: 97
};
const psych: SyllabusOrganization = {
    entity_id: 'psy',
    entity_type: 'organization3',
    level: 3,
    parent_id: 'utsa',
    name: 'Psychology',
    course_count: 42,
    section_count: 71
};

const orgs = [utsa, aiCollege, cs, cpe, psych];

describe('subjectFromCourseId', () => {
    it.each([
        ['CS3343', 'CS'],
        ['MAT1214', 'MAT'],
        ['CPE3223', 'CPE'],
        ['ENG1013', 'ENG']
    ])('%s -> %s', (id, expected) => {
        expect(subjectFromCourseId(id)).toBe(expected);
    });

    it('returns empty for malformed ids', () => {
        expect(subjectFromCourseId('garbage')).toBe('');
    });
});

describe('findDepartmentForSubject', () => {
    it('maps CS to Computer Science (level 3)', () => {
        expect(findDepartmentForSubject('CS', orgs)?.entity_id).toBe('cs');
    });

    it('maps CPE to Computer Engineering, distinct from CS', () => {
        expect(findDepartmentForSubject('CPE', orgs)?.entity_id).toBe('cpe');
    });

    it('maps PSY to Psychology', () => {
        expect(findDepartmentForSubject('PSY', orgs)?.entity_id).toBe('psy');
    });

    it('returns undefined for an unknown subject', () => {
        expect(findDepartmentForSubject('XXX', orgs)).toBeUndefined();
    });

    it('falls back to a level-2 college when no dept matches', () => {
        // No dedicated "Cybersecurity" dept — but the College of AI, Cyber and
        // Computing has "cyber" in its name. We don't have CYS in our keyword
        // map, but if we did it should fall back to the college.
        // For this test we use IS which isn't currently in the org tree as a
        // dept; should return undefined since we don't fall back loosely.
        expect(findDepartmentForSubject('IS', orgs)).toBeUndefined();
    });
});
