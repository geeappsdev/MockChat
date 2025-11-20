
import React, { useState, useEffect } from 'react';
import { FORMATS } from '../constants';

const Sidebar = ({ activeChannel, onChannelSelect, connectionStatus = 'connected', quickLinks = [] }) => {
  // Core fixed apps
  const CORE_APPS = [
      { name: 'Gee AI', icon: 'https://ui-avatars.com/api/?name=Gee+AI&background=18181b&color=fff&rounded=true&bold=true&size=64', active: true, url: null },
      { name: 'Stripe Docs', icon: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', active: true, url: 'https://docs.stripe.com/' },
      { name: 'Stripe Support', icon: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', active: true, url: 'https://support.stripe.com/' },
      { name: 'Google Calendar', icon: 'https://cdn.worldvectorlogo.com/logos/google-calendar.svg', active: true, url: 'https://calendar.google.com/' },
  ];

  const [shortcuts, setShortcuts] = useState(() => {
      try {
          const saved = localStorage.getItem('sidebar_shortcuts');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ name: '', url: '' });

  useEffect(() => {
      localStorage.setItem('sidebar_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  const handleAddShortcut = () => {
      if (newShortcut.name && newShortcut.url) {
          let url = newShortcut.url;
          if (!url.startsWith('http')) {
              url = `https://${url}`;
          }
          // Generate a placeholder icon based on the name
          const icon = `https://ui-avatars.com/api/?name=${encodeURIComponent(newShortcut.name)}&background=random&color=fff&rounded=true&bold=true&size=64`;
          
          setShortcuts([...shortcuts, { name: newShortcut.name, url, icon, active: true, isCustom: true }]);
          setNewShortcut({ name: '', url: '' });
          setIsAdding(false);
      }
  };

  const removeShortcut = (indexToRemove) => {
      setShortcuts(shortcuts.filter((_, index) => index !== indexToRemove));
  };
  
  const getStatusColor = () => {
      switch(connectionStatus) {
          case 'error': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
          case 'connecting': return 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]';
          default: return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]';
      }
  };

  const getStatusText = () => {
       switch(connectionStatus) {
          case 'error': return 'Connection Failed';
          case 'connecting': return 'Connecting...';
          default: return 'Online';
      }
  };

  const getStatusTextColor = () => {
      switch(connectionStatus) {
          case 'error': return 'text-red-600 dark:text-red-400';
          case 'connecting': return 'text-amber-600 dark:text-amber-400';
          default: return 'text-emerald-600 dark:text-emerald-400';
      }
  };

  const getChannelSlug = (name) => {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  return (
    <aside className="w-64 bg-white/40 dark:bg-black/40 backdrop-blur-2xl flex flex-col h-full border-r border-white/20 dark:border-white/10 z-20 flex-shrink-0 shadow-2xl" aria-label="Sidebar navigation">
      {/* Header */}
      <div className="px-4 h-16 flex items-center border-b border-white/10 dark:border-white/5 sticky top-0">
        <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-zinc-800 to-black dark:from-white dark:to-zinc-300 rounded-lg flex items-center justify-center shadow-lg">
                 <span className="text-lg font-bold text-white dark:text-black font-sans">G</span>
            </div>
            <span className="drop-shadow-sm">Gee Support</span>
        </h1>
      </div>

      <div className="flex-1 px-3 py-4 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-400 dark:hover:scrollbar-thumb-zinc-700">
        {/* Formats Section */}
        <div role="group" aria-labelledby="formats-heading">
          <h3 id="formats-heading" className="px-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 font-sans drop-shadow-sm">
              Formats
          </h3>
          <ul className="space-y-1">
            {FORMATS.filter(f => f.id !== 'CR').map((format) => {
               const isActive = activeChannel === format.id;
               return (
                <li key={format.id}>
                  <button
                    onClick={() => onChannelSelect(format.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent ${
                      isActive
                        ? 'bg-white/60 dark:bg-white/10 text-zinc-900 dark:text-zinc-50 shadow-lg backdrop-blur-md border-white/40 dark:border-white/10 ring-1 ring-black/5'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span className={`mr-3 text-base leading-none transition-colors ${isActive ? 'text-zinc-800 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400'}`}>#</span>
                    <span className="truncate">{getChannelSlug(format.name)}</span>
                  </button>
                </li>
              );
            })}
             <li className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-white/10">
                  <button
                    onClick={() => onChannelSelect('CR')}
                    aria-current={activeChannel === 'CR' ? 'page' : undefined}
                    className={`w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent ${
                      activeChannel === 'CR'
                        ? 'bg-white/60 dark:bg-white/10 text-zinc-900 dark:text-zinc-50 shadow-lg backdrop-blur-md border-white/40 dark:border-white/10'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-3 transition-colors ${activeChannel === 'CR' ? 'text-zinc-800 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">core-rules</span>
                  </button>
             </li>
          </ul>
        </div>
        
        {/* Quick Links Section */}
        {quickLinks.length > 0 && (
            <div role="group" aria-labelledby="links-heading">
                <h3 id="links-heading" className="px-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 font-sans drop-shadow-sm">
                    Quick Links
                </h3>
                <ul className="space-y-1">
                    {quickLinks.map((link) => (
                        <li key={link.name}>
                            <a 
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="truncate">{link.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* Apps Section */}
        <div role="group" aria-labelledby="apps-heading">
          <h3 id="apps-heading" className="px-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 font-sans drop-shadow-sm">
              Apps
          </h3>
          <ul className="space-y-1">
            {CORE_APPS.concat(shortcuts).map((app, index) => (
                <li key={app.name + index}>
                  {app.url ? (
                     <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors group border border-white/20 dark:border-white/5 text-zinc-700 dark:text-zinc-300 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 shadow-sm hover:shadow-md relative"
                     >
                        <img src={app.icon} alt={app.name} className="w-5 h-5 mr-3 transition-all object-contain opacity-80 group-hover:opacity-100" />
                        <span className="truncate flex-1 text-left">{app.name}</span>
                        {/* Delete button for custom shortcuts */}
                        {(app as any).isCustom && (
                            <button 
                                onClick={(e) => { e.preventDefault(); removeShortcut(index - CORE_APPS.length); }}
                                className="ml-2 p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove shortcut"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        {!((app as any).isCustom) && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-auto text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        )}
                     </a>
                  ) : (
                      <button 
                        disabled={!app.active}
                        className={`w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors group border border-white/20 dark:border-white/5 ${
                            app.active 
                            ? 'text-zinc-700 dark:text-zinc-300 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 shadow-sm hover:shadow-md' 
                            : 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60 bg-white/10 dark:bg-white/5'
                        }`}
                      >
                        <img src={app.icon} alt={app.name} className={`w-5 h-5 mr-3 transition-all object-contain ${app.active ? '' : 'grayscale opacity-70'}`} />
                        <span className="truncate flex-1 text-left">{app.name}</span>
                        {app.active && app.name === 'Gee AI' && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${getStatusColor()}`}></span>}
                      </button>
                  )}
                </li>
            ))}
          </ul>
          
          {/* Add Shortcut UI */}
          <div className="mt-3 px-1">
              {isAdding ? (
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-zinc-200 dark:border-white/10 shadow-lg backdrop-blur-md animate-fade-in-up">
                      <div className="mb-3">
                          <input
                              type="text"
                              placeholder="Shortcut Name"
                              value={newShortcut.name}
                              onChange={(e) => setNewShortcut({...newShortcut, name: e.target.value})}
                              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 text-xs py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder-zinc-400 mb-2"
                              autoFocus
                          />
                          <input
                              type="text"
                              placeholder="URL (e.g., stripe.com)"
                              value={newShortcut.url}
                              onChange={(e) => setNewShortcut({...newShortcut, url: e.target.value})}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddShortcut()}
                              className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 text-xs py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder-zinc-400"
                          />
                      </div>
                      <div className="flex gap-2">
                          <button 
                              onClick={handleAddShortcut}
                              disabled={!newShortcut.name || !newShortcut.url}
                              className="flex-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold py-1.5 rounded-lg hover:bg-black dark:hover:bg-white transition-colors disabled:opacity-50"
                          >
                              Add
                          </button>
                          <button 
                              onClick={() => setIsAdding(false)}
                              className="flex-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold py-1.5 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                          >
                              Cancel
                          </button>
                      </div>
                  </div>
              ) : (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-500 hover:bg-white/40 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Shortcut
                  </button>
              )}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-lg">
          <div className="flex items-center gap-3 hover:bg-white/30 dark:hover:bg-white/10 p-2 rounded-xl cursor-pointer transition-colors group">
              <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
                    alt="Admin User"
                    className="w-10 h-10 rounded-full shadow-md object-cover ring-2 ring-white/50 dark:ring-white/20"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-zinc-900 rounded-full ${getStatusColor()}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-black dark:group-hover:text-white">Admin User</div>
                  <div className={`text-[11px] font-medium truncate opacity-80 ${getStatusTextColor()}`}>{getStatusText()}</div>
              </div>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;
