import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input.js';

describe('Input', () => {
    it('renders with a placeholder', () => {
        render(<Input placeholder="CRN, class, dept..." />);
        expect(screen.getByPlaceholderText('CRN, class, dept...')).toBeInTheDocument();
    });

    it('reflects user typing on an uncontrolled input', async () => {
        render(<Input placeholder="search" />);
        const input = screen.getByPlaceholderText('search');
        await userEvent.type(input, 'CS 3343');
        expect(input).toHaveValue('CS 3343');
    });

    it('renders leading and trailing adornments', () => {
        render(
            <Input
                leadingAdornment={<span data-testid="lead">@</span>}
                trailingAdornment={<span data-testid="trail">⌘K</span>}
                placeholder="x"
            />
        );
        expect(screen.getByTestId('lead')).toBeInTheDocument();
        expect(screen.getByTestId('trail')).toBeInTheDocument();
    });

    it('marks aria-invalid when invalid prop is true', () => {
        render(<Input invalid placeholder="x" />);
        expect(screen.getByPlaceholderText('x')).toHaveAttribute('aria-invalid', 'true');
    });

    it('disables interaction when disabled', async () => {
        render(<Input disabled placeholder="x" />);
        const input = screen.getByPlaceholderText('x');
        expect(input).toBeDisabled();
        await userEvent.type(input, 'no');
        expect(input).toHaveValue('');
    });
});
