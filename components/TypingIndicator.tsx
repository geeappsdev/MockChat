import React from 'react';

const TypingIndicator = () => (
    <div className="flex items-start gap-3 px-4 py-4" role="status" aria-label="Gee is typing">
      <div className="w-9 h-9 bg-zinc-900 dark:bg-zinc-100 rounded-lg shadow-sm flex items-center justify-center font-bold text-lg flex-shrink-0 text-white dark:text-zinc-900" aria-hidden="true">G</div>
      <div className="flex-1 pt-1">
        <div className="flex items-center space-x-1.5 h-8">
            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Gee is thinking...</span>
            <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"></div>
            </div>
        </div>
      </div>
    </div>
);

export default TypingIndicator;