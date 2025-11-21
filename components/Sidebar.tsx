

import React from 'react';
import { FORMATS } from '../constants';

const APPS = [
    { name: 'Gee AI', icon: 'https://ui-avatars.com/api/?name=Gee+AI&background=18181b&color=fff&rounded=true&bold=true&size=64', active: true, url: null },
    { name: 'Stripe Docs', icon: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', active: true, url: 'https://docs.stripe.com/' },
    { name: 'Stripe Support', icon: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg', active: true, url: 'https://support.stripe.com/' },
    { name: 'Google Calendar', icon: 'https://cdn.worldvectorlogo.com/logos/google-calendar.svg', active: true, url: 'https://calendar.google.com/' },
    { name: 'Jira', icon: 'https://cdn.worldvectorlogo.com/logos/jira-3.svg', active: false, url: null },
    { name: 'Notion', icon: 'https://cdn.worldvectorlogo.com/logos/notion-2.svg', active: false, url: null }
];

const Sidebar = ({ activeChannel, onChannelSelect, connectionStatus = 'connected', quickLinks = [], onResetApiKey }) => {
  
  const getStatusColor = () => {
      switch(connectionStatus) {
          case 'error': return 'bg-red-500';
          case 'connecting': return 'bg-amber-400';
          default: return 'bg-emerald-500';
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

  return (
    <aside className="w-64 bg-zinc-50/50 dark:bg-zinc-950 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 z-20 transition-colors duration-300 flex-shrink-0 backdrop-blur-xl" aria-label="Sidebar navigation">
      {/* Header */}
      <div className="px-4 h-16 flex items-center border-b border-transparent sticky top-0 bg-zinc-50/50 dark:bg-zinc-950 z-10">
        <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center shadow-sm ring-1 ring-zinc-900/5 dark:ring-zinc-100/10">
                 <span className="text-lg font-bold text-zinc-100 dark:text-zinc-900 font-sans">G</span>
            </div>
            Gee Support
        </h1>
      </div>

      <div className="flex-1 px-3 py-4 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-400 dark:hover:scrollbar-thumb-zinc-700">
        {/* Formats Section */}
        <div role="group" aria-labelledby="formats-heading">
          <h3 id="formats-heading" className="px-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider mb-2 font-sans">
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
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span className={`mr-2.5 text-base leading-none transition-colors ${isActive ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-300 dark:text-zinc-500 group-hover:text-zinc-400 dark:group-hover:text-zinc-400'}`}>#</span>
                    <span className="truncate">{format.id.toLowerCase()}-{format.name.toLowerCase().replace(/\s+/g, '-')}</span>
                  </button>
                </li>
              );
            })}
             <li className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                  <button
                    onClick={() => onChannelSelect('CR')}
                    aria-current={activeChannel === 'CR' ? 'page' : undefined}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group ${
                      activeChannel === 'CR'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2.5 transition-colors ${activeChannel === 'CR' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
                <h3 id="links-heading" className="px-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider mb-2 font-sans">
                    Quick Links
                </h3>
                <ul className="space-y-1">
                    {quickLinks.map((link) => (
                        <li key={link.name}>
                            <a 
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2.5 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
          <h3 id="apps-heading" className="px-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider mb-2 font-sans">
              Apps
          </h3>
          <ul className="space-y-1">
            {APPS.map((app) => (
                <li key={app.name}>
                  {app.url ? (
                     <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors group border border-transparent text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                     >
                        <img src={app.icon} alt={app.name} className="w-5 h-5 mr-2.5 transition-all object-contain" />
                        {app.name}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-auto text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                     </a>
                  ) : (
                      <button 
                        disabled={!app.active}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors group border border-transparent ${
                            app.active 
                            ? 'text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800' 
                            : 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <img src={app.icon} alt={app.name} className={`w-5 h-5 mr-2.5 transition-all object-contain ${app.active ? '' : 'grayscale opacity-70'}`} />
                        {app.name}
                        {app.active && app.name === 'Gee AI' && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${getStatusColor()}`}></span>}
                      </button>
                  )}
                </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950">
          <div onClick={onResetApiKey} title="Change API Key" className="flex items-center gap-3 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 p-2 rounded-lg cursor-pointer transition-colors group">
              <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
                    alt="Admin User"
                    className="w-9 h-9 rounded-full shadow-sm object-cover ring-2 ring-white dark:ring-zinc-900"
                  />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-zinc-950 rounded-full ${getStatusColor()}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-300">Admin User</div>
                  <div className={`text-[11px] font-medium truncate ${getStatusTextColor()}`}>{getStatusText()}</div>
              </div>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;