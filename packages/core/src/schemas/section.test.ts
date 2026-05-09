import { describe, it, expect } from 'vitest';
import { CrnSchema, MeetingSchema, SectionSchema, WeekdaySchema } from './section.js';

describe('CrnSchema', () => {
    it('accepts exactly 5 digits', () => {
        expect(() => CrnSchema.parse('19697')).not.toThrow();
        expect(() => CrnSchema.parse('00001')).not.toThrow();
    });

    it('rejects non-5-digit strings', () => {
        expect(() => CrnSchema.parse('1969')).toThrow();
        expect(() => CrnSchema.parse('196970')).toThrow();
        expect(() => CrnSchema.parse('1A697')).toThrow();
    });
});

describe('WeekdaySchema', () => {
    it('accepts UTSA single-letter codes', () => {
        for (const d of ['M', 'T', 'W', 'R', 'F', 'S', 'U']) {
            expect(() => WeekdaySchema.parse(d)).not.toThrow();
        }
    });

    it('rejects multi-letter or lowercase', () => {
        expect(() => WeekdaySchema.parse('Mon')).toThrow();
        expect(() => WeekdaySchema.parse('m')).toThrow();
    });
});

describe('MeetingSchema', () => {
    it('parses a valid MWF 9:00-9:50am block', () => {
        const m = MeetingSchema.parse({
            days: ['M', 'W', 'F'],
            startMin: 540,
            endMin: 590,
            location: 'NPB 1.120'
        });
        expect(m.endMin - m.startMin).toBe(50);
    });

    it('rejects end-before-start blocks', () => {
        expect(() => MeetingSchema.parse({ days: ['M'], startMin: 600, endMin: 540 })).toThrow();
    });

    it('rejects out-of-range minutes', () => {
        expect(() => MeetingSchema.parse({ days: ['M'], startMin: -10, endMin: 60 })).toThrow();
        expect(() => MeetingSchema.parse({ days: ['M'], startMin: 100, endMin: 1500 })).toThrow();
    });
});

describe('SectionSchema', () => {
    it('parses a minimal section and applies defaults', () => {
        const s = SectionSchema.parse({
            crn: '10184',
            termId: '202650',
            courseId: 'CS3343',
            sectionCode: '001',
            title: 'Design Analysis of Algorithms'
        });
        expect(s.instructorName).toBe('TBA');
        expect(s.modality).toBe('unspecified');
        expect(s.status).toBe('open');
        expect(s.meetings).toEqual([]);
    });

    it('round-trips through parse', () => {
        const input = {
            crn: '10184',
            termId: '202650',
            courseId: 'CS3343',
            sectionCode: '001',
            title: 'Design Analysis of Algorithms',
            instructorName: 'Najem Z',
            meetings: [
                { days: ['M', 'W', 'F'], startMin: 720, endMin: 770, location: 'NPB 1.120' }
            ],
            modality: 'in_person' as const,
            status: 'open' as const,
            capacity: 80,
            enrolled: 72,
            waitlistCount: 0,
            creditHours: 3
        };
        expect(SectionSchema.parse(input)).toMatchObject(input);
    });
});
