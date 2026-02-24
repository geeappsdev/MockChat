import React, { useState } from 'react';
import GeeLogo from './GeeLogo';

const ApiKeyModal = ({ onSubmit, brandLogo }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSubmit(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-100/30 dark:bg-black/30 backdrop-blur-2xl flex items-center justify-center p-4 z-50 transition-opacity" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white/70 dark:bg-black/70 border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] max-w-md w-full p-8 relative overflow-hidden backdrop-blur-xl">
        
        <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/50 transform rotate-3 overflow-hidden">
                <GeeLogo className="w-12 h-12 text-white" customSrc={brandLogo} />
            </div>
            <h2 id="modal-title" className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">Unlock Gee Support</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto">
                Enter your Gemini API key to access the full suite of support tools.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="apiKey" className="sr-only">API Key</label>
            <input
              id="apiKey"
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste your API Key here..."
              maxLength={256}
              className="w-full px-4 py-3.5 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-white focus:border-transparent transition-all text-base shadow-inner backdrop-blur-sm text-center"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!inputKey.trim()}
            className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold rounded-2xl shadow-lg shadow-indigo-900/20 dark:shadow-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started
          </button>
        </form>
        <div className="mt-8 text-center border-t border-zinc-200/50 dark:border-white/10 pt-6">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors opacity-80 hover:opacity-100">
                <span>Don't have a key? Get one from Google AI Studio</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
            </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;