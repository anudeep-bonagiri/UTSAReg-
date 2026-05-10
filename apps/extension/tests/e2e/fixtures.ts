import { chromium, type BrowserContext, type Worker } from '@playwright/test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, '..', '..', 'dist');

export interface ExtensionHandle {
    context: BrowserContext;
    extensionId: string;
    closeAll: () => Promise<void>;
}

/**
 * Launch a persistent Chromium with the unpacked extension at dist/ loaded.
 *
 * Returns a context plus the extension's resolved ID — that's the prefix
 * for chrome-extension://EXT_ID/popup.html and dashboard.html.
 *
 * The extension ID isn't exposed by Chrome in any direct API; we look it up
 * by waiting for the background service worker to register and pulling the
 * URL prefix off it. This is the pattern Playwright recommends.
 */
export const launchExtension = async (): Promise<ExtensionHandle> => {
    const userDataDir = `/tmp/utsa-reg-plus-e2e-${Date.now()}`;
    // MV3 service workers don't load under classic Chromium --headless.
    // The new headless mode does, so we run with headless: false plus the
    // explicit --headless=new flag — Chromium runs without a window but the
    // service worker wakes up.
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        args: [
            '--headless=new',
            `--disable-extensions-except=${distDir}`,
            `--load-extension=${distDir}`,
            '--no-sandbox'
        ]
    });

    // Wait for the background service worker to spin up.
    let serviceWorker: Worker | undefined = context.serviceWorkers()[0];
    serviceWorker ??= await context.waitForEvent('serviceworker', { timeout: 10_000 });
    const extensionId = serviceWorker.url().split('/')[2];
    if (!extensionId) {
        throw new Error('Could not resolve extension ID from service worker URL');
    }

    return {
        context,
        extensionId,
        closeAll: async () => {
            await context.close();
        }
    };
};
