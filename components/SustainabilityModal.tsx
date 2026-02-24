
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SustainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SustainabilityModal: React.FC<SustainabilityModalProps> = ({ isOpen, onClose }) => {
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('117311127');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const costData = [
    { label: 'Gemini API (High Reasoning)', value: 'RM 412.18', percentage: 50 },
    { label: 'Cloud Hosting & Compute', value: 'RM 289.23', percentage: 35 },
    { label: 'Storage & Database', value: 'RM 82.64', percentage: 10 },
    { label: 'Network & CDN', value: 'RM 42.32', percentage: 5 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/5"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Sustainability Report
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Project running costs & infrastructure health</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] scrollbar-thin">
            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Gross Cost</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">RM 826.37</p>
                <p className="text-[10px] text-zinc-500 mt-1">Total resource value</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Credits Applied</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">-RM 826.36</p>
                <p className="text-[10px] text-emerald-500 mt-1">Developer sponsorship</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Your Total</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">RM 0.01</p>
                <p className="text-[10px] text-indigo-500 mt-1">Current billable amount</p>
              </div>
            </div>

            {/* Narrative */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Why show this?
              </h3>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Gee AI is a high-performance tool that consumes significant cloud resources. 
                While developer credits currently cover <span className="font-bold text-white">99.9%</span> of the costs, this sustainability report is provided to show the real-world value of the service you are using. 
                To keep the app running indefinitely, we rely on the continued availability of these credits and community support.
              </p>
            </div>

            {/* Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 uppercase tracking-widest">Cost Breakdown</h3>
              <div className="space-y-4">
                {costData.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">{item.label}</span>
                      <span className="text-zinc-900 dark:text-white font-bold">{item.value}</span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Help keep Gee AI alive</p>
                <p className="text-xs text-zinc-500 mt-0.5">Every small contribution extends our runtime.</p>
              </div>
              
              {showPaymentInfo ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-end gap-2"
                >
                  <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">TNG / DuitNow</span>
                      <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">117311127</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-colors text-indigo-500"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      )}
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowPaymentInfo(false)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-700 underline"
                  >
                    Back to options
                  </button>
                </motion.div>
              ) : (
                <button 
                  onClick={() => setShowPaymentInfo(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.216 6.415l-.132-.666c-.119-.598-.588-1.054-1.197-1.159C17.13 4.315 14.186 4 12 4s-5.13.315-6.887.49c-.609.105-1.078.561-1.197 1.159l-.132.666C3.311 8.259 3 10.076 3 12c0 1.924.311 3.741.784 5.585l.132.666c.119.598.588 1.054 1.197 1.159C6.87 19.685 9.814 20 12 20s5.13-.315 6.887-.49c.609-.105 1.078-.561 1.197-1.159l.132-.666C20.689 15.741 21 13.924 21 12c0-1.924-.311-3.741-.784-5.585zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
                  Support the Project
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SustainabilityModal;
