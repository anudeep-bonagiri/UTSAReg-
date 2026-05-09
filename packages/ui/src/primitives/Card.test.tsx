import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './Card.js';

describe('Card', () => {
    it('renders children inside a div', () => {
        render(<Card data-testid="card">hello</Card>);
        expect(screen.getByTestId('card')).toHaveTextContent('hello');
    });

    it('composes header / title / description / footer slots', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>CS 3343</CardTitle>
                    <CardDescription>Algorithms</CardDescription>
                </CardHeader>
                <p>body</p>
                <CardFooter>
                    <span>footer</span>
                </CardFooter>
            </Card>
        );
        expect(screen.getByRole('heading', { name: 'CS 3343' })).toBeInTheDocument();
        expect(screen.getByText('Algorithms')).toBeInTheDocument();
        expect(screen.getByText('body')).toBeInTheDocument();
        expect(screen.getByText('footer')).toBeInTheDocument();
    });
});
