
import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ApiKeyLoginProps {
  onLogin: (key: string) => void;
  systemKeyAvailable?: boolean;
  onUseSystemKey?: () => void;
}

const ApiKeyLogin: React.FC<ApiKeyLoginProps> = ({ onLogin, systemKeyAvailable, onUseSystemKey }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length > 20) {
      onLogin(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Gee Support AI</h1>
          <p className="text-zinc-400 text-sm">Enter your Gemini API Key to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Gemini API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.13-3.55m2.76-2.535A10.048 10.048 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.101-2.101L3 3" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={key.trim().length < 20}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            Connect & Launch
          </button>

          {systemKeyAvailable && onUseSystemKey && (
            <button
              type="button"
              onClick={onUseSystemKey}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition-all border border-white/5"
            >
              Use System Default
            </button>
          )}

          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] text-zinc-500 leading-relaxed text-center">
              Your API key is stored locally in your browser and is never sent to our servers. 
              You can get a free key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Google AI Studio</a>.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ApiKeyLogin;
