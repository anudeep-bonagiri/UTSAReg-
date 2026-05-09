/* eslint-disable @typescript-eslint/require-await -- mock async APIs */
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
    cleanup();
});

// Minimal chrome.* shim for tests that touch the extension storage helpers.
// Tests can override individual methods with vi.spyOn or by reassigning.
type StorageRecord = Record<string, unknown>;

const memoryStore: StorageRecord = {};

const chromeStub = {
    runtime: {
        onMessage: { addListener: vi.fn() },
        sendMessage: vi.fn(),
        getURL: (path: string): string => `chrome-extension://test/${path}`
    },
    storage: {
        local: {
            get: vi.fn(
                async (
                    keys?: string | string[] | StorageRecord | null
                ): Promise<StorageRecord> => {
                    // Chrome behavior: undefined OR null means "all keys".
                    if (keys === undefined || keys === null) return { ...memoryStore };
                    if (typeof keys === 'string')
                        return { [keys]: memoryStore[keys] };
                    if (Array.isArray(keys)) {
                        return Object.fromEntries(keys.map((k) => [k, memoryStore[k]]));
                    }
                    return Object.fromEntries(
                        Object.keys(keys).map((k) => [k, memoryStore[k] ?? keys[k]])
                    );
                }
            ),
            set: vi.fn(async (items: StorageRecord): Promise<void> => {
                Object.assign(memoryStore, items);
            }),
            remove: vi.fn(async (keys: string | string[]): Promise<void> => {
                const list = Array.isArray(keys) ? keys : [keys];
                list.forEach((k) => delete memoryStore[k]);
            }),
            clear: vi.fn(async (): Promise<void> => {
                Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
            })
        }
    },
    tabs: { create: vi.fn() }
};

(globalThis as unknown as { chrome: typeof chromeStub }).chrome = chromeStub;
