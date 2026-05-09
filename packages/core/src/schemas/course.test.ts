import { describe, it, expect } from 'vitest';
import {
    CourseIdSchema,
    CourseNumberSchema,
    CourseSchema,
    SubjectSchema,
    courseIdOf
} from './course.js';

describe('SubjectSchema', () => {
    it.each(['CS', 'MAT', 'BIO', 'ESL', 'COE'])('accepts %s', (s) => {
        expect(() => SubjectSchema.parse(s)).not.toThrow();
    });

    it('rejects mixed case and non-letter chars', () => {
        expect(() => SubjectSchema.parse('cs')).toThrow();
        expect(() => SubjectSchema.parse('CS1')).toThrow();
    });
});

describe('CourseNumberSchema', () => {
    it('accepts 4-digit numbers', () => {
        expect(() => CourseNumberSchema.parse('3343')).not.toThrow();
        expect(() => CourseNumberSchema.parse('1063')).not.toThrow();
    });

    it('rejects 3-digit and 5-digit numbers', () => {
        expect(() => CourseNumberSchema.parse('334')).toThrow();
        expect(() => CourseNumberSchema.parse('33433')).toThrow();
    });
});

describe('courseIdOf', () => {
    it('joins subject + number into the canonical id', () => {
        expect(courseIdOf('CS', '3343')).toBe('CS3343');
        expect(courseIdOf('MAT', '1214')).toBe('MAT1214');
    });

    it('produces ids that pass CourseIdSchema', () => {
        expect(() => CourseIdSchema.parse(courseIdOf('CS', '3343'))).not.toThrow();
    });
});

describe('CourseSchema', () => {
    it('parses a minimal course and applies defaults', () => {
        const parsed = CourseSchema.parse({
            id: 'CS3343',
            subject: 'CS',
            number: '3343',
            title: 'Design and Analysis of Algorithms',
            creditHours: 3
        });
        expect(parsed.description).toBe('');
        expect(parsed.prereqsRaw).toBe('');
        expect(parsed.level).toBe('undergraduate');
        expect(parsed.crossListed).toEqual([]);
    });

    it('rejects negative or absurd credit hours', () => {
        const base = {
            id: 'CS3343',
            subject: 'CS',
            number: '3343',
            title: 'Algorithms'
        };
        expect(() => CourseSchema.parse({ ...base, creditHours: -1 })).toThrow();
        expect(() => CourseSchema.parse({ ...base, creditHours: 99 })).toThrow();
    });
});
