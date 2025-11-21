
import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { FORMATS, EMPTY_STATE_MESSAGES } from '../constants';

const Header = ({ activeChannel, detectedContext, onClearChat }) => {
  const getChannelName = (channelId) => {
    const format = FORMATS.find(f => f.id === activeChannel);
    if (!format) return 'product-team';
    return format.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  const getDescription = (channelId) => {
      const format = FORMATS.find(f => f.id === activeChannel);
      return format ? format.description : '';
  }
  
  const [confirmClear, setConfirmClear] = useState(false);
  
  const handleClear = () => {
      if (confirmClear) {
          onClearChat();
          setConfirmClear(false);
      } else {
          setConfirmClear(true);
          setTimeout(() => setConfirmClear(false), 3000);
      }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200/50 dark:border-white/5 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-10 h-[4.5rem] shrink-0 transition-all">
      <div className="flex items-center min-w-0 gap-4 w-full">
        <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center whitespace-nowrap tracking-tight">
            <span className="mr-1 text-zinc-400 dark:text-zinc-600 font-normal font-mono" aria-hidden="true">#</span> 
            {getChannelName(activeChannel)}
            </h2>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xl hidden sm:block leading-none mt-0.5">{getDescription(activeChannel)}</span>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
            {/* Context Badge */}
            {detectedContext && activeChannel !== 'CR' && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 backdrop-blur-md animate-fade-in-up">
                    <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-bold text-indigo-400 dark:text-indigo-400 uppercase tracking-wider">Context</span>
                        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-200 capitalize">{detectedContext}</span>
                    </div>
                </div>
            )}

            {/* Clear Button */}
            {activeChannel !== 'CR' && (
                <button 
                    onClick={handleClear}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        confirmClear 
                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                    }`}
                >
                    {confirmClear ? 'Confirm?' : 'Clear'}
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

const ChatWindow = ({ messages, isLoading, activeChannel }) => {
  const scrollRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // Smart Auto-Scroll Logic
  const handleScroll = () => {
      const element = scrollRef.current;
      if (!element) return;
      
      const { scrollTop, scrollHeight, clientHeight } = element;
      // Check if user is near bottom (within 100px)
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
        scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages, isLoading, shouldAutoScroll]);
  
  const showEmptyState = messages.length === 0 && !isLoading && activeChannel !== 'CR';
  
  const getChannelName = (channelId) => {
    const format = FORMATS.find(f => f.id === channelId);
    if (!format) return 'product-team';
    return format.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  return (
    <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:px-12 md:py-8 scrollbar-thin scrollbar-track-transparent" 
        tabIndex={0} 
        aria-label={`Chat history for channel ${getChannelName(activeChannel)}`}
    >
      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 animate-fade-in-up px-4 pb-20">
            <div className="w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-white/5 dark:to-transparent rounded-[1.5rem] mb-6 border border-zinc-200 dark:border-white/10 shadow-lg flex items-center justify-center backdrop-blur-sm transform rotate-3" aria-hidden="true">
                 <span className="text-4xl font-bold text-zinc-300 dark:text-zinc-600 font-mono">#</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">Welcome to #{getChannelName(activeChannel)}</h3>
            <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{EMPTY_STATE_MESSAGES[activeChannel]}</p>
        </div>
      ) : (
        <div className="space-y-10 max-w-4xl mx-auto pb-6" role="log" aria-live="polite">
            {messages.map(msg => <Message key={msg.id} message={msg} />)}
            {isLoading && <TypingIndicator />}
        </div>
      )}
    </div>
  );
};

const ChatPanel = ({ activeChannel, messages, isLoading, onSendMessage, onStopGeneration, onClearChat, onRegenerate, canRegenerate, draft, onDraftChange, detectedContext }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
      <Header activeChannel={activeChannel} detectedContext={detectedContext} onClearChat={onClearChat} />
      <ChatWindow 
        messages={messages} 
        isLoading={isLoading} 
        activeChannel={activeChannel}
      />
      <div className="px-4 md:px-12 pb-6 pt-2 bg-gradient-to-t from-zinc-50 via-zinc-50/80 to-transparent dark:from-[#050507] dark:via-[#050507]/80 dark:to-transparent z-10">
        <MessageInput 
          onSendMessage={onSendMessage} 
          onStopGeneration={onStopGeneration}
          onClearChat={onClearChat}
          onRegenerate={onRegenerate}
          isLoading={isLoading}
          activeChannel={activeChannel}
          canRegenerate={canRegenerate}
          draft={draft}
          onDraftChange={onDraftChange}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
