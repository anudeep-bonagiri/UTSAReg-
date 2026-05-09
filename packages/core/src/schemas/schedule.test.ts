import { describe, it, expect } from 'vitest';
import { SavedScheduleSchema, UserStateSchema } from './schedule.js';

describe('SavedScheduleSchema', () => {
    it('parses a minimal Plan A and applies defaults', () => {
        const s = SavedScheduleSchema.parse({
            id: 'plan-a',
            termId: '202650',
            createdAt: '2026-05-09T12:00:00Z',
            updatedAt: '2026-05-09T12:00:00Z'
        });
        expect(s.name).toBe('Untitled');
        expect(s.crns).toEqual([]);
        expect(s.alternateCrns).toEqual([]);
        expect(s.notes).toBe('');
    });

    it('rejects malformed CRNs in the list', () => {
        expect(() =>
            SavedScheduleSchema.parse({
                id: 'plan-a',
                termId: '202650',
                crns: ['10184', 'not-a-crn'],
                createdAt: '2026-05-09T12:00:00Z',
                updatedAt: '2026-05-09T12:00:00Z'
            })
        ).toThrow();
    });
});

describe('UserStateSchema', () => {
    it('parses an empty state', () => {
        const u = UserStateSchema.parse({ schemaVersion: 1 });
        expect(u.savedCourses).toEqual([]);
        expect(u.schedules).toEqual([]);
    });

    it('rejects an unsupported schemaVersion', () => {
        expect(() => UserStateSchema.parse({ schemaVersion: 99 })).toThrow();
    });
});
