

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import CoreRulesPanel from './components/CoreRulesPanel';
import ApiKeyModal from './components/ApiKeyModal';
import { generateResponseStream } from './services/geminiService';
import { INITIAL_GENERAL_RULES, CHANNEL_QUICK_LINKS, CONTEXT_LINKS, detectContext } from './constants';

const App = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(!apiKey);
  
  const [activeChannel, setActiveChannel] = useState('EO');
  const [messages, setMessages] = useState({});
  const [drafts, setDrafts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [coreRules, setCoreRules] = useState(() => localStorage.getItem('core_rules') || INITIAL_GENERAL_RULES);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  
  const abortControllerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('core_rules', coreRules);
  }, [coreRules]);
  
  useEffect(() => {
      // If an API key is provided via environment variables (deployment), use it and hide the modal.
      const envApiKey = process.env.API_KEY;
      if (envApiKey) {
          setApiKey(envApiKey);
          setShowApiKeyModal(false);
      }
  }, []);

  const handleApiKeySubmit = (key) => {
      setApiKey(key);
      localStorage.setItem('gemini_api_key', key);
      setShowApiKeyModal(false);
  }
  
  const handleResetApiKey = () => {
      setApiKey('');
      localStorage.removeItem('gemini_api_key');
      setShowApiKeyModal(true);
  }

  const getCurrentMessages = () => messages[activeChannel] || [];

  const addMessage = (channel, message) => {
    setMessages(prev => ({
      ...prev,
      [channel]: [...(prev[channel] || []), message]
    }));
  };

  const detectedContext = detectContext((messages[activeChannel] || []).map(m => m.text).join('\n'));

  const getQuickLinks = () => {
    const defaultLinks = CHANNEL_QUICK_LINKS[activeChannel] || [];
    if (detectedContext && CONTEXT_LINKS[detectedContext]) {
        const contextLinks = CONTEXT_LINKS[detectedContext];
        return [...contextLinks, ...defaultLinks.filter(l => !contextLinks.find(cl => cl.url === l.url))];
    }
    return defaultLinks;
  };

  const handleSendMessage = async (text) => {
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }
    setDrafts(prev => ({ ...prev, [activeChannel]: '' }));

    const userMsg = { 
        id: Date.now(), 
        sender: 'user', 
        name: 'Admin User', 
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256', 
        text 
    };
    addMessage(activeChannel, userMsg);
    setIsLoading(true);
    setConnectionStatus('connecting');

    abortControllerRef.current = new AbortController();

    try {
        const currentHistory = (messages[activeChannel] || [])
            .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
            .join('\n');
            
        const stream = await generateResponseStream(
            text, 
            activeChannel, 
            currentHistory, 
            coreRules,
            apiKey,
            abortControllerRef.current.signal
        );
        
        setConnectionStatus('connected');

        let aiResponseText = '';
        const aiMsgId = Date.now() + 1;
        
        addMessage(activeChannel, { 
            id: aiMsgId, 
            sender: 'ai', 
            name: 'Gee', 
            avatar: 'https://ui-avatars.com/api/?name=G&background=000&color=fff&rounded=true&bold=true&size=128', 
            text: '' 
        });

        for await (const chunk of stream) {
            const chunkText = chunk.text; 
            if (chunkText) {
                aiResponseText += chunkText;
                setMessages(prev => ({
                    ...prev,
                    [activeChannel]: (prev[activeChannel] || []).map(msg => 
                        msg.id === aiMsgId ? { ...msg, text: aiResponseText } : msg
                    )
                }));
            }
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            setConnectionStatus('error');
            addMessage(activeChannel, { 
                id: Date.now() + 1, 
                sender: 'ai', 
                name: 'System Error', 
                avatar: 'https://ui-avatars.com/api/?name=E&background=ef4444&color=fff&rounded=true&bold=true&size=128', 
                text: `**Error:** ${error.message}` 
            });
        }
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
      abortControllerRef.current?.abort();
  };

  const handleClearChat = () => {
      setMessages(prev => ({ ...prev, [activeChannel]: [] }));
  };
  
  const handleRegenerate = () => {
      const lastUserMsg = [...(messages[activeChannel] || [])].reverse().find(m => m.sender === 'user');
      if (lastUserMsg) {
          handleSendMessage(lastUserMsg.text);
      }
  };
  
  const handleDraftChange = (text) => {
      setDrafts(prev => ({ ...prev, [activeChannel]: text }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {showApiKeyModal && <ApiKeyModal onSubmit={handleApiKeySubmit} />}
      
      <Sidebar 
        activeChannel={activeChannel} 
        onChannelSelect={setActiveChannel} 
        connectionStatus={connectionStatus}
        quickLinks={getQuickLinks()}
        onResetApiKey={handleResetApiKey}
      />
      
      <main className="flex-1 min-w-0 glass-panel flex flex-col">
         {activeChannel === 'CR' ? (
             <CoreRulesPanel 
                rules={coreRules} 
                onUpdateRules={setCoreRules}
                apiKey={apiKey}
                isLoading={isLoading}
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
                canRegenerate={(messages[activeChannel] || []).length > 0}
                draft={drafts[activeChannel] || ''}
                onDraftChange={handleDraftChange}
                detectedContext={detectedContext}
            />
         )}
      </main>
    </div>
  );
};

export default App;