import { defineConfig } from '@playwright/test';

/**
 * Playwright config for the Chrome extension.
 *
 * Strategy: launch Chromium with the freshly-built unpacked extension at
 * dist/, then drive the popup and dashboard surfaces. Tests verify the
 * end-to-end render, not raw DOM — they catch the kind of regressions
 * that vitest can't (e.g., the Tailwind 4 syntax bug we shipped earlier).
 */
export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30_000,
    fullyParallel: false, // extension surfaces share storage state
    workers: 1,
    reporter: [['list']],
    use: {
        // Each test creates its own persistent context with the extension loaded;
        // the project-level use{} just sets defaults for any utility browsers.
        trace: 'on-first-retry'
    }
});
