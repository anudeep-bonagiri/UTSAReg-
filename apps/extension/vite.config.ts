import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

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
                }
            }
        }
    }
});
