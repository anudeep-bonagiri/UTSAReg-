import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge.js';

describe('Badge', () => {
    it('renders its label', () => {
        render(<Badge>Open</Badge>);
        expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('renders a leading dot when withDot is true', () => {
        render(
            <Badge tone="open" withDot data-testid="badge">
                Live
            </Badge>
        );
        const badge = screen.getByTestId('badge');
        // Dot is the first span, marked aria-hidden
        const dot = badge.firstElementChild as HTMLElement | null;
        expect(dot).not.toBeNull();
        expect(dot).toHaveAttribute('aria-hidden');
    });

    it('omits the dot when withDot is false', () => {
        render(
            <Badge data-testid="badge" tone="neutral">
                Plain
            </Badge>
        );
        const badge = screen.getByTestId('badge');
        // No aria-hidden span before the text node
        const firstChild = badge.firstChild;
        expect(firstChild?.nodeType).toBe(Node.TEXT_NODE);
    });
});
