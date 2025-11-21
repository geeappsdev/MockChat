
import React, { useState, useRef, useEffect } from 'react';
import { FORMATS } from '../constants';

const ToolbarButton = ({ disabled, onClick, ariaLabel, title, children, className }: any) => (
    <button
        type="button"
        className={`w-7 h-7 rounded flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            disabled 
            ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed' 
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
        } ${className || ''}`}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={onClick}
    >
        {children}
    </button>
);

const MessageInputContent = ({
    text,
    onChange,
    onKeyDown,
    inputRef,
    isExpanded,
    toggleExpanded,
    isLoading,
    canRegenerate,
    onRegenerate,
    onClear,
    onStop,
    onSubmit,
    insertFormat,
    confirmClear,
    placeholder
}) => {
    return (
        <div className={`flex flex-col h-full transition-all duration-300 ${isExpanded ? 'p-6' : ''}`}>
            <div className={`flex items-center px-3 pt-2 gap-2 border-b border-transparent transition-colors ${isExpanded ? 'mb-4' : ''}`} role="toolbar">
                 <div className="flex items-center gap-0.5 bg-white dark:bg-white/5 rounded-md p-0.5 border border-zinc-200/50 dark:border-white/5 shadow-sm">
                    <ToolbarButton onClick={() => insertFormat('**', '**')} disabled={isLoading} ariaLabel="Bold" title="Bold">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" /></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => insertFormat('*', '*')} disabled={isLoading} ariaLabel="Italic" title="Italic">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4M6 16l-4-4" /></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => insertFormat('`', '`')} disabled={isLoading} ariaLabel="Code Block" title="Code Block">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4M6 16l-4-4" /></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => insertFormat('\n- ')} disabled={isLoading} ariaLabel="Bullet List" title="Bullet List">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </ToolbarButton>
                 </div>
                 
                 <ToolbarButton onClick={toggleExpanded} disabled={isLoading} ariaLabel={isExpanded ? "Minimize" : "Maximize"} title={isExpanded ? "Minimize" : "Maximize"} className="hidden md:flex ml-auto">
                     {isExpanded ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0l5 0M4 4l0 5M15 15l5 5m0 0l-5 0m5 0l0-5" /></svg>
                     ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                     )}
                 </ToolbarButton>
    
                 <div className="flex items-center justify-end gap-1">
                    <ToolbarButton 
                        disabled={isLoading || !canRegenerate} 
                        onClick={onRegenerate}
                        ariaLabel="Regenerate response" 
                        title="Regenerate Response"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </ToolbarButton>
                    <ToolbarButton 
                        disabled={isLoading}
                        onClick={onClear}
                        ariaLabel="Clear chat" 
                        title={confirmClear ? "Click again to confirm" : "Clear Chat"}
                        className={`transition-colors ${confirmClear ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800' : 'hover:text-red-600 dark:hover:text-red-400'}`}
                    >
                        {confirmClear ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        )}
                    </ToolbarButton>
                 </div>
              </div>
    
              <div className="px-4 py-2 flex-1">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  rows={1}
                  className={`w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-[15px] leading-relaxed outline-none resize-none py-1 scrollbar-thin ${isExpanded ? 'h-full' : 'min-h-[44px]'}`}
                  style={isExpanded ? {} : { maxHeight: '200px' }}
                />
              </div>
              
              <div className="flex justify-between items-center px-4 pb-3 pt-1">
                <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium hidden md:flex items-center gap-2 select-none">
                  <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-sans text-[10px] text-zinc-500 dark:text-zinc-400 shadow-sm">
                      Return
                  </span>
                  to send
                </div>
                {isLoading ? (
                    <button
                        onClick={onStop}
                        aria-label="Stop generation"
                        title="Stop generation"
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
                    >
                        <div className="w-2.5 h-2.5 bg-current rounded-sm animate-pulse"></div>
                    </button>
                ) : (
                    <button
                    onClick={onSubmit}
                    disabled={!text.trim()}
                    aria-label="Send message"
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${
                        text.trim()
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                )}
              </div>
        </div>
    );
};


const MessageInput = ({ onSendMessage, onStopGeneration, onClearChat, onRegenerate, isLoading, activeChannel, canRegenerate, draft, onDraftChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const textareaRef = useRef(null);
  const expandedRef = useRef(null);

  const text = draft || '';

  // Auto-resize
  useEffect(() => {
    const target = isExpanded ? expandedRef.current : textareaRef.current;
    if (target) {
      target.style.height = 'auto';
      if (!isExpanded) {
          const scrollHeight = target.scrollHeight;
          const maxHeight = 200; 
          target.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      }
    }
  }, [text, isExpanded]);

  useEffect(() => {
      if (confirmClear) {
          const timer = setTimeout(() => setConfirmClear(false), 3000);
          return () => clearTimeout(timer);
      }
  }, [confirmClear]);

  const insertFormat = (startTag, endTag = '') => {
      const textarea = isExpanded ? expandedRef.current : textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;
      const selectedText = currentText.substring(start, end);
      
      const newText = currentText.substring(0, start) + startTag + selectedText + endTag + currentText.substring(end);
      onDraftChange(newText);
      
      setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + startTag.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
      }, 0);
  };

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      if (isExpanded) setIsExpanded(false);
    }
  };

  const handleClear = () => {
      if (confirmClear) {
          onClearChat();
          setConfirmClear(false);
      } else {
          setConfirmClear(true);
      }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const activeFormat = FORMATS.find(f => f.id === activeChannel);
  const channelName = activeFormat ? activeFormat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'general';
  
  const placeholder = activeChannel === 'CR' 
    ? 'Enter instructions to refine the core rules...' 
    : `Message #${channelName}`;

  const contentProps = {
      text,
      onChange: (e) => onDraftChange(e.target.value),
      onKeyDown: handleKeyDown,
      isLoading,
      canRegenerate,
      onRegenerate,
      onClear: handleClear,
      onStop: onStopGeneration,
      onSubmit: handleSubmit,
      insertFormat,
      confirmClear,
      placeholder,
      toggleExpanded: () => setIsExpanded(!isExpanded),
      isExpanded
  };

  return (
    <>
        {isExpanded && (
            <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in-up">
                <div className="bg-white dark:bg-zinc-950 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                     <MessageInputContent {...contentProps} inputRef={expandedRef} />
                </div>
            </div>
        )}

        <div className="w-full max-w-4xl mx-auto">
            <div className={`bg-white dark:bg-zinc-950/80 backdrop-blur-md border rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 transition-all duration-300 ${text.trim() ? 'border-indigo-300 dark:border-indigo-500/30 ring-4 ring-indigo-500/5 dark:ring-indigo-500/10' : 'border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-300 dark:focus-within:border-zinc-700 focus-within:ring-4 focus-within:ring-zinc-100 dark:focus-within:ring-white/5'}`}>
                <MessageInputContent {...contentProps} inputRef={textareaRef} />
            </div>
        </div>
    </>
  );
};

export default MessageInput;
