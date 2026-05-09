import { describe, it, expect } from 'vitest';
import { formatDays, formatDaysLong, formatTimeOfDay, formatTimeRange } from './format.js';

describe('formatTimeOfDay', () => {
    it.each<[number, string]>([
        [0, '12:00 AM'],
        [60, '1:00 AM'],
        [540, '9:00 AM'],
        [720, '12:00 PM'],
        [780, '1:00 PM'],
        [1439, '11:59 PM']
    ])('%d -> %s', (mins, expected) => {
        expect(formatTimeOfDay(mins)).toBe(expected);
    });

    it('lowercases meridian when requested', () => {
        expect(formatTimeOfDay(540, true)).toBe('9:00 am');
    });
});

describe('formatTimeRange', () => {
    it('uses an en-dash separator', () => {
        expect(formatTimeRange(540, 600)).toBe('9:00 AM – 10:00 AM');
    });
});

describe('formatDays', () => {
    it('joins single letters', () => {
        expect(formatDays(['M', 'W', 'F'])).toBe('MWF');
        expect(formatDays(['T', 'R'])).toBe('TR');
    });
});

describe('formatDaysLong', () => {
    it('renders comma-separated long names', () => {
        expect(formatDaysLong(['M', 'W', 'F'])).toBe('Mon, Wed, Fri');
        expect(formatDaysLong(['T', 'R'])).toBe('Tue, Thu');
    });
});
