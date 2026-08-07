import React, { useState } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-950/80 ${containerClassName || 'w-full h-full'}`}>
      {/* Skeleton Pulse Loader when loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 animate-pulse flex items-center justify-center z-0">
          <Sparkles className="w-4 h-4 text-amber-500/40 animate-spin" />
        </div>
      )}

      {/* Error Fallback when image fails to load */}
      {hasError ? (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-2 text-center text-slate-400 dark:text-slate-600">
          <ImageOff className="w-5 h-5 mb-1 opacity-60 text-slate-400" />
          <span className="text-[10px] font-medium">صورة غير متوفرة</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
          {...props}
        />
      )}
    </div>
  );
};
