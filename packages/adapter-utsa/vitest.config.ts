import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['src/**/index.ts', 'src/**/*.d.ts'],
            thresholds: { lines: 85, functions: 85, branches: 80, statements: 85 }
        }
    }
});
