import { describe, it, expect } from 'vitest';
import { parseDays, parseTimeOfDay, parseTimeRange, buildMeeting } from './parse.js';

describe('parseDays', () => {
    it.each([
        ['MWF', ['M', 'W', 'F']],
        ['TR', ['T', 'R']],
        ['TTh', ['T', 'R']],
        ['MTuW', ['M', 'T', 'W']],
        ['MTuWThF', ['M', 'T', 'W', 'R', 'F']],
        ['M', ['M']],
        ['', []],
        ['Internet', []],
        ['Online', []],
        ['M-F', ['M', 'T', 'W', 'R', 'F']],
        ['T-R', ['T', 'W', 'R']]
    ])('parses "%s" as %j', (input, expected) => {
        expect(parseDays(input)).toEqual(expected);
    });

    it('throws on garbage tokens', () => {
        expect(() => parseDays('X')).toThrow(/unrecognized/);
    });
});

describe('parseTimeOfDay', () => {
    it.each<[string, number]>([
        ['9:00am', 540],
        ['9:00 AM', 540],
        ['12:00pm', 720],
        ['12:30pm', 750],
        ['1:00pm', 780],
        ['11:50pm', 23 * 60 + 50],
        ['12:00am', 0],
        ['09:00am', 540],
        ['9am', 540],
        ['9 a.m.', 540]
    ])('parses "%s" as %d minutes', (input, expected) => {
        expect(parseTimeOfDay(input)).toBe(expected);
    });

    it('rejects nonsense', () => {
        expect(() => parseTimeOfDay('25:00am')).toThrow();
        expect(() => parseTimeOfDay('hello')).toThrow();
    });
});

describe('parseTimeRange', () => {
    it('parses fully-qualified ranges', () => {
        expect(parseTimeRange('9:00am-9:50am')).toEqual({ startMin: 540, endMin: 590 });
        expect(parseTimeRange('11:00 am-12:15 pm')).toEqual({ startMin: 660, endMin: 735 });
    });

    it('infers a missing start meridian from the end', () => {
        expect(parseTimeRange('9:00-9:50am')).toEqual({ startMin: 540, endMin: 590 });
        expect(parseTimeRange('1:00-2:15pm')).toEqual({ startMin: 780, endMin: 14 * 60 + 15 });
    });

    it('handles cross-meridian ranges (11:30am-1:00pm)', () => {
        expect(parseTimeRange('11:30-1:00pm')).toEqual({ startMin: 690, endMin: 780 });
    });

    it('rejects end-before-start', () => {
        expect(() => parseTimeRange('10:00am-9:00am')).toThrow(/not after start/);
    });

    it('rejects "Internet"/"TBA"', () => {
        expect(() => parseTimeRange('Internet')).toThrow();
        expect(() => parseTimeRange('TBA')).toThrow();
    });
});

describe('buildMeeting', () => {
    it('builds a Meeting from valid inputs', () => {
        const m = buildMeeting('MWF', '12:00-12:50pm', 'NPB 1.120');
        expect(m).toEqual({
            days: ['M', 'W', 'F'],
            startMin: 720,
            endMin: 770,
            location: 'NPB 1.120'
        });
    });

    it('returns null for online/TBA sections', () => {
        expect(buildMeeting('Internet', 'Internet')).toBeNull();
        expect(buildMeeting('', '')).toBeNull();
    });
});
