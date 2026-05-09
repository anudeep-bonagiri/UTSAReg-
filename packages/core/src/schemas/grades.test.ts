import { describe, it, expect } from 'vitest';
import {
    GradeCountsSchema,
    GradeDistributionSchema,
    gpaFromCounts,
    passRateFromCounts,
    withdrawRateFromCounts
} from './grades.js';

const counts = (
    overrides: Partial<{
        A: number;
        B: number;
        C: number;
        D: number;
        F: number;
        W: number;
        Q: number;
        other: number;
    }> = {}
) =>
    GradeCountsSchema.parse({
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        F: 0,
        W: 0,
        Q: 0,
        other: 0,
        ...overrides
    });

describe('gpaFromCounts', () => {
    it('returns null when there are no graded students', () => {
        expect(gpaFromCounts(counts())).toBeNull();
        expect(gpaFromCounts(counts({ W: 5 }))).toBeNull();
    });

    it('weights letters by the standard 4.0 scale', () => {
        const c = counts({ A: 10, B: 10 });
        expect(gpaFromCounts(c)).toBeCloseTo(3.5, 4);
    });

    it('ignores W/Q/other when computing GPA', () => {
        const c = counts({ A: 10, B: 10, W: 100, Q: 50, other: 30 });
        expect(gpaFromCounts(c)).toBeCloseTo(3.5, 4);
    });

    it('handles a balanced ABCDF spread', () => {
        const c = counts({ A: 1, B: 1, C: 1, D: 1, F: 1 });
        expect(gpaFromCounts(c)).toBeCloseTo(2.0, 4);
    });
});

describe('passRateFromCounts', () => {
    it('counts A/B/C as passing and D/F as not, ignoring W/Q', () => {
        const c = counts({ A: 30, B: 30, C: 15, D: 10, F: 5, W: 100 });
        // 75 passing of 90 letter-graded
        expect(passRateFromCounts(c)).toBeCloseTo(75 / 90, 4);
    });

    it('returns null with no letter grades', () => {
        expect(passRateFromCounts(counts())).toBeNull();
    });
});

describe('withdrawRateFromCounts', () => {
    it('returns the W+Q share of the total', () => {
        const c = counts({ A: 50, W: 50 });
        expect(withdrawRateFromCounts(c)).toBeCloseTo(0.5, 4);
    });

    it('returns null with no students at all', () => {
        expect(withdrawRateFromCounts(counts())).toBeNull();
    });
});

describe('GradeDistributionSchema', () => {
    it('parses a complete distribution', () => {
        expect(() =>
            GradeDistributionSchema.parse({
                courseId: 'CS3343',
                instructorId: 'najem-z',
                termId: '202650',
                counts: counts({ A: 30, B: 30, C: 15, D: 10, F: 5, W: 8 }),
                totalStudents: 98
            })
        ).not.toThrow();
    });

    it('allows omitting termId for aggregate distributions', () => {
        expect(() =>
            GradeDistributionSchema.parse({
                courseId: 'CS3343',
                instructorId: 'najem-z',
                counts: counts({ A: 30 }),
                totalStudents: 30
            })
        ).not.toThrow();
    });
});
