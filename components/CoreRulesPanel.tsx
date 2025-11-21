

import React, { useState } from 'react';
import { generateUpdatedRules } from '../services/geminiService';

const RulesHeader = () => (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center min-w-0">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center mr-4 whitespace-nowrap">
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
            // FIX: Pass apiKey to generateUpdatedRules
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
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900">
            <RulesHeader />
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Instruction Input */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Modify Core Rules</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                            Describe how you want to change the AI's behavior. The AI will rewrite the rules for you.
                        </p>
                        <div className="flex gap-3">
                            <textarea
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                placeholder="e.g., 'Make the tone more formal', 'Always ask for order ID'..."
                                aria-label="Rule modification instruction"
                                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-2 focus:ring-zinc-400 focus:outline-none resize-none h-20 placeholder-zinc-400"
                            />
                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating || !instruction.trim()}
                                className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium px-6 py-2 rounded-lg shadow-sm disabled:opacity-50 transition-all self-end"
                            >
                                {isUpdating ? 'Updating...' : 'Apply Update'}
                            </button>
                        </div>
                        {feedback && (
                            <div className={`mt-4 p-3 rounded-lg text-sm border ${feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
                                {feedback.message}
                            </div>
                        )}
                    </div>

                    {/* Current Rules Display */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Current Configuration</span>
                            <span className="text-xs text-zinc-400">Read-only preview</span>
                        </div>
                        <div className="p-6 overflow-x-auto">
                             <pre className="font-mono text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
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