import { test, expect } from '@playwright/test';
import { launchExtension, type ExtensionHandle } from './fixtures.js';

let ext: ExtensionHandle;

test.beforeAll(async () => {
    ext = await launchExtension();
});

test.afterAll(async () => {
    await ext.closeAll();
});

test.describe('dashboard', () => {
    test('renders the sidebar Midnight wordmark block', async () => {
        const page = await ext.context.newPage();
        await page.goto(`chrome-extension://${ext.extensionId}/dashboard.html`);
        const sidebarHeader = page.locator('aside > div').first();
        await expect(sidebarHeader).toBeVisible();
        const bg = await sidebarHeader.evaluate(
            (el) => window.getComputedStyle(el).backgroundColor
        );
        expect(bg).toBe('rgb(3, 32, 68)'); // Midnight
    });

    test('navigation between tabs (Course Explorer ↔ Settings)', async () => {
        const page = await ext.context.newPage();
        await page.goto(`chrome-extension://${ext.extensionId}/dashboard.html`);
        await expect(page.getByRole('heading', { name: 'Course Explorer' })).toBeVisible();
        await page.getByRole('button', { name: /Settings/ }).click();
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
        await expect(page.getByText('F1 mode')).toBeVisible();
        await expect(page.getByText('GPA-protect mode')).toBeVisible();
    });

    test('F1 mode toggle flips aria-checked from false to true', async () => {
        const page = await ext.context.newPage();
        await page.goto(`chrome-extension://${ext.extensionId}/dashboard.html`);
        await page.getByRole('button', { name: /Settings/ }).click();

        const f1Switch = page.getByRole('switch', { name: /Toggle F1 mode/ });
        await expect(f1Switch).toHaveAttribute('aria-checked', 'false');
        await f1Switch.click();
        await expect(f1Switch).toHaveAttribute('aria-checked', 'true');
    });

    test('deep link from popup (#course=CS3343) opens the course detail dialog', async () => {
        const page = await ext.context.newPage();
        await page.goto(`chrome-extension://${ext.extensionId}/dashboard.html#course=CS3343`);
        // The dialog renders the course code prominently in the Midnight band.
        await expect(page.getByText('CS3343', { exact: false }).first()).toBeVisible();
    });
});
