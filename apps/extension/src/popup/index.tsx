import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import '@utsaregplus/ui/styles';
import '../styles/main.css';

const restoreTheme = async (): Promise<void> => {
    try {
        const stored = await chrome.storage.sync.get('theme');
        const theme = stored.theme === 'dark' ? 'dark' : 'light';
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
        <App />
    </React.StrictMode>
);
