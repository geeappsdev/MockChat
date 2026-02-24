
import React, { useState } from 'react';

const SourceTruthModal = ({ isOpen, onClose, initialContent, onSave }) => {
    const [content, setContent] = useState(initialContent);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(content);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="source-modal-title">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden ring-1 ring-black/5 h-[85vh] flex flex-col">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h3 id="source-modal-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">AI Source of Truth</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Paste content from NotebookLM to ground the AI's knowledge.</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close modal" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto scrollbar-thin bg-white dark:bg-zinc-950">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                        This content will be injected into every prompt as the AI's primary knowledge base. The AI will be instructed to prioritize this information above all else.
                    </p>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste your notes, sources, or FAQs from NotebookLM here..."
                        className="w-full h-full min-h-[50vh] bg-zinc-50 dark:bg-black/80 border border-zinc-200 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                    />
                </div>
                
                <div className="p-4 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 flex justify-end items-center gap-3">
                    <button onClick={() => { if(window.confirm('Are you sure you want to clear all source content?')) { setContent(''); onSave(''); } }} className="px-4 py-2 text-xs font-medium text-red-500 hover:text-red-700">Clear Content</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">Save & Close</button>
                </div>
            </div>
        </div>
    );
};

export default SourceTruthModal;
