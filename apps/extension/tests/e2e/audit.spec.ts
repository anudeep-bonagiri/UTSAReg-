import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { launchExtension, type ExtensionHandle } from './fixtures.js';

let ext: ExtensionHandle;

const SHOTS = '/tmp/utsa-audit';
mkdirSync(SHOTS, { recursive: true });

test.beforeAll(async () => {
    ext = await launchExtension();
});
test.afterAll(async () => {
    await ext.closeAll();
});

/**
 * Visual audit — drive the extension through every meaningful state,
 * dump full-viewport screenshots so a human (me) can eyeball them.
 * Not a strict assertion — exists to surface white-on-white style issues.
 */

test('visual audit', async () => {
    test.setTimeout(60_000);
    const page = await ext.context.newPage();
    await page.setViewportSize({ width: 420, height: 600 });

    // 1. Popup empty state
    await page.goto(`chrome-extension://${ext.extensionId}/index.html`);
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(SHOTS, '01-popup-empty.png'), fullPage: true });

    // 2. Popup with search results
    await page.fill('input[placeholder*="Search"]', 'CS 3343');
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(SHOTS, '02-popup-results.png'), fullPage: true });

    // 3. Popup Schedule tab (with one added section)
    await page.click('button:has-text("Add"):not([disabled])');
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(SHOTS, '03-popup-schedule.png'), fullPage: true });

    // 4. Dashboard explorer (no query)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`chrome-extension://${ext.extensionId}/dashboard.html`);
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(SHOTS, '04-dashboard-explore-empty.png'), fullPage: false });

    // 5. Dashboard with results
    await page.fill('input[placeholder*="Search"]', 'CS 3343');
    await page.waitForTimeout(400);
    await page.screenshot({
        path: join(SHOTS, '05-dashboard-explore-results.png'),
        fullPage: false
    });

    // 6. Course detail dialog
    await page.click('text=CS 3343 ');
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(SHOTS, '06-dashboard-course-dialog.png'), fullPage: false });

    // 7. Settings
    await page.keyboard.press('Escape');
    await page.click('text=Settings');
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(SHOTS, '07-dashboard-settings.png'), fullPage: false });

    // 8. F1 toggle on
    await page.click('button[role="switch"][aria-label*="F1"]');
    await page.click('text=Weekly Schedule');
    await page.waitForTimeout(300);
    await page.screenshot({
        path: join(SHOTS, '08-dashboard-schedule-with-warning.png'),
        fullPage: false
    });

    // 9. Dark mode — flip data-theme on <html> and re-shoot the headline surfaces.
    await page.evaluate(() => {
        document.documentElement.dataset.theme = 'dark';
    });
    await page.waitForTimeout(200);
    await page.click('text=Course Explorer');
    await page.waitForTimeout(300);
    await page.screenshot({
        path: join(SHOTS, '09-dashboard-explore-dark.png'),
        fullPage: false
    });

    const popup = await ext.context.newPage();
    await popup.setViewportSize({ width: 420, height: 600 });
    await popup.goto(`chrome-extension://${ext.extensionId}/index.html`);
    await popup.evaluate(() => {
        document.documentElement.dataset.theme = 'dark';
    });
    await popup.waitForTimeout(400);
    await popup.screenshot({ path: join(SHOTS, '10-popup-empty-dark.png'), fullPage: true });

    // 11. Chrome Web Store hero (1280×800) — main store screenshot.
    const hero = await ext.context.newPage();
    await hero.setViewportSize({ width: 1280, height: 800 });
    await hero.goto(`chrome-extension://${ext.extensionId}/dashboard.html`);
    await hero.waitForTimeout(800);
    await hero.fill('input[placeholder*="Search"]', 'CS 3343');
    await hero.waitForTimeout(500);
    await hero.screenshot({ path: join(SHOTS, 'store-hero-1280x800.png'), fullPage: false });

    console.info(`screenshots written to ${SHOTS}`);
});
