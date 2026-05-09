import { describe, it, expect } from 'vitest';
import { levenshtein, scoreCandidate, pickBestTeacher } from './match.js';

describe('levenshtein', () => {
    it('returns 0 for identical strings', () => {
        expect(levenshtein('Najem', 'Najem')).toBe(0);
    });

    it('counts a single substitution as 1', () => {
        expect(levenshtein('cat', 'bat')).toBe(1);
    });

    it('counts insertion / deletion as 1', () => {
        expect(levenshtein('cat', 'cats')).toBe(1);
        expect(levenshtein('cats', 'cat')).toBe(1);
    });

    it('handles empty strings', () => {
        expect(levenshtein('', 'abc')).toBe(3);
        expect(levenshtein('abc', '')).toBe(3);
        expect(levenshtein('', '')).toBe(0);
    });

    it('handles longer real-world names', () => {
        expect(levenshtein('Murtuza Jadliwala', 'Murtuza Jadliwala')).toBe(0);
        expect(levenshtein('John Smith', 'Jon Smyth')).toBe(2);
    });
});

describe('scoreCandidate', () => {
    it('returns 0 for an exact match', () => {
        expect(
            scoreCandidate('Najem Z', { firstName: 'Najem', lastName: 'Z', numRatings: 0 })
        ).toBe(0);
    });

    it('handles "First Last" candidate against "Last, First" query', () => {
        expect(
            scoreCandidate('Najem, Zein', {
                firstName: 'Zein',
                lastName: 'Najem',
                numRatings: 0
            })
        ).toBe(0);
    });

    it('penalizes name typos proportionally to query length', () => {
        const close = scoreCandidate('Murtuza Jadliwala', {
            firstName: 'Murtuza',
            lastName: 'Jadliwala',
            numRatings: 0
        });
        const off = scoreCandidate('Murtuza Jadliwala', {
            firstName: 'Marina',
            lastName: 'Smith',
            numRatings: 0
        });
        expect(close).toBeLessThan(off);
    });
});

describe('pickBestTeacher', () => {
    const candidates = [
        { firstName: 'Murtuza', lastName: 'Jadliwala', numRatings: 45 },
        { firstName: 'Murtaza', lastName: 'Jadhwala', numRatings: 200 }, // typo'd, more ratings
        { firstName: 'Mark', lastName: 'Smith', numRatings: 12 }
    ];

    it('returns undefined for empty candidate list', () => {
        expect(pickBestTeacher('Murtuza Jadliwala', [])).toBeUndefined();
    });

    it('prefers exact match over higher-rating-count fuzzy match', () => {
        const best = pickBestTeacher('Murtuza Jadliwala', candidates);
        expect(best?.firstName).toBe('Murtuza');
        expect(best?.lastName).toBe('Jadliwala');
    });

    it('breaks ties using numRatings (more reviews wins)', () => {
        const ties = [
            { firstName: 'A', lastName: 'B', numRatings: 1 },
            { firstName: 'A', lastName: 'B', numRatings: 50 }
        ];
        expect(pickBestTeacher('A B', ties)?.numRatings).toBe(50);
    });
});
