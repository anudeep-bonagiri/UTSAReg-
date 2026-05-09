import { describe, it, expect } from 'vitest';

describe('test infrastructure', () => {
    it('runs Vitest with strict TypeScript', () => {
        const sum = (a: number, b: number): number => a + b;
        expect(sum(2, 3)).toBe(5);
    });
});
