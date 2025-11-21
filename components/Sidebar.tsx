
import React, { useState } from 'react';
import { FORMATS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';

const Sidebar = ({ activeChannel, onChannelSelect, connectionStatus = 'connected', quickLinks = [], userProfile, onEditProfile, onClearChat }) => {
  const [customShortcuts, setCustomShortcuts] = useLocalStorage('gee_custom_shortcuts', []);
  const [isAddingShortcut, setIsAddingShortcut] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ name: '', url: '' });
  const [confirmClear, setConfirmClear] = useState(false);

  const CORE_APPS = [
      { name: 'Gee AI', icon: 'https://ui-avatars.com/api/?name=Gee+AI&background=4f46e5&color=fff&rounded=true&bold=true&size=64', active: true, url: null, action: () => onChannelSelect('EO') },
      { name: 'Stripe Docs', icon: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', active: true, url: 'https://docs.stripe.com/' },
      { name: 'Stripe Support', icon: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', active: true, url: 'https://support.stripe.com/' },
      { name: 'Google Calendar', icon: 'https://cdn.worldvectorlogo.com/logos/google-calendar.svg', active: true, url: 'https://calendar.google.com/' },
  ];
  
  const getStatusColor = () => {
      switch(connectionStatus) {
          case 'error': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
          case 'connecting': return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
          default: return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
      }
  };

  const getStatusText = () => {
       switch(connectionStatus) {
          case 'error': return 'Offline';
          case 'connecting': return 'Connecting...';
          default: return 'Online';
      }
  };

  const getChannelSlug = (name) => {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleAddShortcut = () => {
      if (newShortcut.name.trim() && newShortcut.url.trim()) {
          let url = newShortcut.url;
          if (!url.startsWith('http')) {
              url = `https://${url}`;
          }
          setCustomShortcuts([...customShortcuts, { ...newShortcut, url }]);
          setNewShortcut({ name: '', url: '' });
          setIsAddingShortcut(false);
      }
  };

  const removeShortcut = (index) => {
      const updated = [...customShortcuts];
      updated.splice(index, 1);
      setCustomShortcuts(updated);
  };

  const handleClearClick = () => {
    if (confirmClear) {
        if (onClearChat) onClearChat();
        setConfirmClear(false);
        onChannelSelect('EO'); 
    } else {
        setConfirmClear(true);
        setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <aside className="w-[280px] bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl flex flex-col h-full border-r border-zinc-200/50 dark:border-white/5 z-20 flex-shrink-0 transition-all duration-300" aria-label="Sidebar navigation">
      {/* Header */}
      <div className="px-6 h-[4.5rem] flex items-center border-b border-zinc-200/50 dark:border-white/5 flex-shrink-0">
        <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-zinc-800 to-zinc-600 dark:from-white dark:to-zinc-300 text-white dark:text-black rounded-lg flex items-center justify-center shadow-lg shadow-zinc-500/20 ring-1 ring-black/5">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                   <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-10.28 0a.75.75 0 01.22-.53l2.25-2.25a.75.75 0 111.06 1.06L8.56 12l1.72 1.72a.75.75 0 11-1.06 1.06l-2.25-2.25a.75.75 0 01-.22-.53z" clipRule="evenodd" />
                 </svg>
            </div>
            <div className="flex flex-col leading-none">
                <span className="font-black text-[13px] tracking-tighter uppercase text-zinc-800 dark:text-white">GEE WEB APP</span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">DEVELOPER</span>
            </div>
        </h1>
      </div>

      <div className="flex-1 px-3 py-6 space-y-8 overflow-y-auto scrollbar-thin">
        
        {/* NEW CASE BUTTON */}
        <div className="px-3">
            <button
                onClick={handleClearClick}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
                    confirmClear 
                    ? 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-200 dark:ring-red-900' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-white/10 hover:border-indigo-500/50 hover:shadow-md'
                }`}
            >
                {confirmClear ? (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Confirm Clear
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        New Case
                    </>
                )}
            </button>
            <p className="mt-2 text-[10px] text-center text-zinc-400 dark:text-zinc-500">Clears context for fresh start</p>
        </div>

        {/* Formats Section */}
        <nav role="group" aria-labelledby="formats-heading">
          <h3 id="formats-heading" className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 font-mono">
              Workflows
          </h3>
          <ul className="space-y-0.5">
            {FORMATS.filter(f => f.id !== 'CR').map((format) => {
               const isActive = activeChannel === format.id;
               return (
                <li key={format.id}>
                  <button
                    onClick={() => onChannelSelect(format.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-white dark:bg-white/5 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span className={`mr-2.5 text-sm transition-colors ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500'}`}>#</span>
                    <span className="truncate">{getChannelSlug(format.name)}</span>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-r-full opacity-0"></div>}
                  </button>
                </li>
              );
            })}
             <li className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-white/5">
                  <button
                    onClick={() => onChannelSelect('CR')}
                    aria-current={activeChannel === 'CR' ? 'page' : undefined}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      activeChannel === 'CR'
                        ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-zinc-50 shadow-sm ring-1 ring-zinc-200 dark:ring-white/10'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2.5 transition-colors ${activeChannel === 'CR' ? 'text-zinc-800 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">core-rules</span>
                  </button>
             </li>
          </ul>
        </nav>
        
        {/* Quick Links Section */}
        <nav role="group" aria-labelledby="links-heading">
            <h3 id="links-heading" className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                Context Links
            </h3>
            <ul className="space-y-0.5">
                {/* Context Links */}
                {quickLinks.map((link) => (
                    <li key={link.name}>
                        <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2.5 text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="truncate">{link.name}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>

        {/* Apps Section */}
        <nav role="group" aria-labelledby="apps-heading">
          <h3 id="apps-heading" className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 font-mono">
              Apps & Shortcuts
          </h3>
          <ul className="space-y-0.5">
            {CORE_APPS.map((app) => (
                <li key={app.name}>
                  {app.url ? (
                     <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group text-zinc-700 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-white/5"
                     >
                        <img src={app.icon} alt={app.name} className="w-4 h-4 mr-2.5 transition-all object-contain opacity-70 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
                        {app.name}
                     </a>
                  ) : (
                      <button 
                        onClick={app.action}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group text-zinc-700 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-white/5`}
                      >
                        <img src={app.icon} alt={app.name} className={`w-4 h-4 mr-2.5 transition-all object-contain`} />
                        {app.name}
                        {app.active && app.name === 'Gee AI' && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${getStatusColor()} ring-2 ring-white dark:ring-zinc-900`}></span>}
                      </button>
                  )}
                </li>
            ))}
            
            {/* Custom Shortcuts */}
            {customShortcuts.map((link, index) => (
                <li key={`${link.name}-${index}`} className="relative group">
                    <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group text-zinc-700 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm border border-transparent hover:border-zinc-200 dark:hover:border-white/5"
                    >
                        <div className="w-4 h-4 mr-2.5 flex items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                             <span className="text-[9px] font-bold">{link.name.substring(0,2).toUpperCase()}</span>
                        </div>
                        {link.name}
                    </a>
                    <button 
                        onClick={(e) => { e.preventDefault(); removeShortcut(index); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10 bg-white dark:bg-zinc-900 rounded shadow-sm"
                        aria-label="Remove shortcut"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </li>
            ))}

            {/* Add Shortcut Button / Form */}
            <li className="pt-2">
                {!isAddingShortcut ? (
                    <button 
                        onClick={() => setIsAddingShortcut(true)}
                        className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Shortcut
                    </button>
                ) : (
                    <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 animate-fade-in-up shadow-lg">
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">New Shortcut</h4>
                        <input 
                            type="text" 
                            placeholder="Name (e.g. Jira)"
                            value={newShortcut.name}
                            onChange={(e) => setNewShortcut({...newShortcut, name: e.target.value})}
                            className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-400"
                            autoFocus
                        />
                        <input 
                            type="text" 
                            placeholder="URL (e.g. jira.com)"
                            value={newShortcut.url}
                            onChange={(e) => setNewShortcut({...newShortcut, url: e.target.value})}
                            className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs px-2 py-2 focus:outline-none focus:border-indigo-500 placeholder-zinc-400"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddShortcut()}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleAddShortcut} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                                Add
                            </button>
                            <button onClick={() => setIsAddingShortcut(false)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </li>
          </ul>
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-zinc-200/50 dark:border-white/5 bg-white/30 dark:bg-black/20 backdrop-blur-lg">
          <button 
            onClick={onEditProfile}
            className="w-full flex items-center gap-3 hover:bg-white/50 dark:hover:bg-white/5 p-2 rounded-xl cursor-pointer transition-colors group text-left"
            title="Edit Profile"
          >
              <div className="relative">
                  <img 
                    src={userProfile?.avatar || "https://ui-avatars.com/api/?name=User"}
                    alt={userProfile?.name || "User"}
                    className="w-8 h-8 rounded-lg shadow-sm object-cover ring-1 ring-black/5 dark:ring-white/10"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white dark:border-zinc-900 rounded-full ${getStatusColor()}`}></div>
                  <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </div>
              </div>
              <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {userProfile?.name || "Admin User"}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium truncate">{getStatusText()}</div>
              </div>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;
