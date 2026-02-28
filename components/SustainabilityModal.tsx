
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SustainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SustainabilityModal: React.FC<SustainabilityModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText('09617383243');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const costData = [
    { label: 'Usage Cost (Advanced AI Services)', value: 'RM 639.25', percentage: 100 },
    { label: 'Spending-based Discounts', value: '-RM 20.47', percentage: 3 },
    { label: 'Promotional Credits', value: '-RM 433.78', percentage: 68 },
    { label: 'Service Tax', value: 'RM 15.23', percentage: 2 },
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
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Developer Advisory
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Settlement Plan to Restore Gee Support App</p>
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
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Usage Cost</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">RM 639.25</p>
                <p className="text-[10px] text-zinc-500 mt-1">Advanced AI Services</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Credits Applied</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">-RM 454.25</p>
                <p className="text-[10px] text-emerald-500 mt-1">Discounts & Promos</p>
              </div>
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Ending Balance</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">RM 205.58</p>
                <p className="text-[10px] text-red-500 mt-1">Approx. ₱2,600</p>
              </div>
            </div>

            {/* Narrative */}
            <div className="bg-zinc-900 dark:bg-white rounded-2xl p-6 text-white dark:text-zinc-900 shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Status Update
              </h3>
              <div className="text-sm space-y-4 leading-relaxed opacity-90">
                <p>Hi everyone,</p>
                <p>I’ve just pulled the latest billing data for the Gee Support App, and I want to be completely transparent about why the service is currently on hold.</p>
                <p>While I have been utilizing promotional credits to keep us running, our recent use of advanced AI services has significantly increased our usage costs. As of today, our total usage cost reached RM 639.25. Even after applying RM 454.25 in credits and discounts, we have an outstanding balance.</p>
                <div className="p-3 bg-white/10 dark:bg-black/5 rounded-lg border border-white/10 dark:border-black/5">
                  <p className="font-bold mb-1">The Situation:</p>
                  <p>A recent payment attempt was declined due to insufficient funds, and the app will remain offline until this is settled.</p>
                </div>
                <p>As a solo developer, I cannot cover this overflow on my own. To get the app back online, I’m asking for your help through a collaborative donation effort to settle this balance of <span className="font-bold text-red-400">₱2,600</span>.</p>
                <p>Once we reach the goal, I’ll settle the Google Cloud bill immediately, and we’ll be back up and running!</p>
                <p className="pt-2">Thank you for your support and understanding.</p>
                <p className="font-bold">— Gee</p>
              </div>
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
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">GCash (Gerald Z. D.)</span>
                    <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white">09617383243</span>
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
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SustainabilityModal;
