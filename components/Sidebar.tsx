
import React, { useState, useMemo } from 'react';
import { FORMATS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import GeeLogo from './GeeLogo';

const Sidebar = ({ activeChannel, onChannelSelect, connectionStatus = 'connected', contextLinks = [], channelLinks = [], userProfile, onEditProfile, onClearChat, onOpenRules, onOpenSourceTruth, onOpenSustainability, isOpen, onClose, brandLogo, detectedContext }) => {
  const [customShortcuts, setCustomShortcuts] = useLocalStorage('gee_custom_shortcuts', []);
  const [isAddingShortcut, setIsAddingShortcut] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ name: '', url: '' });
  const [confirmClear, setConfirmClear] = useState(false);

  const CORE_APPS = useMemo(() => [
      { 
          name: 'Gee AI', 
          icon: <GeeLogo className="w-full h-full" customSrc={brandLogo} />, 
          colorClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
          active: true, 
          url: null, 
          action: () => onChannelSelect('EO') 
      },
      { 
          name: 'Stripe Dashboard', 
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.893-1.352 2.222-1.352 1.884 0 3.806.669 5.268 1.346l.89-3.766C17.445 2.225 15.45 1.75 13.12 1.75c-3.845 0-6.604 1.966-6.604 5.459 0 2.894 2.067 4.347 5.742 5.587 2.238.76 3.011 1.492 3.011 2.541 0 .931-.938 1.566-2.529 1.566-2.22 0-4.764-.886-6.48-1.845l-.942 3.926c1.813.776 4.171 1.266 6.529 1.266 4.166 0 7.03-1.966 7.03-5.621 0-3.31-2.446-4.66-4.899-5.479z"/></svg>
          ), 
          colorClass: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400',
          active: true, 
          url: 'https://dashboard.stripe.com/' 
      },
      { 
          name: 'Stripe Docs', 
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          ),
          colorClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
          active: true, 
          url: 'https://docs.stripe.com/' 
      },
      { 
          name: 'Stripe Support', 
          icon: (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ),
          colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
          active: true, 
          url: 'https://support.stripe.com/' 
      },
      { 
          name: 'Slack', 
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52h-2.521zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.522-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.522-2.522v-2.522h2.522zM15.165 17.688a2.527 2.527 0 0 1-2.522-2.521 2.527 2.527 0 0 1 2.522-2.522h6.312A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z"/></svg>
          ),
          colorClass: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
          active: true, 
          url: 'https://slack.com/' 
      }
  ], [brandLogo, onChannelSelect]);
  
  const getStatusColor = () => {
      switch(connectionStatus) {
          case 'error': return 'bg-red-500 shadow-[0_0_8px_rgba(239,18,68,0.6)]';
          case 'connecting': return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
          default: return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
      }
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
    } else {
        setConfirmClear(true);
        setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  const renderColoredLink = (linkName) => {
      const parts = linkName.split(':');
      if (parts.length < 2) return <span className="truncate">{linkName}</span>;
      
      const type = parts[0].trim();
      const name = parts.slice(1).join(':').trim();
      
      let badgeClass = "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
      
      if (type.toLowerCase() === 'dashboard') {
          badgeClass = "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30";
      } else if (type.toLowerCase() === 'docs') {
          badgeClass = "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30";
      } else if (type.toLowerCase() === 'support') {
          badgeClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
      } else if (type.toLowerCase() === 'internal') {
          badgeClass = "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
      }

      return (
          <div className="flex items-center min-w-0 w-full">
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border mr-2 tracking-wide ${badgeClass} shrink-0`}>
                  {type}
              </span>
              <span className="truncate">{name}</span>
          </div>
      );
  };

  const getWorkflowColor = (id, active) => {
      if (!active) return 'text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200';
      switch(id) {
          case 'EO': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 shadow-sm ring-1 ring-indigo-200 dark:ring-transparent';
          case 'CL': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 shadow-sm ring-1 ring-amber-200 dark:ring-transparent';
          case 'INV': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30 shadow-sm ring-1 ring-sky-200 dark:ring-transparent';
          case 'QS': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 shadow-sm ring-1 ring-emerald-200 dark:ring-transparent';
          case 'CF': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 shadow-sm ring-1 ring-rose-200 dark:ring-transparent';
          default: return 'bg-zinc-100 text-zinc-900';
      }
  };

  const getWorkflowIconColor = (id, active) => {
       if (!active) return 'text-zinc-400';
       switch(id) {
          case 'EO': return 'text-indigo-600 dark:text-indigo-400';
          case 'CL': return 'text-amber-600 dark:text-amber-400';
          case 'INV': return 'text-sky-600 dark:text-sky-400';
          case 'QS': return 'text-emerald-600 dark:text-emerald-400';
          case 'CF': return 'text-rose-600 dark:text-rose-400';
          default: return 'text-zinc-500';
      }
  }

  const linksToDisplay = contextLinks.length > 0 ? contextLinks : channelLinks;
  const isContextActive = contextLinks.length > 0;

  return (
    <aside className={`
        fixed inset-y-0 left-0 z-40 w-[280px] md:w-[260px] 
        bg-indigo-50 dark:bg-[#0c0c0e]
        border-r border-indigo-100 dark:border-white/5 flex flex-col h-full transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:relative md:shadow-none
    `} aria-label="Sidebar navigation">
      
      <button 
        onClick={onClose}
        aria-label="Close sidebar"
        className="absolute top-4 right-4 p-2 md:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="px-5 h-[4.5rem] flex items-center flex-shrink-0">
        <div className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none ring-1 ring-black/5 overflow-hidden">
                 <GeeLogo className="w-6 h-6 text-white" customSrc={brandLogo} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">GEE SUPPORT</span>
                <span className="text-[10px] font-medium text-indigo-500 dark:text-zinc-500">Developer Edition</span>
            </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-8 overflow-y-auto scrollbar-thin">
        
        <div className="px-1">
            <button
                onClick={handleClearClick}
                aria-label="Start a new case (clears chat)"
                className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
                    confirmClear 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-200 border border-indigo-100 dark:border-white/5 hover:border-indigo-300 hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
            >
                {confirmClear ? (
                    <span className="animate-pulse">Confirm New Case?</span>
                ) : (
                    <>
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Start New Case
                    </>
                )}
            </button>
        </div>

        <nav role="group" aria-labelledby="formats-heading">
          <h3 id="formats-heading" className="px-3 text-[11px] font-semibold text-indigo-400 dark:text-zinc-500 mb-3 pl-4 uppercase tracking-wider">
              Workflows
          </h3>
          <ul className="space-y-1">
            {FORMATS.filter(f => f.id !== 'CR').map((format) => {
               const isActive = activeChannel === format.id;
               const colorClass = getWorkflowColor(format.id, isActive);
               return (
                <li key={format.id}>
                  <button
                    onClick={() => onChannelSelect(format.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 relative border border-transparent ${colorClass}`}
                  >
                    <span className={`w-6 flex justify-center mr-1.5 transition-colors ${getWorkflowIconColor(format.id, isActive)}`}>
                        {isActive ? '●' : '#'}
                    </span>
                    <span className="truncate tracking-wide">{format.name}</span>
                  </button>
                </li>
              );
            })}
            
             <li className="mt-6 pt-4 border-t border-indigo-100 dark:border-white/5 space-y-1">
                  {/* Source of Truth Button */}
                  <button
                    onClick={onOpenSourceTruth}
                    className="w-full flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 text-zinc-500 dark:text-zinc-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="truncate">SOURCE OF TRUTH</span>
                  </button>
                  {/* Core Rules Button */}
                  <button
                    onClick={onOpenRules}
                    className="w-full flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 text-zinc-500 dark:text-zinc-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">CORE RULES</span>
                  </button>
                  {/* Sustainability Button */}
                  <button
                    onClick={onOpenSustainability}
                    className="w-full flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 text-zinc-500 dark:text-zinc-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                    <span className="truncate uppercase">Sustainability</span>
                  </button>
             </li>
          </ul>
        </nav>
        
        <nav role="group" aria-labelledby="links-heading">
            <div className="flex justify-between items-end px-3 mb-2 pl-4">
                <h3 id="links-heading" className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2 ${isContextActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-indigo-400 dark:text-zinc-500'}`}>
                    {isContextActive ? (
                        <>
                            <svg className="w-3.5 h-3.5 text-indigo-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M9 21h6v-5h5v-6h-5v-6h-6v6h-5v6h5z"/></svg>
                            Relevant Resources
                        </>
                    ) : (
                        "Quick Links"
                    )}
                </h3>
                {isContextActive && detectedContext && (
                    <span className="text-[8px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded font-bold uppercase border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                        {detectedContext}
                    </span>
                )}
            </div>
            
            <ul className={`space-y-1 transition-all duration-300 ${isContextActive ? 'p-2 rounded-xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-zinc-900 border border-amber-200 dark:border-amber-500/30 shadow-md ring-1 ring-amber-100 dark:ring-transparent' : ''}`}>
                {linksToDisplay.map((link) => (
                    <li key={link.url}>
                        <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-full flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors border shadow-sm group
                                ${isContextActive 
                                    ? 'text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-100 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-600'
                                    : 'text-zinc-500 dark:text-zinc-400 bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-300'
                                }
                            `}
                        >
                           {renderColoredLink(link.name)}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>

        <nav role="group" aria-labelledby="apps-heading">
          <h3 id="apps-heading" className="px-3 text-[11px] font-semibold text-indigo-400 dark:text-zinc-500 mb-2 pl-4 uppercase tracking-wider">
              Shortcuts
          </h3>
          <ul className="space-y-1">
            {CORE_APPS.map((app) => (
                <li key={app.name}>
                  {app.url ? (
                     <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors group text-zinc-600 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-white/10"
                     >
                        <div className={`w-5 h-5 mr-3 rounded-md flex items-center justify-center p-1 shadow-sm ${app.colorClass}`}>
                           {app.icon}
                        </div>
                        {app.name}
                     </a>
                  ) : (
                      <button 
                        onClick={app.action}
                        className="w-full flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors group text-zinc-600 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-white/10"
                      >
                         <div className={`w-5 h-5 mr-3 rounded-md flex items-center justify-center p-1 shadow-sm ${app.colorClass}`}>
                           {app.icon}
                        </div>
                        {app.name}
                        {app.active && app.name === 'Gee AI' && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${getStatusColor()} ring-1 ring-white dark:ring-zinc-900`}></span>}
                      </button>
                  )}
                </li>
            ))}
            
            {customShortcuts.map((link, index) => (
                <li key={`${link.name}-${index}`} className="relative group">
                    <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors group text-zinc-600 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-white/10"
                    >
                        <div className="w-5 h-5 mr-3 flex items-center justify-center rounded-md bg-white dark:bg-zinc-800 text-zinc-500 group-hover:text-indigo-500 text-[9px] font-bold shadow-sm border border-zinc-100 dark:border-zinc-700">
                             {link.name.substring(0,1).toUpperCase()}
                        </div>
                        {link.name}
                    </a>
                    <button 
                        onClick={(e) => { e.preventDefault(); removeShortcut(index); }}
                        aria-label={`Remove shortcut: ${link.name}`}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </li>
            ))}

            <li className="pt-1">
                {!isAddingShortcut ? (
                    <button 
                        onClick={() => setIsAddingShortcut(true)}
                        className="w-full flex items-center px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors gap-3"
                    >
                         <div className="w-5 h-5 flex items-center justify-center rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 group-hover:border-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                         </div>
                        Add Shortcut
                    </button>
                ) : (
                    <div className="mx-2 p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-lg animate-fade-in-up">
                        <input 
                            type="text" 
                            placeholder="Name"
                            value={newShortcut.name}
                            maxLength={30}
                            onChange={(e) => setNewShortcut({...newShortcut, name: e.target.value})}
                            aria-label="Shortcut Name"
                            className="w-full bg-zinc-50 dark:bg-black border-b border-zinc-100 dark:border-zinc-800 text-xs px-1 py-1 focus:outline-none focus:border-indigo-500"
                            autoFocus
                        />
                        <input 
                            type="text" 
                            placeholder="URL"
                            value={newShortcut.url}
                            maxLength={2048}
                            onChange={(e) => setNewShortcut({...newShortcut, url: e.target.value})}
                            aria-label="Shortcut URL"
                            className="w-full bg-zinc-50 dark:bg-black border-b border-zinc-100 dark:border-zinc-800 text-xs px-1 py-1 focus:outline-none focus:border-indigo-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddShortcut()}
                        />
                        <div className="flex justify-end gap-2 mt-1">
                            <button onClick={() => setIsAddingShortcut(false)} className="text-[10px] text-zinc-400 hover:text-zinc-600">Cancel</button>
                            <button onClick={handleAddShortcut} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">Add</button>
                        </div>
                    </div>
                )}
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="p-3 border-t border-indigo-100 dark:border-white/5 bg-indigo-50 dark:bg-[#0c0c0e] space-y-1">
          {/* Project Health Meter */}
          <div className="px-2 mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-bold text-indigo-400 dark:text-zinc-500 uppercase tracking-widest">Project Health</span>
                <span className="text-[9px] font-bold text-emerald-500">99%</span>
            </div>
            <div className="h-1.5 w-full bg-indigo-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99.9%' }}></div>
            </div>
            <p className="text-[8px] text-zinc-400 mt-1 italic">Credits covering RM 826.37 gross cost</p>
          </div>

          <button 
            onClick={onOpenSustainability}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors group mb-2"
          >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <span>Support Developer</span>
          </button>

          <button 
            onClick={onEditProfile}
            className="w-full flex items-center gap-3 hover:bg-white/50 dark:hover:bg-white/10 p-1.5 rounded-xl cursor-pointer transition-colors group text-left"
            aria-label="Edit Profile Settings"
          >
              <img 
                src={userProfile?.avatar || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80"}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-zinc-800 group-hover:ring-indigo-500 transition-all shadow-sm"
              />
              <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {userProfile?.name || "Support Agent"}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-500">Settings</div>
              </div>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;
