
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import CoreRulesPanel from './components/CoreRulesPanel';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import ApiKeyModal from './components/ApiKeyModal';
import useLocalStorage from './hooks/useLocalStorage';
import { generateResponseStream } from './services/geminiService';
import { INITIAL_GENERAL_RULES, CHANNEL_QUICK_LINKS, CONTEXT_LINKS, detectContext } from './constants';

const App = () => {
  const [activeChannel, setActiveChannel] = useState('EO');
  const [messages, setMessages] = useState({});
  const [drafts, setDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [coreRules, setCoreRules] = useState(() => localStorage.getItem('core_rules') || INITIAL_GENERAL_RULES);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  
  // User Profile State with Persistence
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useLocalStorage('gee_user_profile', {
    name: 'Admin User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  // API Key State
  const [storedApiKey, setStoredApiKey] = useLocalStorage('gemini_api_key', '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  // Effective Key Logic: Use Env Var if present (Dev/Build), otherwise use Stored Key (Runtime/Embed)
  const effectiveApiKey = process.env.API_KEY || storedApiKey;

  const abortControllerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('core_rules', coreRules);
  }, [coreRules]);

  // Check for API Key on mount
  useEffect(() => {
      if (!effectiveApiKey) {
          setIsApiKeyModalOpen(true);
      } else {
          setIsApiKeyModalOpen(false);
      }
  }, [effectiveApiKey]);

  const handleApiKeySubmit = (key) => {
      setStoredApiKey(key);
      setIsApiKeyModalOpen(false);
  };

  const getCurrentMessages = () => messages[activeChannel] || [];

  const addMessage = (channel, message) => {
    setMessages(prev => ({
      ...prev,
      [channel]: [...(prev[channel] || []), message]
    }));
  };

  // Context Detection Logic
  const getDetectedContext = () => {
    const channelMessages = messages[activeChannel] || [];
    if (channelMessages.length === 0) return null;
    const lastUserMsg = [...channelMessages].reverse().find(m => m.sender === 'user');
    if (!lastUserMsg) return null;
    return detectContext(lastUserMsg.text);
  };

  const detectedContext = getDetectedContext();

  const getQuickLinks = () => {
    const defaultLinks = CHANNEL_QUICK_LINKS[activeChannel] || [];
    if (detectedContext && CONTEXT_LINKS[detectedContext]) {
        const contextLinks = CONTEXT_LINKS[detectedContext];
        const combined = [...contextLinks, ...defaultLinks];
        const unique = combined.filter((link, index, self) =>
            index === self.findIndex((t) => (
                t.url === link.url
            ))
        );
        return unique;
    }
    return defaultLinks;
  };

  const handleSendMessage = async (text) => {
    if (!effectiveApiKey) {
        setIsApiKeyModalOpen(true);
        return;
    }

    setDrafts(prev => ({ ...prev, [activeChannel]: '' }));

    // Use dynamic profile info
    const userMsg = { 
        id: Date.now(), 
        sender: 'user', 
        name: userProfile.name, 
        avatar: userProfile.avatar, 
        text 
    };
    addMessage(activeChannel, userMsg);
    setIsLoading(true);
    setConnectionStatus('connecting');

    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
        const currentHistory = (messages[activeChannel] || [])
            .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
            .join('\n');
            
        const stream = await generateResponseStream(
            text, 
            activeChannel, 
            currentHistory, 
            coreRules, 
            (messages[activeChannel] || []).length === 0,
            effectiveApiKey,
            signal
        );
        
        setConnectionStatus('connected');

        let aiResponseText = '';
        const aiMsgId = Date.now() + 1;
        
        addMessage(activeChannel, { 
            id: aiMsgId, 
            sender: 'ai', 
            name: 'Gee', 
            avatar: 'https://ui-avatars.com/api/?name=Gee+AI&background=18181b&color=fff&rounded=true&bold=true&size=128', 
            text: '' 
        });

        if (stream) {
            for await (const chunk of stream) {
                if (signal.aborted) break; 

                const chunkText = chunk.text; 
                if (chunkText) {
                    aiResponseText += chunkText;
                    
                    setMessages(prev => {
                        const channelMsgs = prev[activeChannel] || [];
                        const updatedMsgs = channelMsgs.map(msg => 
                            msg.id === aiMsgId ? { ...msg, text: aiResponseText } : msg
                        );
                        return { ...prev, [activeChannel]: updatedMsgs };
                    });
                }
            }
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Generation stopped by user');
        } else {
            console.error("Generation failed", error);
            const errorText = error.message || "I encountered an error. Please check your API key or try again.";
            if (errorText.includes("Connection Blocked") || errorText.includes("Network or request error")) {
                 setConnectionStatus('error');
            }

            addMessage(activeChannel, { 
                id: Date.now() + 1, 
                sender: 'ai', 
                name: 'System Error', 
                avatar: 'https://ui-avatars.com/api/?name=Error&background=ef4444&color=fff&rounded=true&bold=true&size=128', 
                text: `**Error:** ${errorText}` 
            });
        }
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setIsLoading(false);
      }
  };

  const handleClearChat = () => {
      setMessages(prev => ({ ...prev, [activeChannel]: [] }));
  };
  
  const handleRegenerate = () => {
      const currentMsgs = messages[activeChannel] || [];
      const lastUserMsg = [...currentMsgs].reverse().find(m => m.sender === 'user');
      if (lastUserMsg) {
          handleSendMessage(lastUserMsg.text);
      }
  };
  
  const handleDraftChange = (text) => {
      setDrafts(prev => ({ ...prev, [activeChannel]: text }));
  };

  const canRegenerate = (messages[activeChannel] || []).length > 0;

  return (
    <div className="flex h-screen text-zinc-900 dark:text-zinc-200 font-sans overflow-hidden">
      <Sidebar 
        activeChannel={activeChannel} 
        onChannelSelect={setActiveChannel} 
        connectionStatus={connectionStatus}
        quickLinks={getQuickLinks()}
        userProfile={userProfile}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onClearChat={handleClearChat}
      />
      
      <main className="flex-1 min-w-0 relative flex flex-col z-0 transition-all duration-300">
         {activeChannel === 'CR' ? (
             <CoreRulesPanel 
                rules={coreRules} 
                onUpdateRules={setCoreRules}
                isLoading={isLoading}
                apiKey={effectiveApiKey}
             />
         ) : (
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
            />
         )}
      </main>

      <ProfileSettingsModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSave={setUserProfile}
      />
      
      {isApiKeyModalOpen && (
          <ApiKeyModal onSubmit={handleApiKeySubmit} />
      )}
    </div>
  );
};

export default App;
