import { describe, it, expect } from 'vitest';
import { cn } from './cn.js';

describe('cn', () => {
    it('joins multiple class strings', () => {
        expect(cn('a', 'b', 'c')).toBe('a b c');
    });

    it('drops falsy values', () => {
        expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
    });

    it('resolves Tailwind padding conflicts (later wins)', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('keeps non-conflicting Tailwind classes', () => {
        expect(cn('p-2 m-2', 'rounded-lg')).toBe('p-2 m-2 rounded-lg');
    });

    it('respects conditional truthiness', () => {
        const isActive = true;
        const isMuted = false;
        expect(cn('base', isActive && 'active', isMuted && 'muted')).toBe('base active');
    });
});
