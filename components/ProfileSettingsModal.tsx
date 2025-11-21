
import React, { useState, useRef } from 'react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
];

const ProfileSettingsModal = ({ isOpen, onClose, userProfile, onSave }) => {
  const [name, setName] = useState(userProfile?.name || '');
  const [avatar, setAvatar] = useState(userProfile?.avatar || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

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
              img.src = e.target.result as string;
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
          setAvatar(resizedImage);
      } catch (error) {
          console.error("Error processing image", error);
      } finally {
          setIsProcessing(false);
      }
    }
  };

  const handleSave = () => {
    onSave({ name, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden ring-1 ring-black/5">
        <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-white/5">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Customize Profile</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avatar</label>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <img src={avatar || "https://ui-avatars.com/api/?name=User"} alt="Preview" className="w-20 h-20 rounded-xl object-cover ring-4 ring-zinc-50 dark:ring-zinc-800 shadow-lg" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                    <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                 <button 
                    onClick={() => fileInputRef.current.click()}
                    disabled={isProcessing}
                    className="text-sm bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-4 py-2 rounded-lg transition-all font-medium border border-zinc-200 dark:border-zinc-700 shadow-sm w-full flex items-center justify-center gap-2"
                 >
                    {isProcessing ? (
                         <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-600 rounded-full animate-spin"></span>
                    ) : (
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    )}
                    {isProcessing ? 'Processing...' : 'Upload Image'}
                 </button>
                 <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                 />
                 <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">Auto-resized to 256x256</p>
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2 mt-4">
               {PRESET_AVATARS.map((src, i) => (
                   <button 
                    key={i} 
                    onClick={() => setAvatar(src)}
                    className={`relative rounded-lg overflow-hidden aspect-square transition-all ${avatar === src ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900' : 'hover:opacity-80 opacity-70 grayscale hover:grayscale-0'}`}
                   >
                       <img src={src} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                   </button>
               ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Display Name</label>
            <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-all"
                />
                <svg className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-white/5 flex justify-end gap-3 bg-zinc-50/30 dark:bg-white/[0.02]">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={isProcessing} className="px-6 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50">Save Profile</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
    