import React from 'react';

interface OmsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const OmsLogo: React.FC<OmsLogoProps> = ({ className = '', size = 'md', showSubtitle = true }) => {
  const sizeMap = {
    sm: { container: 'h-12', logoOnly: 'h-10' },
    md: { container: 'h-20', logoOnly: 'h-14' },
    lg: { container: 'h-32', logoOnly: 'h-24' },
    xl: { container: 'h-52', logoOnly: 'h-36' },
  };

  const currentSize = showSubtitle ? sizeMap[size].container : sizeMap[size].logoOnly;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center shrink-0 select-none ${className}`}>
      {/* Soft Ambient Golden Glow */}
      <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full transform scale-125"></div>

      <svg
        viewBox={showSubtitle ? "0 0 320 370" : "0 0 320 250"}
        className={`${currentSize} w-auto drop-shadow-2xl relative z-10 transition-transform duration-300 hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Metallic Gold Gradient for Outer Ring */}
          <linearGradient id="goldRim3D" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7C2" />
            <stop offset="20%" stopColor="#F59E0B" />
            <stop offset="40%" stopColor="#B45309" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="80%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>

          {/* Bright Specular Gold for Feathers & Highlights */}
          <linearGradient id="goldBright" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FEF08A" />
            <stop offset="65%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Deep Emerald Green Radial Background */}
          <radialGradient id="deepGreenRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B3C2A" />
            <stop offset="65%" stopColor="#042217" />
            <stop offset="90%" stopColor="#02150D" />
            <stop offset="100%" stopColor="#052E1F" />
          </radialGradient>

          {/* Rich Gold Gradient for Text */}
          <linearGradient id="goldText3D" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="30%" stopColor="#FCD34D" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Shadow Filter for 3D Depth */}
          <filter id="shadow3D" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.85" />
          </filter>

          <filter id="goldGlowSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* ----------------- 1. CIRCULAR MEDALLION EMBLEM ----------------- */}
        <g filter="url(#shadow3D)">
          {/* Outer Beveled Metallic Gold Ring */}
          <circle cx="160" cy="122" r="108" fill="url(#goldRim3D)" stroke="#582900" strokeWidth="2" />

          {/* Inner Dark Bezel Ring */}
          <circle cx="160" cy="122" r="98" fill="#1C1408" opacity="0.6" />
          <circle cx="160" cy="122" r="96" fill="url(#goldRim3D)" opacity="0.9" />

          {/* Inner Deep Emerald Green Canvas */}
          <circle cx="160" cy="122" r="92" fill="url(#deepGreenRadial)" stroke="url(#goldRim3D)" strokeWidth="2" />

          {/* Fine Decorative Dashed Ring */}
          <circle cx="160" cy="122" r="85" fill="none" stroke="url(#goldBright)" strokeWidth="1" strokeDasharray="5 3" opacity="0.6" />
        </g>

        {/* ----------------- 2. THREE GOLD STARS AT TOP ----------------- */}
        <g fill="url(#goldBright)" filter="url(#shadow3D)">
          {/* Top Center Star */}
          <polygon points="160,42 163.5,51 173,51 165.5,56.5 168.5,66 160,60 151.5,66 154.5,56.5 147,51 156.5,51" />
          {/* Left Star */}
          <polygon points="128,48 131,56 139,56 133,61 135,69 128,64 121,69 123,61 117,56 125,56" transform="rotate(-12 128 58)" />
          {/* Right Star */}
          <polygon points="192,48 195,56 203,56 197,61 199,69 192,64 185,69 187,61 181,56 189,56" transform="rotate(12 192 58)" />
        </g>

        {/* ----------------- 3. DETAILED 3D GOLDEN EAGLE CREST ----------------- */}
        <g fill="url(#goldRim3D)" stroke="#3E1A00" strokeWidth="0.6" filter="url(#shadow3D)">
          {/* Outer Wings Backdrop Layer (Left & Right) */}
          <path d="M 160 88 Q 120 62 70 78 Q 90 102 112 124 Q 135 106 160 114 Z" fill="url(#goldBright)" />
          <path d="M 160 88 Q 200 62 250 78 Q 230 102 208 124 Q 185 106 160 114 Z" fill="url(#goldBright)" />

          {/* Primary Feathers Left Wing */}
          <path d="M 75 79 Q 95 96 115 130 Q 98 116 82 98 Z" fill="url(#goldRim3D)" />
          <path d="M 88 88 Q 105 104 122 136 Q 108 122 94 106 Z" fill="url(#goldBright)" />

          {/* Primary Feathers Right Wing */}
          <path d="M 245 79 Q 225 96 205 130 Q 222 116 238 98 Z" fill="url(#goldRim3D)" />
          <path d="M 232 88 Q 215 104 198 136 Q 212 122 226 106 Z" fill="url(#goldBright)" />

          {/* Eagle Tail Feathers */}
          <path d="M 144 146 L 160 174 L 176 146 L 168 132 L 152 132 Z" fill="url(#goldBright)" />
          <path d="M 152 148 L 160 178 L 168 148 Z" fill="url(#goldRim3D)" />

          {/* Extended Eagle Talons */}
          <path d="M 124 142 L 118 156 M 126 144 L 126 158 M 130 142 L 134 156" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 196 142 L 202 156 M 194 144 L 194 158 M 190 142 L 186 156" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />

          {/* Eagle Central Body & Chest Feathers */}
          <path d="M 142 104 Q 160 96 178 104 Q 172 138 160 146 Q 148 138 142 104 Z" fill="url(#goldBright)" stroke="#582900" strokeWidth="1" />

          {/* Eagle Head facing Right */}
          <path d="M 150 76 Q 160 66 168 74 Q 176 78 166 86 Q 158 90 150 76 Z" fill="url(#goldBright)" stroke="#3E1A00" strokeWidth="1" />
          {/* Eagle Beak Curved Right */}
          <path d="M 168 74 Q 177 76 170 82 Z" fill="#78350F" stroke="#FEF08A" strokeWidth="0.8" />
          {/* Eagle Eye */}
          <circle cx="160" cy="74" r="1.8" fill="#02150D" />
        </g>

        {/* ----------------- 4. STACKED TYPOGRAPHY BELOW MEDALLION ----------------- */}
        {showSubtitle && (
          <g filter="url(#shadow3D)">
            {/* ROW 1: — OMS — */}
            <line x1="45" y1="242" x2="105" y2="242" stroke="url(#goldRim3D)" strokeWidth="2" strokeLinecap="round" />
            <text
              x="160"
              y="256"
              textAnchor="middle"
              fill="url(#goldText3D)"
              stroke="#451A00"
              strokeWidth="1.2"
              fontSize="44"
              fontWeight="900"
              fontFamily="Georgia, 'Times New Roman', serif"
              letterSpacing="4"
            >
              OMS
            </text>
            <line x1="215" y1="242" x2="275" y2="242" stroke="url(#goldRim3D)" strokeWidth="2" strokeLinecap="round" />

            {/* ROW 2: الأسواق السورية */}
            <text
              x="160"
              y="312"
              textAnchor="middle"
              fill="url(#goldText3D)"
              stroke="#451A00"
              strokeWidth="1.5"
              fontSize="36"
              fontWeight="bold"
              fontFamily="'Cairo', 'Traditional Arabic', 'Amiri', Tahoma, sans-serif"
            >
              الأسواق السورية
            </text>

            {/* ROW 3: — ONLINE MARKETS SYRIA — */}
            <line x1="30" y1="344" x2="65" y2="344" stroke="url(#goldRim3D)" strokeWidth="1" />
            <text
              x="160"
              y="348"
              textAnchor="middle"
              fill="url(#goldBright)"
              fontSize="12"
              fontWeight="700"
              fontFamily="'Arial Black', sans-serif"
              letterSpacing="3"
            >
              ONLINE MARKETS SYRIA
            </text>
            <line x1="255" y1="344" x2="290" y2="344" stroke="url(#goldRim3D)" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  );
};


