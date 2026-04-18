import React, { useState } from 'react';
import { User } from 'lucide-react';

interface ItemImageProps {
  src: string;
  alt: string;
  className?: string;
  rarity?: string;
}

export const ItemImage: React.FC<ItemImageProps> = ({ src, alt, className, rarity }) => {
  const [error, setError] = useState(false);

  // Generate a consistent color based on the name for the placeholder
  const getHashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  if (error) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-slate-800/50 border border-white/10 relative overflow-hidden group`}>
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ backgroundColor: getHashColor(alt) }}
        />
        <User size={32} className="text-white/20 relative z-10" />
        <span className="text-[8px] font-black text-white/30 uppercase mt-2 relative z-10 px-2 text-center leading-tight">
          Image Missing<br/>Upload to /public
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
};
