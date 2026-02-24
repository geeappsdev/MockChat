import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
    // Check if we already have a root to avoid the warning
    // In React 18, we can't easily check for an existing root on the element,
    // but we can store it in a global variable if needed for HMR.
    // However, the most common pattern for Vite is to just call createRoot.
    // If duplication persists, we can use a singleton pattern.
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}