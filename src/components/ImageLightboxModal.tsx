import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Minimize2, MapPin, Phone, Share2, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { shareListingItem } from '../lib/share';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  priceUSD?: number;
  priceSYP?: number;
  city?: string;
  phone?: string;
  images?: string[];
  onReserve?: () => void;
  onShare?: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  priceUSD,
  priceSYP,
  city,
  phone,
  images = [],
  onReserve,
  onShare,
}) => {
  const { language } = useLanguage();
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Combine image list if multiple provided
  const imageList = images && images.length > 0 ? images : [imageUrl];

  useEffect(() => {
    if (isOpen) {
      setZoomScale(1);
      setRotation(0);
      const index = imageList.indexOf(imageUrl);
      setCurrentImageIndex(index >= 0 ? index : 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, imageUrl]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex, imageList]);

  if (!isOpen) return null;

  const currentSrc = imageList[currentImageIndex] || imageUrl;

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.35, 0.6));
  const handleResetZoom = () => {
    setZoomScale(1);
    setRotation(0);
  };

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrevImage = () => {
    setZoomScale(1);
    setRotation(0);
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const handleNextImage = () => {
    setZoomScale(1);
    setRotation(0);
    setCurrentImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentSrc;
    link.download = `OMS-Car-${title.replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl animate-fadeIn text-white select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 z-10 shadow-lg">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-600/80 hover:text-white text-slate-300 transition-all active:scale-90 cursor-pointer shrink-0"
            title={language === 'ar' ? 'إغلاق المعاينة' : 'Close Preview'}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h2 className="font-bold text-sm sm:text-base text-slate-100 truncate">{title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              {priceUSD && <span className="text-emerald-400 font-bold">${priceUSD.toLocaleString()}</span>}
              {priceSYP && <span>({priceSYP.toLocaleString()} ل.س)</span>}
              {city && (
                <span className="flex items-center gap-0.5 text-slate-300">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 transition-all active:scale-95 cursor-pointer"
            title={language === 'ar' ? 'تكبير (+)' : 'Zoom In (+)'}
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 transition-all active:scale-95 cursor-pointer"
            title={language === 'ar' ? 'تصغير (-)' : 'Zoom Out (-)'}
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs font-mono font-bold cursor-pointer hidden sm:flex items-center gap-1"
            title={language === 'ar' ? 'إعادة الحجم الطبيعي' : 'Reset Scale'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{Math.round(zoomScale * 100)}%</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 transition-all active:scale-95 cursor-pointer"
            title={language === 'ar' ? 'تحميل صورة السيارة' : 'Download Image'}
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 transition-all active:scale-95 cursor-pointer hidden sm:block"
            title={language === 'ar' ? 'ملء الشاشة' : 'Toggle Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden min-h-0 bg-slate-950/80">
        {/* Navigation Arrows for Multiple Images */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 z-20 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur shadow-2xl transition-all active:scale-90 cursor-pointer"
              title={language === 'ar' ? 'الصورة السابقة' : 'Previous Image'}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 z-20 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur shadow-2xl transition-all active:scale-90 cursor-pointer"
              title={language === 'ar' ? 'الصورة التالية' : 'Next Image'}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Zoomed Interactive Container */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
          style={{
            transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={currentSrc}
            alt={title}
            className="max-w-[90vw] max-h-[75vh] sm:max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-slate-800/80 select-none"
            referrerPolicy="no-referrer"
            draggable={false}
          />
        </div>

        {/* Image Counter Badge */}
        {imageList.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono font-bold text-amber-400 backdrop-blur shadow-xl">
            {currentImageIndex + 1} / {imageList.length}
          </div>
        )}
      </div>

      {/* Bottom Action Footer Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3 shadow-2xl z-10">
        <div className="flex items-center gap-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>{language === 'ar' ? 'اتصال بالبائع' : 'Call Seller'}</span>
            </a>
          )}

          {onReserve && (
            <button
              onClick={onReserve}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>{language === 'ar' ? 'حجز المركبة' : 'Reserve Vehicle'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onShare) {
                onShare();
              } else {
                const shareText = `إعلان مميز على منصة OMS: ${title}\nالسعر: ${priceUSD ? `$${priceUSD.toLocaleString()}` : ''} ${priceSYP ? `(${priceSYP.toLocaleString()} ل.س)` : ''}`;
                shareListingItem({ title, text: shareText, url: window.location.href });
              }
            }}
            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/40 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title={language === 'ar' ? 'مشاركة الإعلان كلياً (واتساب، تليجرام، رابط)' : 'Share Listing'}
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>{language === 'ar' ? 'مشاركة الإعلان' : 'Share'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
