import React from 'react';

interface OmsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const OmsLogo: React.FC<OmsLogoProps> = ({ className = '', size = 'md', showSubtitle = true }) => {
  const sizeMap = {
    sm: { container: 'w-10 h-10', image: 'w-10 h-10' },
    md: { container: 'w-16 h-16', image: 'w-16 h-16' },
    lg: { container: 'w-24 h-24', image: 'w-24 h-24' },
    xl: { container: 'w-36 h-36', image: 'w-36 h-36' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative inline-flex flex-col items-center justify-center shrink-0 select-none ${className}`}>
      {/* Soft Ambient Golden Glow */}
      <div className="absolute inset-0 bg-amber-500/25 blur-xl rounded-2xl transform scale-110 pointer-events-none"></div>

      <div className={`relative z-10 ${currentSize.image} drop-shadow-2xl transition-transform duration-300 hover:scale-105`}>
        <img
          src="/icon-512.png"
          alt="OMS الأسواق السورية"
          className="w-full h-full object-contain rounded-2xl shadow-xl ring-1 ring-amber-400/40"
          loading="eager"
        />
      </div>

      {showSubtitle && size === 'xl' && (
        <div className="mt-3 text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow">
            OMS الأسواق السورية
          </h2>
          <p className="text-xs text-amber-200/70 font-medium">المنصة الشاملة للأسعار والخدمات</p>
        </div>
      )}
    </div>
  );
};
