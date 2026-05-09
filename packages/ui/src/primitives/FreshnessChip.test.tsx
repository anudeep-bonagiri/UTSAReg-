import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { FreshnessChip } from './FreshnessChip.js';
import type { Freshness } from '@utsaregplus/core';

const fixedNow = new Date('2026-05-09T12:00:00.000Z').getTime();

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
});

afterEach(() => {
    vi.useRealTimers();
});

const live: Freshness = {
    source: 'live',
    fetchedAt: '2026-05-09T11:59:55.000Z',
    maxAgeMs: 60_000
};

const stale: Freshness = {
    source: 'cache-stale',
    fetchedAt: '2026-05-09T11:00:00.000Z'
};

const snapshot: Freshness = {
    source: 'snapshot',
    fetchedAt: '2026-03-01T00:00:00.000Z'
};

describe('FreshnessChip', () => {
    it('renders source + relative time by default', () => {
        render(<FreshnessChip freshness={live} />);
        expect(screen.getByText(/Live · just now/i)).toBeInTheDocument();
    });

    it('renders relative-time only when timeOnly is set', () => {
        render(<FreshnessChip freshness={live} timeOnly />);
        expect(screen.getByText(/just now/i)).toBeInTheDocument();
        expect(screen.queryByText(/Live ·/)).not.toBeInTheDocument();
    });

    it('shows the source label appropriate to each variant', () => {
        const { rerender } = render(<FreshnessChip freshness={stale} />);
        expect(screen.getByText(/Stale ·/)).toBeInTheDocument();
        rerender(<FreshnessChip freshness={snapshot} />);
        expect(screen.getByText(/Snapshot ·/)).toBeInTheDocument();
    });

    it('updates the relative-time label as time advances', () => {
        render(<FreshnessChip freshness={live} tickMs={1000} />);
        expect(screen.getByText(/just now/i)).toBeInTheDocument();

        // Advance system time by 90 seconds, then trigger the chip's interval
        act(() => {
            vi.setSystemTime(fixedNow + 90_000);
            vi.advanceTimersByTime(1000);
        });
        expect(screen.getByText(/min ago/i)).toBeInTheDocument();
    });

    it('exposes a descriptive title attribute for tooltips/screen readers', () => {
        render(<FreshnessChip freshness={live} data-testid="chip" />);
        const chip = screen.getByTestId('chip');
        expect(chip.getAttribute('title')).toMatch(/Live —/);
        expect(chip.getAttribute('aria-label')).toMatch(/Live —/);
    });
});
