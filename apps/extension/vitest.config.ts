import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: false,
        setupFiles: ['./src/test-utils/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/index.tsx', 'src/**/index.ts', 'src/**/*.d.ts', 'src/scripts/**'],
            thresholds: { lines: 70, functions: 70, branches: 65, statements: 70 }
        }
    }
});
