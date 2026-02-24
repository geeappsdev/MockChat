
import React, { useState, useEffect, useRef } from 'react';

// --- ADMIN CONFIGURATION ---
const DEFAULT_STATION = {
    name: "Lofi Beats",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn", 
    description: "Official Team Broadcast"
};

// Provider Configurations for Dynamic Styling & Sizing
const PROVIDER_THEMES = {
    spotify: {
        color: 'emerald',
        primary: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        height: 352, // Native Spotify Large Embed Height
        icon: (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.2-1.32 9.6-0.66 13.38 1.68.42.18.6.84.36 1.141zm0.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
        ),
        label: 'Spotify'
    },
    youtube: {
        color: 'red',
        primary: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        height: 352, // Flexible, but 16:9 ratio usually fits here
        icon: (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
        ),
        label: 'YouTube'
    },
    apple: {
        color: 'rose',
        primary: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        border: 'border-rose-200 dark:border-rose-800',
        height: 450, // Apple Music Playlists need more vertical space
        icon: (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.502 12.002c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-9.002 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/></svg>
        ),
        label: 'Apple Music'
    },
    unknown: {
        color: 'indigo',
        primary: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-indigo-200 dark:border-indigo-800',
        height: 352,
        icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
        ),
        label: 'Stream'
    }
};

const MusicWidget = ({ isAdmin = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // State
    const [currentUrl, setCurrentUrl] = useState(DEFAULT_STATION.url);
    const [stationName, setStationName] = useState(DEFAULT_STATION.name);
    const [inputUrl, setInputUrl] = useState('');
    const [inputName, setInputName] = useState(''); 
    const [iframeKey, setIframeKey] = useState(0);
    
    // Status flags
    const [isCustom, setIsCustom] = useState(false); 
    const [isLoading, setIsLoading] = useState(true);
    const [showInput, setShowInput] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    
    // Visualizer State
    const [isPlaying, setIsPlaying] = useState(false);
    const [listenerCount, setListenerCount] = useState(1);

    const clientId = useRef(Math.random().toString(36).substring(2, 15)).current;
    const containerRef = useRef<HTMLDivElement>(null);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    // --- EMBED LOGIC ---
    const getEmbedSource = (inputUrl: string) => {
        try {
             let cleanUrl = inputUrl.trim();

             // 0. Handle Raw Embed Codes (HTML string)
             if (cleanUrl.startsWith('<')) {
                 const srcMatch = cleanUrl.match(/src\s*=\s*(["'])(.*?)\1/i);
                 if (srcMatch && srcMatch[2]) {
                     cleanUrl = srcMatch[2];
                 } else {
                     return { src: '', type: 'unknown' };
                 }
             }
             
             // 1. YouTube
             if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
                 const origin = window.location.origin;
                 
                 const listMatch = cleanUrl.match(/[?&]list=([^#\&\?]+)/);
                 if (listMatch) {
                     return { 
                         src: `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}&autoplay=1&origin=${origin}`, 
                         type: 'youtube' 
                     };
                 }

                 const videoMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/)|youtu\.be\/)([^#\&\?]*).*/);
                 if (videoMatch && videoMatch[1]) {
                     return { 
                         src: `https://www.youtube.com/embed/${videoMatch[1]}?autoplay=1&origin=${origin}`, 
                         type: 'youtube' 
                     };
                 }
                 
                 if (cleanUrl.includes('/embed/')) {
                     const separator = cleanUrl.includes('?') ? '&' : '?';
                     const hasOrigin = cleanUrl.includes('origin=');
                     return { src: `${cleanUrl}${hasOrigin ? '' : separator + 'autoplay=1&origin=' + origin}`, type: 'youtube' };
                 }
             }

             // 2. Spotify
             if (cleanUrl.includes('spotify.com')) {
                 if (cleanUrl.includes('/embed')) {
                     return { src: cleanUrl, type: 'spotify' };
                 }

                 // Extract Type and ID
                 const spotifyMatch = cleanUrl.match(/\/([a-z]+)\/([a-zA-Z0-9]+)(\?|$)/);
                 if (spotifyMatch) {
                     const type = spotifyMatch[1]; 
                     const id = spotifyMatch[2];
                     
                     if (['track', 'album', 'playlist', 'artist', 'episode'].includes(type)) {
                         return { 
                             src: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`, 
                             type: 'spotify' 
                         };
                     }
                 }
                 
                 // Fallback for regional links
                 if (cleanUrl.includes('open.spotify.com')) {
                     let normalized = cleanUrl.replace(/\/intl-[a-z]{2,3}\//, '/');
                     return { src: normalized.replace('open.spotify.com', 'open.spotify.com/embed'), type: 'spotify' };
                 }
             }

             // 3. Apple Music
             if (cleanUrl.includes('music.apple.com')) {
                 if (!cleanUrl.includes('embed.music.apple.com')) {
                     return { src: cleanUrl.replace('music.apple.com', 'embed.music.apple.com'), type: 'apple' };
                 }
                 return { src: cleanUrl, type: 'apple' };
             }
             
             return { src: cleanUrl, type: 'unknown' };
        } catch (e) { 
            return { src: inputUrl, type: 'unknown' }; 
        }
    };

    const embedInfo = getEmbedSource(currentUrl);
    // @ts-ignore
    const theme = PROVIDER_THEMES[embedInfo.type] || PROVIDER_THEMES.unknown;

    // --- BACKEND SYNC ---
    const fetchStationState = async () => {
        try {
            const response = await fetch(`/api/station?clientId=${clientId}`);
            if (response.ok) {
                const data = await response.json();
                
                if (data.listenerCount !== undefined) {
                    setListenerCount(data.listenerCount);
                }

                if (data.url !== currentUrl) {
                    setCurrentUrl(data.url);
                    setStationName(data.name);
                    setIsCustom(data.isCustom);
                    setIframeKey(prev => prev + 1);
                    setIsLoading(true);
                } else if (data.name !== stationName) {
                    setStationName(data.name);
                }
                setFetchError(false);
            } else {
                throw new Error("Backend response error");
            }
        } catch (error) {
            if (!fetchError && !currentUrl) {
                 setFetchError(true);
            }
        } finally {
             if (isLoading && currentUrl) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStationState();
        const interval = setInterval(fetchStationState, 5000);
        return () => clearInterval(interval);
    }, [currentUrl, stationName]); 

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResetToStation = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await fetch('/api/station', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: DEFAULT_STATION.url,
                    name: DEFAULT_STATION.name,
                    isCustom: false
                })
            });
            fetchStationState();
            setInputUrl('');
            setInputName('');
            setIsPlaying(false);
        } catch (e) {
            setCurrentUrl(DEFAULT_STATION.url);
            setStationName(DEFAULT_STATION.name);
            setIsCustom(false);
            setIframeKey(prev => prev + 1);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputUrl) return;
        
        const detected = getEmbedSource(inputUrl);
        
        if (detected.type === 'unknown' && !detected.src) {
             alert("Please enter a valid link or embed code from Spotify, YouTube, or Apple Music.");
             return;
        }
        
        const urlToSubmit = detected.src || inputUrl;
        const newName = inputName.trim() || "Shared Stream";

        try {
            setIsLoading(true);
            await fetch('/api/station', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: urlToSubmit,
                    name: newName,
                    isCustom: true
                })
            });
            fetchStationState();
            setInputUrl('');
            setInputName('');
            setIsPlaying(false);
        } catch (err) {
             setCurrentUrl(urlToSubmit);
             setStationName(newName);
             setIsCustom(true);
             setIframeKey(prev => prev + 1);
             setIsLoading(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <style>{`
                @keyframes equalizer { 
                    0% { height: 20%; opacity: 0.5; } 
                    50% { height: 100%; opacity: 1; } 
                    100% { height: 20%; opacity: 0.5; } 
                }
                .visualizer-bar { animation: equalizer 1s ease-in-out infinite; }
                
                @keyframes wave {
                    0%, 100% { transform: scaleY(0.5); }
                    50% { transform: scaleY(1.2); }
                }
                .wave-bar {
                    animation: wave 1.2s ease-in-out infinite;
                    border-radius: 9999px;
                }
            `}</style>
            
            {/* HEADER BUTTON - DYNAMIC THEME */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    flex items-center gap-3 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 group
                    ${isExpanded 
                        ? `${theme.bg} ${theme.border} ${theme.primary}` 
                        : 'bg-white/50 border-zinc-200 text-zinc-600 dark:bg-white/5 dark:border-white/10 dark:text-zinc-300 hover:bg-white hover:shadow-md dark:hover:bg-white/10'
                    }
                    ${fetchError ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={fetchError}
            >
                {/* Dynamic Visualizer Icon */}
                <div className="flex items-end gap-[2px] h-3.5 w-3.5 pb-0.5" aria-hidden="true">
                    <div className={`w-0.5 rounded-full visualizer-bar ${isExpanded ? 'bg-current' : `bg-${theme.color}-500`}`} style={{animationDelay: '0ms', animationDuration: '0.6s', animationPlayState: isPlaying ? 'running' : 'paused'}}></div>
                    <div className={`w-0.5 rounded-full visualizer-bar ${isExpanded ? 'bg-current' : `bg-${theme.color}-500`}`} style={{animationDelay: '150ms', animationDuration: '0.8s', animationPlayState: isPlaying ? 'running' : 'paused'}}></div>
                    <div className={`w-0.5 rounded-full visualizer-bar ${isExpanded ? 'bg-current' : `bg-${theme.color}-500`}`} style={{animationDelay: '300ms', animationDuration: '0.7s', animationPlayState: isPlaying ? 'running' : 'paused'}}></div>
                    <div className={`w-0.5 rounded-full visualizer-bar ${isExpanded ? 'bg-current' : `bg-${theme.color}-500`}`} style={{animationDelay: '100ms', animationDuration: '0.5s', animationPlayState: isPlaying ? 'running' : 'paused'}}></div>
                </div>

                <div className="flex flex-col items-start min-w-[80px]">
                    <span className="text-[10px] font-bold truncate max-w-[100px] leading-none mb-0.5 flex items-center gap-1">
                        {fetchError ? 'Radio Offline' : stationName}
                        {!isCustom && !fetchError && <span className={`w-1.5 h-1.5 rounded-full bg-${theme.color}-500 animate-pulse`}></span>}
                    </span>
                    <span className={`text-[8px] opacity-60 font-medium leading-none uppercase tracking-wide group-hover:text-${theme.color}-500 transition-colors`}>
                        {fetchError ? 'Connecting...' : (isExpanded ? (isPlaying ? 'Broadcasting' : 'Paused') : theme.label)}
                    </span>
                </div>
            </button>

            {/* EXPANDED WIDGET (POPOVER) */}
            <div 
                className={`
                    absolute top-full right-0 mt-3 w-80 sm:w-[360px] 
                    bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl 
                    border border-zinc-200 dark:border-white/10 overflow-hidden z-50 
                    ring-1 ring-black/5 transition-all duration-300 origin-top-right
                    ${isExpanded 
                        ? 'opacity-100 scale-100 visible pointer-events-auto translate-y-0' 
                        : 'opacity-0 scale-95 invisible pointer-events-none -translate-y-2'
                    }
                `}
            >
                {/* Header - DYNAMIC THEME */}
                <div className={`flex items-center justify-between px-4 py-3 border-b backdrop-blur-sm ${theme.bg} ${theme.border}`}>
                    <div className="flex items-center gap-2 max-w-[200px]">
                        <div className={`w-6 h-6 rounded-md bg-white/50 flex items-center justify-center ${theme.primary} shrink-0 shadow-sm`}>
                             {theme.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`text-[11px] font-extrabold tracking-tight uppercase truncate ${theme.primary}`}>
                                {stationName}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-1.5 w-1.5 shrink-0">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${theme.color}-400 opacity-75 ${fetchError ? 'hidden' : ''}`}></span>
                                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${fetchError ? 'bg-zinc-400' : `bg-${theme.color}-500`}`}></span>
                                </span>
                                <span className={`text-[8px] font-bold uppercase tracking-widest truncate ${theme.primary} opacity-80`}>
                                    {fetchError ? 'Offline' : 'Now Playing'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {!fetchError && (
                            <div className={`flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded-md border border-white/20 ${theme.primary}`} title="Active Listeners">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                <span className="text-[9px] font-bold tabular-nums">{listenerCount}</span>
                                {isCustom && (
                                    <div className="ml-1 px-1 rounded-sm bg-current opacity-20"></div>
                                )}
                                {isCustom && (
                                    <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">Synced</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* The Player IFrame - Dynamic Height */}
                <div 
                    className="w-full bg-zinc-50 dark:bg-black relative overflow-hidden group transition-all duration-300"
                    style={{ height: theme.height }}
                >
                     {isLoading && !fetchError && (
                         <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 z-20 flex flex-col items-center justify-center p-8 animate-pulse transition-opacity duration-300">
                             <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl mb-6 shadow-none"></div>
                             <div className="w-40 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-3"></div>
                             <div className="w-24 h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-8"></div>
                             <div className="flex gap-6 items-center opacity-50">
                                 <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                                 <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                                 <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                             </div>
                             <div className={`mt-8 text-[9px] font-medium text-${theme.color}-400 uppercase tracking-widest animate-none`}>Connecting Stream...</div>
                         </div>
                     )}

                     {fetchError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-zinc-50 dark:bg-black">
                             <div className="w-10 h-10 border-2 border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             </div>
                             <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Signal Lost</span>
                             <button onClick={() => fetchStationState()} className={`mt-2 text-[10px] text-${theme.color}-500 hover:underline`}>Retry Connection</button>
                         </div>
                     )}
                     
                     {!fetchError && (
                        <iframe 
                            key={iframeKey}
                            onLoad={handleIframeLoad}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            frameBorder="0" 
                            height={theme.height}
                            style={{
                                width: '100%', 
                                height: '100%', 
                                opacity: isLoading ? 0 : 1, 
                                transition: 'opacity 0.5s ease-in-out'
                            }} 
                            src={embedInfo.src}
                            title="Music Player"
                        >
                        </iframe>
                     )}
                </div>

                {/* Footer Controls */}
                <div className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-white/5 relative">
                    
                    <div className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-3">
                             <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                disabled={fetchError}
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center transition-all
                                    ${isPlaying 
                                        ? `${theme.bg} ${theme.primary}` 
                                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-400'
                                    }
                                    ${fetchError ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                title={isPlaying ? "Stop Visuals" : "Start Visuals"}
                             >
                                 {isPlaying ? (
                                     <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                                 ) : (
                                     <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                 )}
                             </button>

                            <div className="flex items-center gap-0.5 h-4">
                                {[...Array(10)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-0.5 wave-bar ${isPlaying ? `bg-${theme.color}-400` : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                        style={{
                                            height: '100%',
                                            animationDuration: `${0.6 + Math.random() * 0.5}s`,
                                            animationDelay: `-${Math.random()}s`,
                                            animationPlayState: isPlaying ? 'running' : 'paused',
                                            opacity: isPlaying ? 0.8 : 0.2
                                        }}
                                    ></div>
                                ))}
                            </div>
                            
                            <div className="flex flex-col">
                                <span className="text-[9px] text-zinc-900 dark:text-zinc-200 font-bold truncate max-w-[140px]">
                                    {fetchError ? 'Radio Offline' : stationName}
                                </span>
                                <span className="text-[8px] text-zinc-400 dark:text-zinc-500 leading-none">
                                    {fetchError ? 'Retry later' : (isCustom ? 'Shared Session' : 'Official Broadcast')}
                                </span>
                            </div>
                        </div>

                        {/* Admin Controls Toggle */}
                        {isAdmin && !fetchError && (
                            <button 
                                onClick={() => setShowInput(!showInput)}
                                className={`p-1.5 rounded-lg transition-colors ${showInput ? 'bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                                title="Admin: Change Station"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        )}
                    </div>

                    {/* Admin Input Area */}
                    {isAdmin && !fetchError && (
                        <div className={`
                            overflow-hidden transition-all duration-300 ease-in-out bg-zinc-50 dark:bg-zinc-900/50
                            ${showInput ? 'max-h-48 opacity-100 pb-3 px-3 pt-2' : 'max-h-0 opacity-0'}
                        `}>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <div className="flex gap-2 items-center">
                                    <span className={`text-[9px] font-bold ${theme.primary}`}>ADMIN:</span>
                                    {/* Platform Support Indicators */}
                                    <div className="flex gap-1.5 opacity-60">
                                        <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><title>Spotify Supported</title><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78-.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.2-1.32 9.6-0.66 13.38 1.68.42.18.6.84.36 1.141zm0.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24"><title>YouTube Supported</title><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                        <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><title>Apple Music Supported</title><path d="M22.502 12.002c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-9.002 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm-9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/></svg>
                                    </div>
                                </div>
                                {isCustom && (
                                    <button 
                                        onClick={handleResetToStation}
                                        className={`text-[9px] font-bold flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${theme.primary} ${theme.bg} ${theme.border} hover:brightness-95`}
                                        title="Revert to Official Station"
                                    >
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Sync to Default
                                    </button>
                                )}
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                                <input 
                                    type="text"
                                    value={inputName}
                                    onChange={(e) => setInputName(e.target.value)}
                                    placeholder="Playlist Title (e.g. 'Work Mode')..."
                                    className={`
                                        w-full bg-white dark:bg-zinc-900 
                                        border border-zinc-200 dark:border-white/10 
                                        rounded-xl px-3 py-2 
                                        text-[11px] text-zinc-900 dark:text-zinc-100 
                                        placeholder-zinc-400 focus:outline-none focus:ring-1 focus:border-${theme.color}-500
                                        focus:ring-${theme.color}-500 transition-all
                                    `}
                                />
                                <div className="relative w-full flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text"
                                            value={inputUrl}
                                            onChange={(e) => setInputUrl(e.target.value)}
                                            placeholder="Paste Link or Embed Code..."
                                            className={`
                                                w-full bg-white dark:bg-zinc-900 
                                                border border-zinc-200 dark:border-white/10 
                                                rounded-xl pl-3 pr-2 py-2 
                                                text-[11px] text-zinc-900 dark:text-zinc-100 
                                                placeholder-zinc-400 focus:outline-none focus:ring-1 focus:border-${theme.color}-500
                                                focus:ring-${theme.color}-500 transition-all
                                            `}
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={!inputUrl}
                                        className={`
                                            px-3 py-2 rounded-xl text-white font-bold text-[10px] uppercase tracking-wide
                                            transition-all active:scale-95 shadow-sm whitespace-nowrap
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            bg-${theme.color}-500 hover:bg-${theme.color}-600
                                        `}
                                    >
                                        Broadcast
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MusicWidget;
