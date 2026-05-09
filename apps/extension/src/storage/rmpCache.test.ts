import { describe, it, expect, beforeEach } from 'vitest';
import type { Fresh, RmpRating } from '@utsaregplus/core';
import {
    clearRmpCache,
    getCachedRating,
    getCachedSchoolId,
    setCachedRating,
    setCachedSchoolId
} from './rmpCache.js';

const sample: Fresh<RmpRating> = {
    data: {
        instructorId: 'murtuza-jadliwala',
        legacyId: '1234567',
        name: 'Murtuza Jadliwala',
        department: 'Computer Science',
        avgRating: 4.8,
        numRatings: 45,
        avgDifficulty: 3.2,
        wouldTakeAgainPercent: 92,
        tags: [],
        fetchedAt: '2026-05-09T22:00:00.000Z'
    },
    freshness: {
        source: 'live',
        fetchedAt: '2026-05-09T22:00:00.000Z',
        maxAgeMs: 60 * 60 * 1000
    }
};

describe('rmpCache', () => {
    beforeEach(async () => {
        await clearRmpCache();
    });

    it('miss returns null', async () => {
        expect(await getCachedRating('Nobody Here')).toBeNull();
    });

    it('hit within TTL returns cache-fresh', async () => {
        await setCachedRating('Murtuza Jadliwala', sample);
        const now = new Date('2026-05-09T22:30:00.000Z').getTime(); // 30 min later
        const got = await getCachedRating('Murtuza Jadliwala', now);
        expect(got?.freshness.source).toBe('cache-fresh');
        expect(got?.data.avgRating).toBe(4.8);
    });

    it('hit past TTL returns cache-stale', async () => {
        await setCachedRating('Murtuza Jadliwala', sample);
        const now = new Date('2026-05-10T01:00:00.000Z').getTime(); // 3h later
        const got = await getCachedRating('Murtuza Jadliwala', now);
        expect(got?.freshness.source).toBe('cache-stale');
    });

    it('lookup is case-insensitive on instructor name', async () => {
        await setCachedRating('Murtuza Jadliwala', sample);
        expect(await getCachedRating('MURTUZA JADLIWALA')).not.toBeNull();
        expect(await getCachedRating('murtuza jadliwala')).not.toBeNull();
    });

    it('school ID round-trips', async () => {
        expect(await getCachedSchoolId()).toBeNull();
        await setCachedSchoolId('U2Nob29sLTE1MTY=');
        expect(await getCachedSchoolId()).toBe('U2Nob29sLTE1MTY=');
    });

    it('clearRmpCache wipes only rmp keys', async () => {
        await setCachedRating('A B', sample);
        await setCachedSchoolId('xyz');
        await chrome.storage.local.set({ unrelated: 'keep me' });
        await clearRmpCache();
        expect(await getCachedRating('A B')).toBeNull();
        expect(await getCachedSchoolId()).toBeNull();
        const result = await chrome.storage.local.get('unrelated');
        expect(result.unrelated).toBe('keep me');
    });
});
