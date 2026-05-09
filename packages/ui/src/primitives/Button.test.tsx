import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button.js';

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Add to Schedule</Button>);
        expect(screen.getByRole('button', { name: 'Add to Schedule' })).toBeInTheDocument();
    });

    it('defaults to type="button" so it does not submit forms', () => {
        render(<Button>Save</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('honors an explicit type override', () => {
        render(<Button type="submit">Submit</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('fires onClick when clicked', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click me</Button>);
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not fire onClick when disabled', async () => {
        const onClick = vi.fn();
        render(
            <Button onClick={onClick} disabled>
                Disabled
            </Button>
        );
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('renders leading and trailing icons in the right slots', () => {
        render(
            <Button
                leadingIcon={<span data-testid="lead">L</span>}
                trailingIcon={<span data-testid="trail">T</span>}
            >
                Mid
            </Button>
        );
        const btn = screen.getByRole('button');
        expect(btn.firstChild).toHaveAttribute('data-testid', 'lead');
        expect(btn.lastChild).toHaveAttribute('data-testid', 'trail');
    });

    it('forwards refs to the underlying button element', () => {
        const ref = { current: null } as { current: HTMLButtonElement | null };
        render(<Button ref={ref}>Ref</Button>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('asChild renders the wrapped element instead of a button', () => {
        render(
            <Button asChild>
                <a href="/somewhere">Link styled like a button</a>
            </Button>
        );
        const link = screen.getByRole('link', { name: 'Link styled like a button' });
        expect(link).toBeInTheDocument();
        expect(link.tagName).toBe('A');
    });
});
