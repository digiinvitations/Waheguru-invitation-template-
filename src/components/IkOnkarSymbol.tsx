import React, { useState } from 'react';

interface IkOnkarSymbolProps {
  customLogoUrl?: string;
  className?: string;
  alt?: string;
}

export function IkOnkarSymbol({ customLogoUrl, className = "h-16 w-auto", alt = "Ik Onkar" }: IkOnkarSymbolProps) {
  const [imageFailed, setImageFailed] = useState(false);

  // If user uploaded a custom logo and it's not our default svg paths
  const isCustomImage = 
    Boolean(customLogoUrl) && 
    !customLogoUrl?.includes("ikonkar-gold.svg") &&
    !customLogoUrl?.includes("khanda-gold.svg") &&
    !imageFailed;

  if (isCustomImage && customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt={alt}
        className={`${className} object-contain select-none`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  // Pure Vector SVG - Works 100% reliably in development, production, and Vercel hosting without 404s
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200" 
      className={`${className} select-none drop-shadow-md`}
      aria-label="Sacred Ik Onkar"
      role="img"
    >
      <defs>
        <linearGradient id="goldGradSymbol" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE8A3" />
          <stop offset="30%" stopColor="#E5B94C" />
          <stop offset="60%" stopColor="#CA9727" />
          <stop offset="85%" stopColor="#FCE196" />
          <stop offset="100%" stopColor="#9C6F12" />
        </linearGradient>
        <filter id="goldGlowSymbol" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#E5B94C" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#goldGlowSymbol)">
        <text 
          x="100" 
          y="142" 
          textAnchor="middle" 
          fill="url(#goldGradSymbol)" 
          stroke="#7A530B" 
          strokeWidth="1.5" 
          fontFamily="'Noto Sans Gurmukhi', 'Gurmukhi MN', 'Mukta Mahee', 'Arial Unicode MS', serif" 
          fontSize="130" 
          fontWeight="bold"
          letterSpacing="1"
        >
          ੴ
        </text>
      </g>
    </svg>
  );
}
