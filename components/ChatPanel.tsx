
import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { FORMATS, EMPTY_STATE_MESSAGES } from '../constants';

const Header = ({ activeChannel, detectedContext }) => {
  const getChannelName = (channelId) => {
    const format = FORMATS.find(f => f.id === activeChannel);
    if (!format) return 'product-team';
    return format.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  const getDescription = (channelId) => {
      const format = FORMATS.find(f => f.id === activeChannel);
      return format ? format.description : '';
  }

  return (
    <header className="flex items-center justify-between px-6 border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-xl sticky top-0 z-10 h-16 shadow-sm">
      <div className="flex items-center min-w-0 gap-4">
        <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center whitespace-nowrap tracking-tight drop-shadow-sm">
            <span className="mr-1.5 text-zinc-500 dark:text-zinc-400 font-normal opacity-70" aria-hidden="true">#</span> 
            {getChannelName(activeChannel)}
            </h2>
        </div>
        
        {/* Context Badge */}
        {detectedContext && activeChannel !== 'CR' && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 border border-indigo-500/20 backdrop-blur-md animate-fade-in-up">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">Context:</span>
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-200 capitalize">{detectedContext}</span>
            </div>
        )}

        {activeChannel !== 'CR' && (
            <span className="hidden lg:block text-sm text-zinc-600 dark:text-zinc-300 truncate border-l border-zinc-400/30 dark:border-white/10 pl-4 ml-1 opacity-80">{getDescription(activeChannel)}</span>
        )}
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
        className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent" 
        tabIndex={0} 
        aria-label={`Chat history for channel ${getChannelName(activeChannel)}`}
    >
      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 animate-fade-in-up px-4">
            <div className="bg-white/40 dark:bg-white/5 p-8 rounded-3xl mb-6 border border-white/30 dark:border-white/10 shadow-lg backdrop-blur-md" aria-hidden="true">
                 <span className="text-6xl font-bold text-zinc-400 dark:text-zinc-600">#</span>
            </div>
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight drop-shadow-sm">Welcome to #{getChannelName(activeChannel)}</h3>
            <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed opacity-90">{EMPTY_STATE_MESSAGES[activeChannel]}</p>
        </div>
      ) : (
        <div className="space-y-6" role="log" aria-live="polite">
            {messages.map(msg => <Message key={msg.id} message={msg} />)}
            {isLoading && <TypingIndicator />}
        </div>
      )}
    </div>
  );
};

const ChatPanel = ({ activeChannel, messages, isLoading, onSendMessage, onStopGeneration, onClearChat, onRegenerate, canRegenerate, draft, onDraftChange, detectedContext }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative transition-colors duration-300">
      <Header activeChannel={activeChannel} detectedContext={detectedContext} />
      <ChatWindow 
        messages={messages} 
        isLoading={isLoading} 
        activeChannel={activeChannel}
      />
      <div className="p-4 md:p-6 pt-0 bg-transparent">
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
