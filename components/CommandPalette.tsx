import React, { useState, useEffect, useRef } from 'react';
import { FORMATS } from '../constants';

const CommandPalette = ({ isOpen: externalIsOpen, onClose, onCommand, activeChannel }) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Commands Configuration
  const STATIC_COMMANDS = [
    { id: 'clear', name: 'Clear Chat / New Case', section: 'Actions', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    )},
    { id: 'settings', name: 'Profile Settings', section: 'General', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
    { id: 'rules', name: 'Core Rules Configuration', section: 'General', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    )},
  ];

  const channelCommands = FORMATS.filter(f => f.id !== 'CR').map(f => ({
      id: `channel:${f.id}`,
      name: `Switch to ${f.name}`,
      section: 'Workflows',
      icon: (
        <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px] rounded border border-current opacity-70">{f.id}</span>
      )
  }));

  const allCommands = [...STATIC_COMMANDS, ...channelCommands];

  // Sync external open state
  useEffect(() => {
      setIsOpen(externalIsOpen);
  }, [externalIsOpen]);

  // Keyboard Event Listener
  useEffect(() => {
    const onKeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [onClose]);

  // Focus input when opened
  useEffect(() => {
      if (isOpen) {
          setTimeout(() => inputRef.current?.focus(), 50);
      }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
      setSelectedIndex(0);
  }, [query]);

  const filteredCommands = allCommands.filter(cmd => 
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.section.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (command) => {
      onCommand(command.id);
      setIsOpen(false);
      onClose();
      setQuery('');
  };

  const handleNavigation = (e) => {
      if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
              handleSelect(filteredCommands[selectedIndex]);
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <div 
            className="fixed inset-0 bg-zinc-900/20 dark:bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => { setIsOpen(false); onClose(); }}
        />

        {/* Palette Window */}
        <div className="w-full max-w-xl bg-white dark:bg-[#0c0c0e] rounded-xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden relative flex flex-col animate-fade-in-up ring-1 ring-black/5">
            <div className="flex items-center px-4 py-3 border-b border-zinc-100 dark:border-white/5">
                <svg className="w-5 h-5 text-zinc-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none"
                    placeholder="Type a command or search..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleNavigation}
                />
                <div className="text-[10px] font-medium text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5">ESC</div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2 scrollbar-thin" ref={listRef}>
                {filteredCommands.length === 0 ? (
                    <div className="px-4 py-8 text-center text-zinc-400 text-sm">No results found.</div>
                ) : (
                    filteredCommands.map((cmd, index) => (
                        <button
                            key={cmd.id}
                            onClick={() => handleSelect(cmd)}
                            className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
                                index === selectedIndex 
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-100' 
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5'
                            }`}
                        >
                            <div className={`w-5 h-5 mr-3 flex items-center justify-center ${index === selectedIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`}>
                                {cmd.icon}
                            </div>
                            <span className="flex-1 text-left">{cmd.name}</span>
                            {index === selectedIndex && (
                                <span className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 ml-3">Enter</span>
                            )}
                        </button>
                    ))
                )}
            </div>
            
            {activeChannel && (
                 <div className="px-4 py-2 bg-zinc-50 dark:bg-black/40 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
                     <span className="text-[10px] text-zinc-400">Current Channel: <span className="font-medium text-zinc-600 dark:text-zinc-300">{activeChannel}</span></span>
                     <div className="flex gap-3">
                         <span className="text-[10px] text-zinc-400"><span className="font-medium">↑↓</span> to navigate</span>
                         <span className="text-[10px] text-zinc-400"><span className="font-medium">↵</span> to select</span>
                     </div>
                 </div>
            )}
        </div>
    </div>
  );
};

export default CommandPalette;