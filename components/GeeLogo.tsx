import React, { useState } from 'react';

const GeeLogo = ({ className = "w-6 h-6", customSrc = undefined }) => {
  const [imageError, setImageError] = useState(false);

  if (!imageError) {
    return (
      <img 
        src={customSrc || "/logo.png"} 
        alt="Gee Support Logo" 
        className={`${className} object-contain`}
        onError={() => setImageError(true)} 
      />
    );
  }

  // Fallback: Minimalist placeholder if image fails. 
  // The previous "G-Check" vector logo has been removed as requested.
  return (
    <div className={`${className} flex items-center justify-center font-bold`} aria-label="Gee Support">
       <span className="opacity-50">G</span>
    </div>
  );
};

export default GeeLogo;