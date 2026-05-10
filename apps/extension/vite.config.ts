import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

/**
 * Vite config — multi-entry Chrome MV3 extension.
 *
 *   popup, dashboard:   regular React entries with chunk-splitting.
 *   background:         service worker (type: module) — can import shared
 *                       chunks from same-origin extension paths.
 *   content:            classical content script — runs in isolated world,
 *                       NO ES module support. Must be one self-contained
 *                       file. We force this via manualChunks below: the
 *                       content entry can never share a chunk with anything
 *                       else, so all of its imports get inlined into
 *                       dist/content.js.
 */
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(import.meta.dirname, 'index.html'),
                dashboard: resolve(import.meta.dirname, 'dashboard.html'),
                background: resolve(import.meta.dirname, 'src/background/index.ts'),
                content: resolve(import.meta.dirname, 'src/content/index.tsx')
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'background' || chunkInfo.name === 'content'
                        ? '[name].js'
                        : 'assets/[name]-[hash].js';
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return '[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
                manualChunks: (id, { getModuleInfo }) => {
                    // Force every module reachable from the content entry to
                    // land in the content chunk. Walk the importer graph.
                    const info = getModuleInfo(id);
                    if (!info) return undefined;
                    const isContentOnly = (mid: string, seen = new Set<string>()): boolean => {
                        if (seen.has(mid)) return true;
                        seen.add(mid);
                        const m = getModuleInfo(mid);
                        if (!m) return false;
                        if (m.isEntry) {
                            return mid.endsWith('content/index.tsx');
                        }
                        const importers = m.importers ?? [];
                        if (importers.length === 0) return false;
                        return importers.every((imp) => isContentOnly(imp, seen));
                    };
                    if (isContentOnly(id)) return 'content';
                    return undefined;
                }
            }
        }
    }
});
