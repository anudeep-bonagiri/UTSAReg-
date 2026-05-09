import { describe, it, expect } from 'vitest';
import { TermIdSchema, TermSchema } from './term.js';

describe('TermIdSchema', () => {
    it('accepts the Banner six-digit format', () => {
        expect(() => TermIdSchema.parse('202650')).not.toThrow();
        expect(() => TermIdSchema.parse('202610')).not.toThrow();
        expect(() => TermIdSchema.parse('202630')).not.toThrow();
    });

    it('rejects bad lengths and non-digit suffixes', () => {
        expect(() => TermIdSchema.parse('20265')).toThrow();
        expect(() => TermIdSchema.parse('2026-50')).toThrow();
        expect(() => TermIdSchema.parse('Fall26')).toThrow();
    });

    it('rejects unknown season codes', () => {
        expect(() => TermIdSchema.parse('202699')).toThrow();
    });
});

describe('TermSchema', () => {
    it('parses a fully-specified term', () => {
        const parsed = TermSchema.parse({
            id: '202650',
            label: 'Fall 2026',
            season: 'Fall',
            year: 2026,
            startDate: '2026-08-24',
            endDate: '2026-12-12'
        });
        expect(parsed.label).toBe('Fall 2026');
    });

    it('rejects out-of-range years', () => {
        expect(() =>
            TermSchema.parse({ id: '199950', label: 'Fall 1999', season: 'Fall', year: 1999 })
        ).toThrow();
    });
});
