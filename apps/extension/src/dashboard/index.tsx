import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { ErrorBoundary } from '../components/ErrorBoundary.js';
import '@utsaregplus/ui/styles';
import '../styles/main.css';

document.body.classList.add('utsa-fullpage');

const restoreTheme = async (): Promise<void> => {
    try {
        const stored = await chrome.storage.sync.get('prefs:v1');
        const prefs = stored['prefs:v1'] as { theme?: 'light' | 'dark' } | undefined;
        document.documentElement.dataset.theme = prefs?.theme === 'dark' ? 'dark' : 'light';
    } catch {
        document.documentElement.dataset.theme = 'light';
    }
};

void restoreTheme();

const root = document.getElementById('root');
if (!root) throw new Error('Dashboard root element missing');
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <ErrorBoundary surface="Dashboard">
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
