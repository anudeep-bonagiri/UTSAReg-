import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        passWithNoTests: true,
        setupFiles: ['./src/test-setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/index.ts', 'src/**/index.tsx', 'src/**/*.stories.tsx']
        }
    }
});
