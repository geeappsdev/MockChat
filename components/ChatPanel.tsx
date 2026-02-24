
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ErrorBoundary from './ErrorBoundary';
import TimerWidget from './TimerWidget';
import AnnouncementBanner from './AnnouncementBanner';
import { FORMATS } from '../constants';

const ChatPanel = ({ 
    activeChannel, 
    messages = [], 
    isLoading, 
    onSendMessage, 
    onStopGeneration, 
    onClearChat, 
    onRegenerate, 
    canRegenerate, 
    draft, 
    onDraftChange, 
    detectedContext, 
    onManualContextChange, 
    onToggleSidebar,
    onOpenSustainability,
    isAdmin,
    isLimitReached,
    brandLogo,
    onQuickSummary 
}) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  const channelInfo = FORMATS.find(f => f.id === activeChannel);
  const channelName = channelInfo ? channelInfo.name.toLowerCase().replace(/\s+/g, '-') : 'general';

  useLayoutEffect(() => {
    if (!userHasScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, userHasScrolledUp]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setUserHasScrolledUp(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1A1D21] relative overflow-hidden">
      {/* Slack Header */}
      <header className="h-[52px] border-b border-slack-border dark:border-white/10 px-4 flex items-center justify-between bg-white dark:bg-[#1A1D21] z-30 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onToggleSidebar} className="md:hidden text-slack-textMuted hover:text-slack-text dark:text-zinc-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[16px] font-black text-slack-text dark:text-white truncate">#{channelName}</span>
              <svg className="w-3.5 h-3.5 text-slack-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slack-textMuted dark:text-zinc-400 truncate">
              <span className="hover:text-slack-blue cursor-pointer">Gee AI Assistant</span>
              <span className="opacity-30">|</span>
              <span className="truncate">{channelInfo?.description}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <ErrorBoundary componentName="Timer"><TimerWidget isAdmin={isAdmin} /></ErrorBoundary>
           <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-white/5 rounded-md border border-slack-border dark:border-white/10 cursor-pointer hover:bg-zinc-200 transition-colors">
              <svg className="w-3.5 h-3.5 text-slack-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-[13px] text-slack-textMuted dark:text-zinc-400">Search</span>
           </div>
        </div>
      </header>

      {/* Announcement Banner - Fixed below header */}
      <div className="z-20 border-b border-slack-border dark:border-white/5">
        <AnnouncementBanner onOpenSustainability={onOpenSustainability} />
      </div>

      {/* Message Area */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto slack-scrollbar-light dark:slack-scrollbar bg-white dark:bg-[#1A1D21]"
      >
        <div className="py-8">
           {messages.length === 0 ? (
             <div className="px-5 sm:px-10 max-w-4xl">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                   <span className="text-3xl font-black text-slack-textMuted">#</span>
                </div>
                <h1 className="text-3xl font-black text-slack-text dark:text-white mb-2">You’re looking at the #{channelName} channel</h1>
                <p className="text-slack-text dark:text-zinc-300 max-w-2xl leading-relaxed text-[17px]">
                  This is the very beginning of the <strong className="font-bold">#{channelName}</strong> channel. 
                  Ask anything to get started with the {channelInfo?.name} workflow.
                </p>
                <div className="mt-8 flex gap-3">
                   <button onClick={onClearChat} className="px-4 py-2 border border-slack-border dark:border-white/10 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">Manage Channel</button>
                   <button onClick={onToggleSidebar} className="px-4 py-2 border border-slack-border dark:border-white/10 rounded-lg text-sm font-bold hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">Add members</button>
                </div>
             </div>
           ) : (
             <div className="space-y-0">
               {messages.map((msg, i) => (
                 <Message key={msg.id} message={msg} isLastInGroup={i === messages.length - 1} />
               ))}
               {isLoading && <TypingIndicator />}
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="px-4 pb-6 pt-2 bg-white dark:bg-[#1A1D21] z-30">
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
          isLimitReached={isLimitReached}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
