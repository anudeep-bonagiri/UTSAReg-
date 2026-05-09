import { describe, it, expect } from 'vitest';
import { InstructorIdSchema, InstructorSchema, RmpRatingSchema } from './instructor.js';

describe('InstructorIdSchema', () => {
    it('accepts lowercase-hyphenated ids', () => {
        expect(() => InstructorIdSchema.parse('murtuza-jadliwala')).not.toThrow();
        expect(() => InstructorIdSchema.parse('rajendra-boppana')).not.toThrow();
    });

    it('rejects single-token ids', () => {
        expect(() => InstructorIdSchema.parse('jadliwala')).toThrow();
    });

    it('rejects mixed case or whitespace', () => {
        expect(() => InstructorIdSchema.parse('Murtuza-Jadliwala')).toThrow();
        expect(() => InstructorIdSchema.parse('murtuza jadliwala')).toThrow();
    });
});

describe('InstructorSchema', () => {
    it('parses a minimal instructor', () => {
        const i = InstructorSchema.parse({ id: 'najem-z', name: 'Z. Najem' });
        expect(i.department).toBe('');
        expect(i.title).toBe('');
    });
});

describe('RmpRatingSchema', () => {
    it('parses a complete rating snapshot', () => {
        expect(() =>
            RmpRatingSchema.parse({
                instructorId: 'murtuza-jadliwala',
                legacyId: '2345678',
                name: 'Murtuza Jadliwala',
                department: 'Computer Science',
                avgRating: 4.8,
                numRatings: 45,
                avgDifficulty: 3.2,
                wouldTakeAgainPercent: 92,
                tags: ['Tough grader', 'Inspirational'],
                fetchedAt: '2026-05-09T12:00:00Z'
            })
        ).not.toThrow();
    });

    it('rejects ratings outside 0-5', () => {
        const base = {
            instructorId: 'murtuza-jadliwala',
            legacyId: 'x',
            name: 'M. J.',
            avgRating: 4.0,
            numRatings: 1,
            fetchedAt: '2026-05-09T12:00:00Z'
        };
        expect(() => RmpRatingSchema.parse({ ...base, avgRating: 5.5 })).toThrow();
        expect(() => RmpRatingSchema.parse({ ...base, avgRating: -0.1 })).toThrow();
    });
});
