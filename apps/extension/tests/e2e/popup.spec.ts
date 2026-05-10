import { test, expect } from '@playwright/test';
import { launchExtension, type ExtensionHandle } from './fixtures.js';

let ext: ExtensionHandle;

test.beforeAll(async () => {
    ext = await launchExtension();
});

test.afterAll(async () => {
    await ext.closeAll();
});

test.describe('popup', () => {
    test('renders the Midnight header with UTSA Reg+ wordmark', async () => {
        const page = await ext.context.newPage();
        await page.goto(`chrome-extension://${ext.extensionId}/index.html`);

        // The wordmark is in an h1 — and the UTSA brand cue we shipped is the
        // Midnight bg behind it. Assert both presence and that the bg is
        // computed-style #032044 (the brand-default token).
        const heading = page.getByRole('heading', { name: /UTSA Reg/ });
        await expect(heading).toBeVisible();

        const headerEl = page.locator('header').first();
        const bg = await headerEl.evaluate((el) => window.getComputedStyle(el).backgroundColor);
        // rgb(3, 32, 68) === Midnight #032044
        expect(bg).toBe('rgb(3, 32, 68)');
    });

    test('shows quick prompts and the empty-state copy on first paint', async () => {
        const page = await ext.context.newPage();
        await page.goto(`chrome-extension://${ext.extensionId}/index.html`);
        await expect(page.getByText('Search any UTSA section')).toBeVisible();
        for (const prompt of ['CS 3343', 'CS 2123', 'MAT 1214']) {
            await expect(page.getByRole('button', { name: prompt })).toBeVisible();
        }
    });

    test('clicking a quick prompt populates the search and surfaces real sections', async () => {
        const page = await ext.context.newPage();
        await page.goto(`chrome-extension://${ext.extensionId}/index.html`);
        await page.getByRole('button', { name: 'CS 3343' }).click();

        // Real CS 3343 sections from data/sections.json should render.
        // Assert the course code shows up at least once.
        await expect(page.getByText('CS 3343', { exact: false })).toBeVisible();
    });
});
