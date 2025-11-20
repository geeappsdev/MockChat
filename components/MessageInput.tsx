
import React, { useState, useRef, useEffect } from 'react';
import { FORMATS } from '../constants';

// 1. ToolbarButton - Defined OUTSIDE to prevent re-renders
const ToolbarButton = ({ disabled, onClick, ariaLabel, title, children, className }: any) => (
    <button
        type="button"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            disabled 
            ? 'text-zinc-400/50 dark:text-zinc-600 cursor-not-allowed' 
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-300'
        } ${className || ''}`}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={onClick}
    >
        {children}
    </button>
);

// 2. MessageInputContent - Defined OUTSIDE. 
// This is the critical fix. It accepts all handlers as props so it stays stable.
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
        <div className={isExpanded ? "flex flex-col h-full" : ""}>
            <div className="flex items-center px-3 pt-3 gap-1 border-b border-transparent focus-within:border-zinc-200/50 dark:focus-within:border-white/10 transition-colors" role="toolbar" aria-label="Message formatting options">
                 <ToolbarButton onClick={() => insertFormat('**', '**')} disabled={isLoading} ariaLabel="Bold" title="Bold">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" /></svg>
                 </ToolbarButton>
                 <ToolbarButton onClick={() => insertFormat('*', '*')} disabled={isLoading} ariaLabel="Italic" title="Italic">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4M6 16l-4-4" /></svg>
                 </ToolbarButton>
                 <ToolbarButton onClick={() => insertFormat('`', '`')} disabled={isLoading} ariaLabel="Code Block" title="Code Block">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4M6 16l-4-4" /></svg>
                 </ToolbarButton>
                 <ToolbarButton onClick={() => insertFormat('\n- ')} disabled={isLoading} ariaLabel="Bullet List" title="Bullet List">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                 </ToolbarButton>
                 <ToolbarButton onClick={toggleExpanded} disabled={isLoading} ariaLabel={isExpanded ? "Minimize" : "Maximize"} title={isExpanded ? "Minimize" : "Maximize"} className="hidden md:flex">
                     {isExpanded ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0l5 0M4 4l0 5M15 15l5 5m0 0l-5 0m5 0l0-5" /></svg>
                     ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                     )}
                 </ToolbarButton>
    
                 <div className="flex-1 flex items-center justify-end px-2">
                    <div className="w-px h-5 bg-zinc-300/50 dark:bg-zinc-700/50"></div>
                 </div>
    
                 <ToolbarButton 
                    disabled={isLoading || !canRegenerate} 
                    onClick={onRegenerate}
                    ariaLabel="Regenerate response" 
                    title="Regenerate Response"
                   >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 </ToolbarButton>
                 <ToolbarButton 
                    disabled={isLoading}
                    onClick={onClear}
                    ariaLabel="Clear chat" 
                    title={confirmClear ? "Click again to confirm" : "Clear Chat"}
                    className={`transition-colors ${confirmClear ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400'}`}
                   >
                     {confirmClear ? (
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     ) : (
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     )}
                 </ToolbarButton>
              </div>
    
              <div className="px-4 py-3 flex-1">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  rows={1}
                  className={`w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500/60 dark:placeholder-zinc-400/60 text-base leading-relaxed outline-none resize-none py-1 scrollbar-thin ${isExpanded ? 'h-full' : 'min-h-[48px]'}`}
                  style={isExpanded ? {} : { maxHeight: '240px' }}
                />
              </div>
              
              <div className="flex justify-between items-center px-3 pb-3 pt-1">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden md:flex items-center gap-2 select-none opacity-80">
                  <span className="flex items-center gap-1 bg-white/40 dark:bg-white/10 px-1.5 py-0.5 rounded border border-white/20 font-sans text-[10px] text-zinc-500 dark:text-zinc-300 shadow-sm">
                      Return
                  </span>
                  to send
                </div>
                {isLoading ? (
                    <button
                        onClick={onStop}
                        aria-label="Stop generation"
                        title="Stop generation"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 border border-white/20 hover:border-red-500/30 transition-all duration-200 shadow-sm backdrop-blur-sm"
                    >
                        <div className="w-3 h-3 bg-current rounded-sm animate-pulse"></div>
                    </button>
                ) : (
                    <button
                    onClick={onSubmit}
                    disabled={!text.trim()}
                    aria-label="Send message"
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                        text.trim()
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                        : 'bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
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


// 3. Main MessageInput - State Manager
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
    ? 'Refine rules with an instruction...' 
    : `Message #${channelName}`;

  // Props bundle to pass to the external component
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
            <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8">
                <div className="bg-white/80 dark:bg-black/80 w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 flex flex-col overflow-hidden animate-fade-in-up backdrop-blur-xl">
                     <MessageInputContent {...contentProps} inputRef={expandedRef} />
                </div>
            </div>
        )}

        <div className="w-full max-w-4xl mx-auto mb-4">
            <div className="bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 focus-within:shadow-xl focus-within:ring-1 focus-within:ring-white/30 dark:focus-within:ring-white/10">
                <MessageInputContent {...contentProps} inputRef={textareaRef} />
            </div>
        </div>
    </>
  );
};

export default MessageInput;
