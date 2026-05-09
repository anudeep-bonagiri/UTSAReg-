import { describe, it, expect } from 'vitest';
import { formatRelativeFreshness, FreshnessSchema, isStale, liveNow } from './freshness.js';

const baseNow = new Date('2026-05-09T12:00:00.000Z').getTime();

describe('formatRelativeFreshness', () => {
    it('returns "just now" for very recent timestamps', () => {
        expect(formatRelativeFreshness('2026-05-09T11:59:55.000Z', baseNow)).toBe('just now');
        expect(formatRelativeFreshness('2026-05-09T12:00:00.000Z', baseNow)).toBe('just now');
    });

    it('handles future timestamps gracefully', () => {
        expect(formatRelativeFreshness('2026-05-09T12:01:00.000Z', baseNow)).toBe('just now');
    });

    it('formats seconds, minutes, hours, days, weeks, months', () => {
        expect(formatRelativeFreshness('2026-05-09T11:59:30.000Z', baseNow)).toBe('30s ago');
        expect(formatRelativeFreshness('2026-05-09T11:55:00.000Z', baseNow)).toBe('5 min ago');
        expect(formatRelativeFreshness('2026-05-09T09:00:00.000Z', baseNow)).toBe('3h ago');
        expect(formatRelativeFreshness('2026-05-07T12:00:00.000Z', baseNow)).toBe('2d ago');
        expect(formatRelativeFreshness('2026-05-01T12:00:00.000Z', baseNow)).toBe('1w ago');
        expect(formatRelativeFreshness('2026-02-09T12:00:00.000Z', baseNow)).toBe('2mo ago');
    });

    it('falls through to years for very old data', () => {
        // 2025-05-09 → 2026-05-09 = ~365d, just under 1y by integer days/365
        expect(formatRelativeFreshness('2025-05-09T12:00:00.000Z', baseNow)).toBe('1y ago');
        // 2024-05-09 → 2026-05-09 ≈ 731d → 2 years
        expect(formatRelativeFreshness('2024-05-09T12:00:00.000Z', baseNow)).toBe('2y ago');
    });
});

describe('isStale', () => {
    const freshAt = '2026-05-09T11:50:00.000Z'; // 10 min before baseNow

    it('returns false for snapshot data regardless of age', () => {
        expect(
            isStale({ source: 'snapshot', fetchedAt: '2025-01-01T00:00:00.000Z' }, baseNow)
        ).toBe(false);
    });

    it('returns true when entry is past its TTL', () => {
        expect(isStale({ source: 'live', fetchedAt: freshAt, maxAgeMs: 60_000 }, baseNow)).toBe(
            true
        );
    });

    it('returns false when entry is still within TTL', () => {
        expect(
            isStale({ source: 'live', fetchedAt: freshAt, maxAgeMs: 30 * 60_000 }, baseNow)
        ).toBe(false);
    });

    it('returns false with no TTL specified (no policy = not stale)', () => {
        expect(isStale({ source: 'live', fetchedAt: freshAt }, baseNow)).toBe(false);
    });

    it('always reports cache-stale entries as stale', () => {
        expect(isStale({ source: 'cache-stale', fetchedAt: freshAt }, baseNow)).toBe(true);
    });
});

describe('liveNow', () => {
    it('wraps a value with source=live and current timestamp', () => {
        const result = liveNow({ ok: true });
        expect(result.data).toEqual({ ok: true });
        expect(result.freshness.source).toBe('live');
        expect(() => FreshnessSchema.parse(result.freshness)).not.toThrow();
    });

    it('includes maxAgeMs when provided', () => {
        const result = liveNow({}, 60_000);
        expect(result.freshness.maxAgeMs).toBe(60_000);
    });

    it('omits maxAgeMs when not provided', () => {
        const result = liveNow({});
        expect(result.freshness.maxAgeMs).toBeUndefined();
    });
});
