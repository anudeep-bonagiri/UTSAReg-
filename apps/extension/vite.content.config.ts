import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Separate Vite build for the MV3 content script.
 *
 * Content scripts run in an isolated world and DO NOT support ES modules —
 * they must be a single self-contained file. Rollup's multi-input ESM mode
 * (used by the main config) cannot honor that: shared deps end up in a
 * shared chunk that the service worker also imports, and the SW then
 * evaluates module-top-level `document.*` references and crashes with
 * "document is not defined" / SW registration status 15.
 *
 * The fix: build the content entry on its own, format: 'iife',
 * inlineDynamicImports: true. Everything ends up in dist/content.js with
 * no import/export statements.
 *
 * Order matters: the main build runs first and emits the rest of dist/;
 * this build then appends content.js with emptyOutDir: false.
 */
export default defineConfig({
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        rollupOptions: {
            input: resolve(import.meta.dirname, 'src/content/index.tsx'),
            output: {
                format: 'iife',
                entryFileNames: 'content.js',
                inlineDynamicImports: true
            }
        }
    }
});
