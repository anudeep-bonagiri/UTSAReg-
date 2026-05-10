import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

/**
 * Vite config — popup, dashboard, and MV3 service worker.
 *
 *   popup, dashboard:   regular React entries with chunk-splitting.
 *   background:         service worker (type: module) — ES modules OK.
 *
 * The content script is built separately by vite.content.config.ts because
 * MV3 content scripts cannot be ES modules. See that file for details.
 */
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(import.meta.dirname, 'index.html'),
                dashboard: resolve(import.meta.dirname, 'dashboard.html'),
                background: resolve(import.meta.dirname, 'src/background/index.ts')
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'background'
                        ? '[name].js'
                        : 'assets/[name]-[hash].js';
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return '[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        }
    }
});
