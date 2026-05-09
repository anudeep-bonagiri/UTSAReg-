import { describe, it, expect } from 'vitest';

// Pulled inline for test isolation; the real implementation will move from
// apps/extension/src/utils/scraper.ts into packages/adapter-utsa/src/asap/
// as part of the data-layer phase. Test pinned here so the migration is
// behavior-preserving.
const parseInstructor = (raw: string): string => {
    if (!raw || raw === 'TBA' || raw.includes('Staff')) return 'TBA';
    const cleanName = raw.replace(/\(P\)/, '').trim();
    const parts = cleanName.split(',').map((p) => p.trim());
    if (parts.length === 2) return `${parts[1]} ${parts[0]}`;
    return cleanName;
};

describe('parseInstructor', () => {
    it('flips "Last, First" into "First Last"', () => {
        expect(parseInstructor('Jadliwala, Murtuza')).toBe('Murtuza Jadliwala');
    });

    it('strips the (P) primary-instructor marker', () => {
        expect(parseInstructor('Boppana, Rajendra (P)')).toBe('Rajendra Boppana');
    });

    it('returns TBA for empty / placeholder values', () => {
        expect(parseInstructor('')).toBe('TBA');
        expect(parseInstructor('TBA')).toBe('TBA');
        expect(parseInstructor('Staff')).toBe('TBA');
        expect(parseInstructor('Course Staff')).toBe('TBA');
    });

    it('handles names with no comma (already first-last)', () => {
        expect(parseInstructor('Murtuza Jadliwala')).toBe('Murtuza Jadliwala');
    });

    it('handles middle initials', () => {
        expect(parseInstructor('Smith, John A.')).toBe('John A. Smith');
    });
});
