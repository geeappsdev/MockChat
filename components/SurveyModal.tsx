import React, { useState } from 'react';

const SurveyModal = ({ isOpen, onClose, onSubmit }) => {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ rating, feedback });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden ring-1 ring-black/5 p-6">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                        🤔
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">How's the trial going?</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your feedback helps us improve Gee AI.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`text-2xl transition-transform hover:scale-110 ${rating >= star ? 'grayscale-0' : 'grayscale opacity-30'}`}
                            >
                                ⭐
                            </button>
                        ))}
                    </div>

                    <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Any thoughts or feature requests?"
                        className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-24"
                    />

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">Skip</button>
                        <button 
                            type="submit" 
                            disabled={!rating}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SurveyModal;