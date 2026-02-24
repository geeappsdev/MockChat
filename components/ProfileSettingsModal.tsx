import React, { useState, useRef } from 'react';
import GeeLogo from './GeeLogo';

const PRESET_AVATARS = [
  // Cute Animals
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Cat
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Dog
  'https://images.unsplash.com/photo-1585110396067-bfaf58e95fab?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Red Panda
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Fox

  // 3D & Characters
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // 3D Human 1
  'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // 3D Human 2
  
  // Abstract & Art
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Abstract Liquid
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Abstract Pink

  // Nature & Vibes
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Beach
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Mountains
  'https://images.unsplash.com/photo-1513553404607-988bf2703777?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Space
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80', // Retro
];

const THEMES = [
    { id: 'default', name: 'Gee Indigo', color: '#6366f1' }, // Indigo-500
    { id: 'theme-sakura', name: 'Sakura', color: '#ec4899' }, // Pink-500
    { id: 'theme-ocean', name: 'Ocean', color: '#0ea5e9' }, // Sky-500
    { id: 'theme-mint', name: 'Mint', color: '#14b8a6' }, // Teal-500
    { id: 'theme-bumblebee', name: 'Bumblebee', color: '#f59e0b' }, // Amber-500
    { id: 'theme-lavender', name: 'Lavender', color: '#8b5cf6' }, // Violet-500
    { id: 'theme-matcha', name: 'Matcha', color: '#84cc16' }, // Lime-500
    { id: 'theme-peach', name: 'Peach', color: '#f97316' }, // Orange-500
];

const MODES = [
  { id: 'light', name: 'Light', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { id: 'dark', name: 'Dark', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> },
  { id: 'system', name: 'System', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
];

const ProfileSettingsModal = ({ isOpen, onClose, userProfile, onSave, onDisconnect, isAdmin, brandLogo, onSaveBrandLogo }) => {
  const [name, setName] = useState(userProfile?.name || '');
  const [avatar, setAvatar] = useState(userProfile?.avatar || '');
  const [theme, setTheme] = useState(userProfile?.theme || 'default');
  const [mode, setMode] = useState(userProfile?.mode || 'system');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  if (!isOpen) return null;

  const resizeImage = (file) => {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_SIZE = 256; // Resize to max 256x256
                  let width = img.width;
                  let height = img.height;

                  if (width > height) {
                      if (width > MAX_SIZE) {
                          height *= MAX_SIZE / width;
                          width = MAX_SIZE;
                      }
                  } else {
                      if (height > MAX_SIZE) {
                          width *= MAX_SIZE / height;
                          height = MAX_SIZE;
                      }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  // Compress to JPEG with 0.8 quality
                  resolve(canvas.toDataURL('image/jpeg', 0.8));
              };
              // FIX: Explicitly cast event target to FileReader
              img.src = (e.target as FileReader).result as string;
          };
          reader.readAsDataURL(file);
      });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      try {
          const resizedImage = await resizeImage(file);
          setAvatar(resizedImage as string);
      } catch (error) {
          console.error("Error processing image", error);
      } finally {
          setIsProcessing(false);
      }
    }
  };

  const handleLogoChange = async (e) => {
      const file = e.target.files[0];
      if (file && onSaveBrandLogo) {
          setIsProcessing(true);
          try {
              // Use same resize logic but allow slightly larger
              const reader = new FileReader();
              reader.onload = (ev) => {
                 // FIX: Explicitly cast event target to FileReader
                 onSaveBrandLogo((ev.target as FileReader).result);
              };
              reader.readAsDataURL(file);
          } catch (error) {
              console.error("Error processing logo", error);
          } finally {
              setIsProcessing(false);
          }
      }
  };

  const handleSave = () => {
    onSave({ name, avatar, theme, mode });
    onClose();
  };

  // Fallback cat image for preview
  const previewAvatar = avatar || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden ring-1 ring-black/5 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
          <h3 id="profile-modal-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Customize Profile</h3>
          <button onClick={onClose} aria-label="Close modal" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avatar</label>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <img src={previewAvatar} alt="Preview" className="w-20 h-20 rounded-xl object-cover ring-4 ring-zinc-50 dark:ring-zinc-800 shadow-lg" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Upload Custom Image'}
              </button>
            </div>

            <div className="grid grid-cols-6 gap-3">
              {PRESET_AVATARS.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setAvatar(url)}
                  aria-label={`Select preset avatar ${index + 1}`}
                  className={`relative rounded-lg overflow-hidden aspect-square group transition-all ${avatar === url ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900' : 'hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-600'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {avatar === url && (
                    <div className="absolute inset-0 bg-indigo-100/60 flex items-center justify-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-sm"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="display-name" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Display Name</label>
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gee Support"
              maxLength={50}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          
          {/* Appearance & Theme Section */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Appearance</label>
              <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-black/40 p-1 rounded-xl border border-zinc-200 dark:border-white/5">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      mode === m.id 
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {m.icon}
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">App Theme</label>
              <div className="grid grid-cols-5 gap-2">
                  {THEMES.map((t) => (
                      <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          aria-label={`Select theme: ${t.name}`}
                          aria-pressed={theme === t.id}
                          className={`group relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all ${theme === t.id ? 'bg-zinc-50 dark:bg-white/10 border-zinc-200 dark:border-zinc-700' : 'border-transparent hover:bg-zinc-50 dark:hover:bg-white/5'}`}
                      >
                          <div 
                              className={`w-8 h-8 rounded-full shadow-sm border border-black/5 transition-transform group-hover:scale-110 ${theme === t.id ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white dark:ring-offset-black' : ''}`}
                              style={{ backgroundColor: t.color }}
                          ></div>
                          <span className={`text-[9px] font-medium truncate w-full text-center ${theme === t.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>{t.name}</span>
                      </button>
                  ))}
              </div>
            </div>
          </div>
          
          {/* Workspace Branding (Admin Only) */}
          {isAdmin && onSaveBrandLogo && (
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-white/5">
                  <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider">Workspace Branding</label>
                      <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-200 font-bold">ADMIN</span>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                      <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
                           <GeeLogo className="w-6 h-6" customSrc={brandLogo} />
                      </div>
                      <div className="flex-1">
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-1">Upload a custom logo for the sidebar.</p>
                          <div className="flex gap-2">
                              <button 
                                  onClick={() => logoInputRef.current?.click()}
                                  className="text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                  Upload PNG
                              </button>
                              {brandLogo && (
                                  <button 
                                      onClick={() => onSaveBrandLogo(undefined)}
                                      className="text-[10px] font-bold text-red-500 hover:underline"
                                  >
                                      Reset to Default
                                  </button>
                              )}
                          </div>
                          <input 
                            type="file" 
                            ref={logoInputRef} 
                            onChange={handleLogoChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                      </div>
                  </div>
              </div>
          )}
          
          {/* Danger Zone - Disconnect */}
          <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-white/5">
            <button
                onClick={onDisconnect}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect API Key
            </button>
          </div>

        </div>
        
        <div className="p-6 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;