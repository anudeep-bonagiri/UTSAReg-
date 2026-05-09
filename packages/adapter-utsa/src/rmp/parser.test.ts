import { describe, it, expect } from 'vitest';
import { parseRmpTeacher } from './parser.js';
import type { RmpTeacherNode } from './types.js';

const node = (overrides: Partial<RmpTeacherNode> = {}): RmpTeacherNode => ({
    id: 'VGVhY2hlci0xMjM=',
    legacyId: 123,
    firstName: 'Murtuza',
    lastName: 'Jadliwala',
    department: 'Computer Science',
    avgRating: 4.8,
    numRatings: 45,
    avgDifficulty: 3.2,
    wouldTakeAgainPercent: 92,
    school: { id: 'U2Nob29sLTExOTg=', name: 'University of Texas at San Antonio' },
    ...overrides
});

describe('parseRmpTeacher', () => {
    it('translates a complete node into a valid RmpRating', () => {
        const result = parseRmpTeacher(node());
        expect(result.data.name).toBe('Murtuza Jadliwala');
        expect(result.data.instructorId).toBe('murtuza-jadliwala');
        expect(result.data.avgRating).toBe(4.8);
        expect(result.data.numRatings).toBe(45);
        expect(result.data.avgDifficulty).toBe(3.2);
        expect(result.data.wouldTakeAgainPercent).toBe(92);
        expect(result.freshness.source).toBe('live');
        expect(result.freshness.maxAgeMs).toBe(60 * 60 * 1000);
    });

    it('drops -1 sentinel values for difficulty and wouldTakeAgain', () => {
        const result = parseRmpTeacher(node({ avgDifficulty: -1, wouldTakeAgainPercent: -1 }));
        expect(result.data.avgDifficulty).toBeUndefined();
        expect(result.data.wouldTakeAgainPercent).toBeUndefined();
    });

    it('handles null department gracefully (becomes empty string)', () => {
        const result = parseRmpTeacher(node({ department: null }));
        expect(result.data.department).toBe('');
    });

    it('falls back to id when legacyId is null', () => {
        const result = parseRmpTeacher(node({ legacyId: null }));
        expect(result.data.legacyId).toBe('VGVhY2hlci0xMjM=');
    });

    it('handles teachers with no ratings (avgRating null/0)', () => {
        const result = parseRmpTeacher(node({ avgRating: null, numRatings: 0 }));
        expect(result.data.avgRating).toBe(0);
        expect(result.data.numRatings).toBe(0);
    });

    it('produces a hyphenated lowercase instructorId', () => {
        const result = parseRmpTeacher(node({ firstName: 'Zein', lastName: 'Najem' }));
        expect(result.data.instructorId).toBe('zein-najem');
    });

    it('handles single-token names by repeating the token', () => {
        const result = parseRmpTeacher(node({ firstName: '', lastName: 'Cher' }));
        expect(result.data.instructorId).toBe('cher-cher');
    });
});
