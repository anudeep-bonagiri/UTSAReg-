import { describe, it, expect } from 'vitest';
import { SectionSchema, type Section } from '../schemas/section.js';
import {
    findAllConflicts,
    findConflictsAgainst,
    meetingsConflict,
    sectionsConflict,
    totalCreditHours
} from './conflicts.js';

const meet = (days: string[], startMin: number, endMin: number) => ({
    days: days as ('M' | 'T' | 'W' | 'R' | 'F' | 'S' | 'U')[],
    startMin,
    endMin,
    location: ''
});

const section = (crn: string, meetings: ReturnType<typeof meet>[]): Section =>
    SectionSchema.parse({
        crn,
        termId: '202650',
        courseId: 'CS3343',
        sectionCode: '001',
        title: 'Algorithms',
        meetings,
        creditHours: 3
    });

describe('meetingsConflict', () => {
    it('detects same-day overlap', () => {
        expect(meetingsConflict(meet(['M', 'W'], 540, 600), meet(['M'], 570, 630))).toBe(true);
    });

    it('does not flag same time on different days', () => {
        expect(meetingsConflict(meet(['M'], 540, 600), meet(['T'], 540, 600))).toBe(false);
    });

    it('treats touching boundaries as non-conflict', () => {
        // 9:00-9:50 and 9:50-10:40 share the same endpoint — back-to-back, no overlap.
        expect(meetingsConflict(meet(['M'], 540, 590), meet(['M'], 590, 640))).toBe(false);
    });

    it('finds 1-minute overlap', () => {
        expect(meetingsConflict(meet(['M'], 540, 591), meet(['M'], 590, 640))).toBe(true);
    });
});

describe('sectionsConflict', () => {
    it('cross-products meeting blocks (lecture vs lab)', () => {
        const lecture = section('10001', [meet(['M', 'W', 'F'], 540, 590)]);
        const labConflict = section('10002', [
            meet(['T'], 0, 60), // unrelated
            meet(['M'], 570, 660) // overlaps the lecture
        ]);
        expect(sectionsConflict(lecture, labConflict)).toBe(true);
    });

    it('returns false for the same CRN', () => {
        const s = section('10001', [meet(['M'], 540, 600)]);
        expect(sectionsConflict(s, s)).toBe(false);
    });
});

describe('findAllConflicts', () => {
    it('lists every conflicting pair, deduped, lex-sorted', () => {
        const a = section('10001', [meet(['M'], 540, 600)]);
        const b = section('10002', [meet(['M'], 570, 630)]); // conflicts with a
        const c = section('10003', [meet(['T'], 540, 600)]); // conflicts with neither
        const pairs = findAllConflicts([a, b, c]);
        expect(pairs).toEqual([{ a: '10001', b: '10002' }]);
    });

    it('handles empty input', () => {
        expect(findAllConflicts([])).toEqual([]);
    });
});

describe('findConflictsAgainst', () => {
    it('returns CRNs of candidates that conflict with anything in the committed set', () => {
        const committed = [section('10001', [meet(['M', 'W', 'F'], 540, 600)])];
        const candidates = [
            section('20001', [meet(['M'], 570, 630)]), // conflict
            section('20002', [meet(['T', 'R'], 540, 600)]), // ok
            section('20003', [meet(['F'], 540, 600)]) // conflict
        ];
        const conflicting = findConflictsAgainst(committed, candidates);
        expect(Array.from(conflicting).sort()).toEqual(['20001', '20003']);
    });
});

describe('totalCreditHours', () => {
    it('sums explicit credit hours', () => {
        const a = section('10001', []);
        const b = section('10002', []);
        expect(totalCreditHours([a, b])).toBe(6); // both creditHours: 3
    });

    it('falls back to 3 when not specified', () => {
        const noCredits = SectionSchema.parse({
            crn: '99999',
            termId: '202650',
            courseId: 'CS1063',
            sectionCode: '001',
            title: 'X',
            meetings: []
        });
        expect(totalCreditHours([noCredits])).toBe(3);
    });
});
