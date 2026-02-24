
import React, { useState, useRef, useEffect } from 'react';
import { FORMATS } from '../constants';

const ToolbarButton = ({ disabled, onClick, ariaLabel, title, children, active = false }: any) => (
    <button
        type="button"
        className={`w-7 h-7 rounded flex items-center justify-center transition-all duration-200 ${
            disabled 
            ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed' 
            : active
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-zinc-400 hover:bg-indigo-50 dark:hover:bg-indigo-100/10 hover:text-indigo-600 dark:hover:text-indigo-300'
        }`}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={onClick}
    >
        {children}
    </button>
);

const MessageInput = ({ onSendMessage, onStopGeneration, onClearChat, onRegenerate, isLoading, activeChannel, canRegenerate, draft, onDraftChange, isLimitReached }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const text = draft || '';

  useEffect(() => {
    const target = textareaRef.current;
    if (target) {
      target.style.height = 'auto';
      target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
    }
  }, [text]);

  // Clear attachments when changing channels
  useEffect(() => {
      setAttachments([]);
  }, [activeChannel]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
      if ((text.trim() || attachments.length > 0) && !isLoading) {
          onSendMessage(text, attachments);
          // Attachments are cleared by parent/App.tsx logic usually, but here we can clear them optimistically or wait.
          // Since MessageInput is somewhat controlled for text but uncontrolled for files, we clear files here.
          setAttachments([]); 
      }
  };

  const getPlaceholder = () => {
      if (activeChannel === 'CR') return "Suggest a rule change (e.g. 'Be more formal')...";
      return "Describe the issue, paste text, or attach images...";
  };

  // --- FILE HANDLING ---

  const processFiles = (files: FileList | File[]) => {
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      
      if (validFiles.length === 0) return;

      validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
              if (e.target?.result) {
                setAttachments(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    data: e.target.result, // base64
                    mimeType: file.type,
                    name: file.name
                }]);
              }
          };
          reader.readAsDataURL(file);
      });
  };

  const handleFileChange = (e) => {
      if (e.target.files) {
          processFiles(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      // 1. Check for clipboard items (Screenshots)
      if (e.clipboardData.items) {
          const items = Array.from(e.clipboardData.items);
          const imageItems = items.filter((item: any) => item.type.startsWith('image/'));
          
          if (imageItems.length > 0) {
              e.preventDefault();
              const files = imageItems.map((item: any) => item.getAsFile()).filter((f: any) => f !== null) as File[];
              processFiles(files);
              return;
          }
      }

      // 2. Check for traditional file transfer
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
          e.preventDefault();
          processFiles(e.clipboardData.files);
      }
  };

  const removeAttachment = (id) => {
      setAttachments(prev => prev.filter(att => att.id !== id));
  };

  return (
    <div className={`w-full max-w-3xl mx-auto transition-all duration-300 ${isFocused ? 'transform -translate-y-1' : ''}`}>
        <div className={`relative bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${isFocused ? 'border-indigo-200 ring-4 ring-indigo-100 dark:ring-1 dark:ring-indigo-500/20 dark:border-indigo-500/30 shadow-xl shadow-indigo-100 dark:shadow-none' : 'border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none'}`}>
            
            {/* Attachment Previews */}
            {attachments.length > 0 && (
                <div className="px-4 pt-4 pb-0 flex gap-3 overflow-x-auto scrollbar-thin">
                    {attachments.map(att => (
                        <div key={att.id} className="relative group shrink-0">
                            <img src={att.data} alt="attachment" className="w-16 h-16 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" />
                            <button 
                                onClick={() => removeAttachment(att.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Text Area */}
            <div className="px-4 pt-3 pb-2">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => onDraftChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onPaste={handlePaste}
                    placeholder={getPlaceholder()}
                    aria-label="Chat input"
                    rows={1}
                    maxLength={10000}
                    autoFocus
                    className="w-full bg-transparent text-[15px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none resize-none max-h-40 scrollbar-thin leading-relaxed text-center"
                />
            </div>

            {/* Toolbar & Actions */}
            <div className="px-2 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-0.5 px-2" role="toolbar" aria-label="Formatting options">
                     {/* File Upload Button */}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp, image/heic"
                        multiple
                    />
                    <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={isLoading} ariaLabel="Attach Image" title="Attach Image">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </ToolbarButton>

                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

                    <ToolbarButton onClick={() => onDraftChange(text + '**bold**')} disabled={isLoading} ariaLabel="Bold" title="Bold">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" /></svg>
                    </ToolbarButton>
                    <ToolbarButton onClick={() => onDraftChange(text + '- item')} disabled={isLoading} ariaLabel="Bulleted List" title="List">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </ToolbarButton>
                    {canRegenerate && (
                         <ToolbarButton onClick={onRegenerate} disabled={isLoading} ariaLabel="Regenerate last response" title="Regenerate">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                         </ToolbarButton>
                    )}
                </div>

                <div className="flex items-center gap-3">
                     <span className="hidden sm:inline-block text-[10px] text-zinc-300 dark:text-zinc-600 font-medium" aria-hidden="true">
                         {(text.length > 0 || attachments.length > 0) ? 'Press Enter' : 'Ready'}
                     </span>
                    {isLoading ? (
                        <button 
                            onClick={onStopGeneration} 
                            aria-label="Stop generating"
                            className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                            <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
                        </button>
                    ) : (
                        <button 
                            onClick={handleSend}
                            disabled={!text.trim() && attachments.length === 0}
                            aria-label="Send message"
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${(text.trim() || attachments.length > 0) ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' : 'bg-zinc-100 dark:bg-white/5 text-zinc-300 dark:text-zinc-600'}`}
                        >
                            <svg className="w-3.5 h-3.5 transform translate-x-px translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default MessageInput;
