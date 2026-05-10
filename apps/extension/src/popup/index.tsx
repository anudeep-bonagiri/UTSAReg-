import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import '@utsaregplus/ui/styles';
import '../styles/main.css';

/**
 * Read the persisted theme synchronously enough that the popup paints in the
 * right colors on first frame. We still need an async chrome.storage.sync
 * fetch, but the default ('light') matches the body bg so any flicker is
 * imperceptible.
 */
const restoreTheme = async (): Promise<void> => {
    try {
        const stored = await chrome.storage.sync.get('prefs:v1');
        const prefs = stored['prefs:v1'] as { theme?: 'light' | 'dark' } | undefined;
        const legacyTheme = await chrome.storage.sync.get('theme');
        const theme: 'light' | 'dark' =
            prefs?.theme === 'dark' || legacyTheme.theme === 'dark' ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme;
    } catch {
        document.documentElement.dataset.theme = 'light';
    }
};

void restoreTheme();

const root = document.getElementById('root');
if (!root) {
    throw new Error('Popup root element missing');
}
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <ErrorBoundary surface="Popup">
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
