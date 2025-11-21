
import React, { useState } from 'react';
import { generateUpdatedRules } from '../services/geminiService';

const RulesHeader = () => (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
      <div className="flex items-center min-w-0">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center mr-4 whitespace-nowrap tracking-tight">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
          core-rules
        </h2>
      </div>
    </header>
);

const CoreRulesPanel = ({ rules, onUpdateRules, isLoading, apiKey }) => {
    const [instruction, setInstruction] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleUpdate = async () => {
        if (!instruction.trim()) return;
        setIsUpdating(true);
        setFeedback(null);
        
        try {
            const result = await generateUpdatedRules(instruction, rules, apiKey);
            if (result.error) {
                setFeedback({ type: 'error', message: result.error });
            } else {
                onUpdateRules(result.updatedRules);
                setFeedback({ type: 'success', message: result.confirmationMessage });
                setInstruction('');
            }
        } catch (e) {
             setFeedback({ type: 'error', message: "Failed to update rules." });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent">
            <RulesHeader />
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Instruction Input */}
                    <div className="bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-lg backdrop-blur-md">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 drop-shadow-sm">Modify Core Rules</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Describe how you want to change the AI's behavior. The AI will rewrite the rules for you.
                        </p>
                        <div className="flex gap-3 flex-col md:flex-row">
                            <textarea
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                placeholder="e.g., 'Make the tone more formal', 'Always ask for order ID'..."
                                aria-label="Rule modification instruction"
                                className="flex-1 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:outline-none resize-none h-36 placeholder-zinc-500/70 backdrop-blur-sm"
                            />
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating || !instruction.trim()}
                                className="bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium px-6 h-12 rounded-xl shadow-lg disabled:opacity-50 transition-all self-end md:w-auto w-full"
                            >
                                {isUpdating ? 'Updating...' : 'Apply Update'}
                            </button>
                        </div>
                        {feedback && (
                            <div className={`mt-4 p-3 rounded-xl text-sm border backdrop-blur-md ${feedback.type === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
                                {feedback.message}
                            </div>
                        )}
                    </div>

                    {/* Current Rules Display */}
                    <div className="bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg backdrop-blur-md">
                        <div className="bg-white/30 dark:bg-white/5 px-6 py-3 border-b border-white/20 dark:border-white/5 flex justify-between items-center">
                            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Current Configuration</span>
                            <span className="text-xs text-zinc-400">Read-only preview</span>
                        </div>
                        <div className="p-6 overflow-x-auto">
                             <pre className="font-mono text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                {rules}
                             </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoreRulesPanel;
