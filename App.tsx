
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import CoreRulesModal from './components/CoreRulesModal';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import SourceTruthModal from './components/SourceTruthModal';
import SustainabilityModal from './components/SustainabilityModal';
import ApiKeyLogin from './components/ApiKeyLogin';
import useLocalStorage from './hooks/useLocalStorage';
import { generateResponseStream, incrementDailyUsage, getDailyUsage, getApiKey, setApiKey as saveApiKey, clearApiKey } from './services/geminiService';
import { INITIAL_GENERAL_RULES, CHANNEL_QUICK_LINKS, CONTEXT_LINKS, detectContext, DAILY_USAGE_LIMIT } from './constants';
import CommandPalette from './components/CommandPalette';

const App = () => {
  const [activeChannel, setActiveChannel] = useState('EO');
  const [messages, setMessages] = useState<Record<string, any[]>>({});
  const [drafts, setDrafts] = useLocalStorage<Record<string, string>>('gee_drafts', {});
  const [isLoading, setIsLoading] = useState(false);
  const [coreRules, setCoreRules] = useState<string>(() => localStorage.getItem('core_rules') || INITIAL_GENERAL_RULES);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  
  const [dailyUsage, setDailyUsage] = useState(() => getDailyUsage());
  const [apiKey, setApiKey] = useState(() => getApiKey());
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [manualContext, setManualContext] = useState<string | null>(null);
  
  const [isCoreRulesOpen, setIsCoreRulesOpen] = useState(false);
  const [isSourceTruthOpen, setIsSourceTruthOpen] = useState(false);
  const [isSustainabilityOpen, setIsSustainabilityOpen] = useState(false);

  const [sourceTruthContent, setSourceTruthContent] = useLocalStorage('gee_source_truth', '');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useLocalStorage('gee_user_profile', {
    name: 'Support Agent',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
    theme: 'default',
    mode: 'system'
  });

  const [brandLogo, setBrandLogo] = useLocalStorage<string | undefined>('gee_brand_logo', undefined);

  const isAdmin = true;
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    localStorage.setItem('core_rules', coreRules);
  }, [coreRules]);

  useEffect(() => {
    const root = window.document.documentElement;
    const mode = userProfile.mode || 'system';

    const applyTheme = () => {
        if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    applyTheme();

    if (mode === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', applyTheme);
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [userProfile.mode]);

  const getCurrentMessages = () => messages[activeChannel] || [];

  const addMessage = (channel: string, message: any) => {
    setMessages(prev => ({
      ...prev,
      [channel]: [...(prev[channel] || []), message]
    }));
  };

  const channelMessages = messages[activeChannel] || [];
  const lastUserMsg = [...channelMessages].reverse().find(m => m.sender === 'user');
  const lastUserText = lastUserMsg ? lastUserMsg.text : '';
  const currentDraft = drafts[activeChannel] || '';

  const detectedContext = useMemo(() => {
      if (manualContext) return manualContext;
      const textToAnalyze = currentDraft.length > 5 ? currentDraft : lastUserText;
      if (!textToAnalyze) return null;
      return detectContext(textToAnalyze);
  }, [manualContext, lastUserText, currentDraft, activeChannel]);

  useEffect(() => {
      setManualContext(null);
  }, [activeChannel]);

  // Auto-popup sustainability report once daily
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastPopupDate = localStorage.getItem('last_sustainability_popup');
    
    if (lastPopupDate !== today) {
      const timer = setTimeout(() => {
        setIsSustainabilityOpen(true);
        localStorage.setItem('last_sustainability_popup', today);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const getContextLinks = () => {
      if (detectedContext && CONTEXT_LINKS[detectedContext as keyof typeof CONTEXT_LINKS]) {
          return CONTEXT_LINKS[detectedContext as keyof typeof CONTEXT_LINKS];
      }
      return [];
  };

  const getChannelLinks = () => {
      return CHANNEL_QUICK_LINKS[activeChannel as keyof typeof CHANNEL_QUICK_LINKS] || [];
  };

  const handleSendMessage = async (text: string, attachments = [], formatOverride = null) => {
    setDrafts(prev => ({ ...prev, [activeChannel]: '' }));

    const currentChan = activeChannel; // Capture channel in closure
    const userMsg = { 
        id: Date.now(), 
        sender: 'user', 
        name: userProfile.name, 
        avatar: userProfile.avatar, 
        text: text,
        attachments: attachments
    };
    
    addMessage(currentChan, userMsg);
    setIsLoading(true);
    setConnectionStatus('connecting');

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
        const historyData = (messages[currentChan] || [])
            .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
            .join('\n');
        
        const formatToUse = formatOverride || currentChan;

        const stream = await generateResponseStream(
            text, 
            formatToUse, 
            historyData, 
            coreRules, 
            (messages[currentChan] || []).length === 0,
            signal,
            attachments,
            detectedContext,
            sourceTruthContent
        );
        
        incrementDailyUsage();
        setDailyUsage(getDailyUsage());
        
        setConnectionStatus('connected');

        let aiResponseText = '';
        const aiMsgId = Date.now() + 1;
        
        // Initial placeholder for AI message
        addMessage(currentChan, { 
            id: aiMsgId, 
            sender: 'ai', 
            name: 'Gee', 
            avatar: 'https://ui-avatars.com/api/?name=Gee+AI&background=18181b&color=fff&rounded=true&bold=true&size=128', 
            text: '' 
        });

        // Loop through native stream chunks
        for await (const chunk of stream) {
            if (signal.aborted) break;
            const chunkText = chunk.text;
            if (chunkText) {
                aiResponseText += chunkText;
                setMessages(prev => {
                    const channelMsgs = prev[currentChan] || [];
                    const updatedMsgs = channelMsgs.map(msg => 
                        msg.id === aiMsgId ? { ...msg, text: aiResponseText } : msg
                    );
                    return { ...prev, [currentChan]: updatedMsgs };
                });
            }
        }

    } catch (error: any) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            console.log('Generation stopped');
        } else {
            console.error("Stream Error", error);
            setConnectionStatus('error');
            addMessage(currentChan, { 
                id: Date.now() + 1, 
                sender: 'ai', 
                name: 'System Error', 
                avatar: 'https://ui-avatars.com/api/?name=Error&background=ef4444&color=fff&rounded=true&bold=true&size=128', 
                text: `**Error:** ${error.message || 'Unknown failure'}` 
            });
        }
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setIsLoading(false);
  };

  const handleClearChat = () => {
      setMessages(prev => ({ ...prev, [activeChannel]: [] }));
      setManualContext(null);
  };
  
  const handleRegenerate = () => {
      const currentMsgs = messages[activeChannel] || [];
      const lastUserMsg = [...currentMsgs].reverse().find(m => m.sender === 'user');
      if (lastUserMsg) handleSendMessage(lastUserMsg.text, lastUserMsg.attachments || []);
  };
  
  const handleDraftChange = (text: string) => {
      setDrafts(prev => ({ ...prev, [activeChannel]: text }));
  };

  const handleQuickSummary = () => {
      handleSendMessage("Generate a Quick Summary of the current conversation.", [], 'QS');
  };

  const canRegenerate = (messages[activeChannel] || []).length > 0;

  const handleApiKeyLogin = (key: string) => {
    saveApiKey(key);
    setApiKey(key);
  };

  const handleUseSystemKey = () => {
    saveApiKey('system');
    setApiKey('system');
  };

  const handleDisconnectApiKey = () => {
    clearApiKey();
    setApiKey(null);
    setIsProfileModalOpen(false);
  };

  if (!apiKey) {
    return (
      <ApiKeyLogin 
        onLogin={handleApiKeyLogin} 
        systemKeyAvailable={!!process.env.GEMINI_API_KEY}
        onUseSystemKey={handleUseSystemKey}
      />
    );
  }

  return (
    <div className={`flex h-screen text-zinc-900 dark:text-zinc-200 font-sans overflow-hidden relative ${userProfile?.theme || ''}`}>
      <CommandPalette 
        isOpen={false} 
        onClose={() => {}} 
        onCommand={(cmd: string) => {
             if (cmd === 'clear') handleClearChat();
             if (cmd.startsWith('channel:')) setActiveChannel(cmd.split(':')[1]);
             if (cmd === 'settings') setIsProfileModalOpen(true);
             if (cmd === 'rules') setIsCoreRulesOpen(true);
        }}
        activeChannel={activeChannel}
      />

      {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
      )}

      <Sidebar 
        activeChannel={activeChannel} 
        onChannelSelect={(ch: string) => { setActiveChannel(ch); setIsMobileSidebarOpen(false); }} 
        connectionStatus={connectionStatus}
        contextLinks={getContextLinks()}
        channelLinks={getChannelLinks()}
        userProfile={userProfile}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onClearChat={handleClearChat}
        onOpenRules={() => setIsCoreRulesOpen(true)}
        onOpenSourceTruth={() => setIsSourceTruthOpen(true)}
        onOpenSustainability={() => setIsSustainabilityOpen(true)}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        brandLogo={brandLogo}
        detectedContext={detectedContext}
      />
      
      <main className="flex-1 min-w-0 relative flex flex-col z-0 transition-all duration-300 h-full">
        <ChatPanel 
            activeChannel={activeChannel}
            messages={getCurrentMessages()}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            onClearChat={handleClearChat}
            onRegenerate={handleRegenerate}
            canRegenerate={canRegenerate}
            draft={drafts[activeChannel] || ''}
            onDraftChange={handleDraftChange}
            detectedContext={detectedContext}
            onManualContextChange={setManualContext}
            isLimitReached={dailyUsage.count >= DAILY_USAGE_LIMIT}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onOpenSustainability={() => setIsSustainabilityOpen(true)}
            brandLogo={brandLogo}
            onQuickSummary={handleQuickSummary}
            isAdmin={isAdmin}
        />
      </main>

      <ProfileSettingsModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSave={setUserProfile}
        onDisconnect={handleDisconnectApiKey} 
        isAdmin={isAdmin}
        brandLogo={brandLogo}
        onSaveBrandLogo={setBrandLogo}
        usageLimit={DAILY_USAGE_LIMIT}
        dailyUsage={dailyUsage}
      />

      <CoreRulesModal 
        isOpen={isCoreRulesOpen}
        onClose={() => setIsCoreRulesOpen(false)}
        rules={coreRules}
        onUpdateRules={setCoreRules}
        readOnly={false}
      />
      
      <SourceTruthModal
        isOpen={isSourceTruthOpen}
        onClose={() => setIsSourceTruthOpen(false)}
        initialContent={sourceTruthContent}
        onSave={setSourceTruthContent}
      />

      <SustainabilityModal 
        isOpen={isSustainabilityOpen}
        onClose={() => setIsSustainabilityOpen(false)}
      />
    </div>
  );
};

export default App;
