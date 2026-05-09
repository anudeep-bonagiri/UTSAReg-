import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,
        environment: 'node',
        include: ['packages/**/*.{test,spec}.{ts,tsx}', 'apps/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['packages/**/src/**/*.{ts,tsx}', 'apps/extension/src/utils/**/*.{ts,tsx}'],
            exclude: ['**/index.ts', '**/*.d.ts', '**/tests/**', '**/*.test.ts'],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 75,
                statements: 80
            }
        }
    }
});
