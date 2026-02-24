
import React, { useState } from 'react';
import { generateUpdatedRules } from '../services/geminiService';
import { INITIAL_GENERAL_RULES } from '../constants';

// Removed apiKey from props as it is now handled via process.env.API_KEY in the service
const CoreRulesModal = ({ isOpen, onClose, rules, onUpdateRules, readOnly }) => {
    const [instruction, setInstruction] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [feedback, setFeedback] = useState(null);

    if (!isOpen) return null;

    const handleUpdate = async () => {
        if (!instruction.trim()) return;
        setIsUpdating(true);
        setFeedback(null);
        
        try {
            // Removed apiKey argument as the service now handles it internally
            const result = await generateUpdatedRules(instruction, rules);
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
    
    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all Core Rules to the system default? This will discard any custom instructions.")) {
            onUpdateRules(INITIAL_GENERAL_RULES);
            setFeedback({ type: 'success', message: "Rules reset to default configuration." });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="rules-modal-title">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden ring-1 ring-black/5 h-[85vh] flex flex-col">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 id="rules-modal-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Core Rules Configuration</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Define the persona and behavioral instructions for the AI.</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close modal" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Editor Section */}
                    <div className="flex-1 p-6 overflow-y-auto scrollbar-thin border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 relative">
                        {readOnly && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-black/90 z-20 flex items-center justify-center flex-col text-center p-8">
                                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                    <svg className="w-7 h-7 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Locked</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs">Only Admin users can modify the Core Rules.</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="instruction-input" className="block text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">AI Instruction Builder</label>
                                {!readOnly && (
                                    <button onClick={handleReset} className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Reset to Default
                                    </button>
                                )}
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-500/20">
                                <textarea
                                    id="instruction-input"
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                    placeholder="Describe how you want the AI to behave (e.g., 'Be more empathetic', 'Always include a timeline table')..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-zinc-900 dark:text-zinc-100 placeholder-indigo-300 dark:placeholder-indigo-500/50 resize-none h-24"
                                    maxLength={2000}
                                />
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-500/20">
                                    <span className="text-[10px] text-indigo-400">The AI will rewrite the formal rules below based on this input.</span>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={isUpdating || !instruction.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdating ? 'Updating Logic...' : 'Update Rules'}
                                    </button>
                                </div>
                            </div>
                            {feedback && (
                                <div className={`mt-3 p-3 rounded-xl text-xs font-medium border animate-fade-in-up ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`} role="status">
                                    {feedback.message}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Current Ruleset (Raw)</label>
                            <div className="bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-xl p-4 overflow-x-auto shadow-inner">
                                <pre className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                                    {rules}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Info / Tips Section */}
                    <div className="w-full md:w-72 bg-zinc-50 dark:bg-black p-6 border-t md:border-t-0 border-zinc-200 dark:border-white/5">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">Writing Tips</h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"><strong>Be Specific:</strong> Instead of "be nicer", say "use phrases like 'I understand how frustrating this is'".</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"><strong>Define Structure:</strong> Ask for specific headers, tables, or checklist items to appear in every response.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"><strong>Set Constraints:</strong> Explicitly forbid certain words or actions (e.g., "Never use the word 'apologize'").</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoreRulesModal;
