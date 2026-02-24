
import React from 'react';

const AnnouncementBanner = ({ onOpenSustainability }) => {
    return (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-800/30 px-4 py-3 flex items-start sm:items-center justify-center gap-3 animate-fade-in-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-0.5 sm:mt-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="flex flex-col gap-1 max-w-2xl">
                <p className="text-[11px] leading-relaxed font-medium text-indigo-900 dark:text-indigo-200">
                    To keep Gee AI running and accessible to everyone, we rely on your generous support. 
                    Maintaining high-performance AI models and hosting infrastructure comes with significant costs. 
                    If this tool helps you save time and provide better support, please consider a small donation to ensure its future.
                    <button 
                        onClick={onOpenSustainability}
                        className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700 transition-colors"
                    >
                        View Sustainability Report
                    </button>
                </p>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    — Gee
                </p>
            </div>
        </div>
    );
};

export default AnnouncementBanner;
