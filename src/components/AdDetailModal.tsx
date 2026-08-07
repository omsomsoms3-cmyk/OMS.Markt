import React, { useState } from 'react';
import { X, Phone, MessageSquare, Share2, QrCode, Bookmark, BookmarkCheck, Tag, Star, ArrowUpDown, CreditCard, MapPin, Calendar, Building2, ShieldAlert, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, Eye, Clock, User, Sparkles, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';
import { LazyImage } from './LazyImage';

interface AdDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  itemType: 'car' | 'realestate' | 'job' | 'taxi';
  onOpenOffer?: (item: any) => void;
  onOpenPayment?: (item: any) => void;
  onOpenRate?: (item: any) => void;
  onToggleCompare?: (item: any) => void;
  onOpenShare?: (item: any) => void;
  onOpenReport?: (item: any) => void;
  isCompared?: boolean;
}

export const AdDetailModal: React.FC<AdDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  itemType,
  onOpenOffer,
  onOpenPayment,
  onOpenRate,
  onToggleCompare,
  onOpenShare,
  onOpenReport,
  isCompared = false,
}) => {
  const { language } = useLanguage();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  if (!isOpen || !item) return null;

  const bookmarked = isBookmarked(item.id);

  const images: string[] = item.images && item.images.length > 0 
    ? item.images 
    : (item.image ? [item.image] : []);

  const handleToggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(item.id);
    } else {
      addBookmark({
        id: item.id,
        itemType: itemType,
        title: item.title || `${item.fromCity} ➔ ${item.toArea}`,
        subtitle: item.description || item.company || item.area || '',
        city: item.city || item.fromCity || 'سوريا',
        priceSYP: item.priceSYP || item.salarySYP || item.estimatedCostSYP,
        priceUSD: item.priceUSD || item.salaryUSD,
        image: images[0] || '',
        phone: item.phone || '',
        savedAt: new Date().toISOString(),
        originalData: item,
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 dark:border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[94vh] text-slate-900 dark:text-slate-100 my-auto text-right dir-rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Centered Header with Gold Border Divider */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-amber-500/30 bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 rounded-xl text-xs font-black">
              {itemType === 'car' ? '🚗 سوق السلع والسيارات' : itemType === 'realestate' ? '🏠 العقارات والأراضي' : itemType === 'job' ? '💼 فرصة عمل' : '🚖 طلب تكسي'}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {language === 'ar' ? 'التفاصيل الكاملة للإعلان' : 'Full Listing Details'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-full transition-colors cursor-pointer active:scale-95 border border-transparent hover:border-amber-500/30"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body - Compact Spacing & Zero Wasted Whitespace */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1">
          {/* Main Image & Media Gallery - Maximized Large Display */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="relative h-80 sm:h-[480px] md:h-[540px] lg:h-[580px] w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-amber-500/30 group shadow-xl flex items-center justify-center">
                <LazyImage
                  src={images[currentImageIdx]}
                  alt={item.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-slate-950/85 text-amber-400 border border-amber-500/40 hover:bg-slate-900 rounded-full transition-all cursor-pointer shadow-lg active:scale-90"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-slate-950/85 text-amber-400 border border-amber-500/40 hover:bg-slate-900 rounded-full transition-all cursor-pointer shadow-lg active:scale-90"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 text-amber-300 text-xs px-4 py-1 rounded-full font-mono border border-amber-500/40 shadow-lg">
                      {currentImageIdx + 1} / {images.length} صور
                    </div>
                  </>
                )}

                {/* Heart Bookmark Button Overlay */}
                <button
                  onClick={handleToggleBookmark}
                  className={`absolute top-3 left-3 p-2.5 rounded-2xl border backdrop-blur-md transition-all active:scale-90 shadow-xl cursor-pointer ${
                    bookmarked
                      ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
                      : 'bg-slate-950/85 text-amber-400 border-amber-500/40 hover:border-amber-400'
                  }`}
                  title={bookmarked ? 'محفوظ في المفضلة' : 'حفظ الإعلان'}
                >
                  {bookmarked ? <BookmarkCheck className="w-5 h-5 fill-slate-950 text-slate-950" /> : <Bookmark className="w-5 h-5" />}
                </button>

                {/* Condition Micro Badge Overlay (Very Small & Non-Intrusive) */}
                {item.condition && (
                  <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 text-amber-300 shadow-md flex items-center gap-1">
                    <span>{item.condition === 'new' ? 'جديد ✨' : 'مستعمل ♻️'}</span>
                  </div>
                )}

                {/* City & Location Tag Overlay */}
                <div className="absolute bottom-3 right-3 bg-slate-950/90 text-white text-xs px-3 py-1 rounded-xl border border-amber-500/40 backdrop-blur font-medium flex items-center gap-1.5 shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item.city || item.fromCity} {item.area ? `(${item.area})` : ''}</span>
                </div>
              </div>

              {/* Thumbnail Strip with Gold Accent Border */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 justify-center">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIdx(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        currentImageIdx === idx
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                          : 'border-slate-300 dark:border-amber-500/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <LazyImage src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title & Compact Price Section */}
          <div className="text-center space-y-2 pt-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug flex items-center justify-center gap-2 flex-wrap">
              <span>{item.title || `${item.fromCity} ➔ ${item.toArea}`}</span>
              {item.condition && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {item.condition === 'new' ? 'جديد ✨' : 'مستعمل ♻️'}
                </span>
              )}
            </h2>

            {/* Price Box - Compact with Gold Accent Border */}
            {(item.priceSYP || item.priceUSD || item.salarySYP || item.estimatedCostSYP) && (
              <div className="p-2.5 bg-emerald-950/20 dark:bg-slate-950 rounded-xl border border-amber-500/30 flex items-center justify-between gap-2 shadow-xs max-w-md mx-auto">
                <div className="text-right">
                  {(item.priceUSD || item.salaryUSD) && (
                    <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono block">
                      ${(item.priceUSD || item.salaryUSD).toLocaleString()}
                    </span>
                  )}
                  {item.type === 'rent' && <span className="text-[10px] text-amber-400 font-bold block">إيجار/حجز</span>}
                </div>

                <div className="text-left">
                  <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-mono font-bold block">
                    {(item.priceSYP || item.salarySYP || item.estimatedCostSYP).toLocaleString()} ل.س
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block">السعر بالليرة السورية</span>
                </div>
              </div>
            )}
          </div>

          {/* Gold Divider Line */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent my-1" />

          {/* Specs Grid with Gold Borders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {item.year && (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-amber-500/25 text-center">
                <span className="text-[10px] text-slate-500 dark:text-amber-400/80 font-bold block">سنة الصنع:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.year}</span>
              </div>
            )}
            {item.mileage && (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-amber-500/25 text-center">
                <span className="text-[10px] text-slate-500 dark:text-amber-400/80 font-bold block">المسافة:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.mileage.toLocaleString()} كم</span>
              </div>
            )}
            {item.spaceSqM && (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-amber-500/25 text-center">
                <span className="text-[10px] text-slate-500 dark:text-amber-400/80 font-bold block">المساحة:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.spaceSqM} م²</span>
              </div>
            )}
            {item.rooms && (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-amber-500/25 text-center">
                <span className="text-[10px] text-slate-500 dark:text-amber-400/80 font-bold block">الغرف:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.rooms} غرف</span>
              </div>
            )}
            {item.sellerName && (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-amber-500/25 text-center">
                <span className="text-[10px] text-slate-500 dark:text-amber-400/80 font-bold block">المعلن:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate block">{item.sellerName}</span>
              </div>
            )}
          </div>

          {/* Description Box with Gold Accent Border */}
          {item.description && (
            <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-amber-500/30 text-right">
              <h4 className="text-xs font-black text-amber-500 dark:text-amber-400">تفاصيل وتوصيف المنشور الكامل:</h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}

          {/* Collapsible Bar for Payment, Offer & Additional Tools with Gold Divider */}
          <div className="pt-2 border-t border-amber-500/30">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-amber-500/30 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>
                  {language === 'ar'
                    ? 'مشاهدة المزيد من الخيارات (خيارات الدفع والتفاعل الإضافية ⚡)'
                    : 'Show More Options (Payment & Tools ⚡)'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-amber-400 transition-transform duration-300 ${
                  showMoreOptions ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showMoreOptions && (
              <div className="mt-3 space-y-3 animate-fadeIn">
                {/* Payment & Reserve Highlight Action Box ("مسار الدفع والحجز المباشر") */}
                <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-indigo-500/15 rounded-2xl border border-amber-500/40 text-center space-y-2.5">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>مسار الدفع والتواصل المباشر مع صاحب الإعلان 💳</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      يمكنك الحجز الإلكتروني عبر طرق الدفع المحلية المعتمدة أو الاتصال المباشر
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    {onOpenPayment && (
                      <button
                        onClick={() => onOpenPayment(item)}
                        className="w-full sm:w-auto flex-1 min-h-[44px] py-2.5 px-5 bg-gradient-to-r from-amber-400 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer border border-amber-300"
                      >
                        <CreditCard className="w-4 h-4 text-slate-950" />
                        <span>حجز وإتمام طريقة الدفع 🛒</span>
                      </button>
                    )}

                    {onOpenOffer && (
                      <button
                        onClick={() => onOpenOffer(item)}
                        className="w-full sm:w-auto flex-1 min-h-[44px] py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-amber-300 border border-amber-500/50 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <Tag className="w-4 h-4 text-amber-400" />
                        <span>تقديم عرض سعر 🏷️</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Secondary Action Tools Grid with Gold Dividers */}
                <div className="space-y-2 pt-2 border-t border-amber-500/30">
                  <h4 className="text-xs font-bold text-amber-400 text-center">أدوات إضافية للإعلان:</h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {onOpenRate && (
                      <button
                        onClick={() => onOpenRate(item)}
                        className="min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 bg-yellow-500/15 hover:bg-yellow-500 hover:text-slate-950 text-yellow-600 dark:text-yellow-400 border border-amber-500/40 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>تقييم ★</span>
                      </button>
                    )}

                    {onToggleCompare && (
                      <button
                        onClick={() => onToggleCompare(item)}
                        className={`min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition-all border cursor-pointer ${
                          isCompared
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-indigo-500/15 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 border border-amber-500/40'
                        }`}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        <span>{isCompared ? 'مقارن ✓' : 'مقارنة ⚖️'}</span>
                      </button>
                    )}

                    {onOpenShare && (
                      <button
                        onClick={() => onOpenShare(item)}
                        className="min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-500/15 hover:bg-cyan-500 hover:text-slate-950 text-cyan-600 dark:text-cyan-400 border border-amber-500/40 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>QR ومشاركة 🏁</span>
                      </button>
                    )}

                    {onOpenReport && (
                      <button
                        onClick={() => onOpenReport(item)}
                        className="min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/15 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 border border-amber-500/40 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>إبلاغ 🚩</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Direct Call & WhatsApp Buttons with Gold Border Divider */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-amber-500/30 flex items-center justify-center gap-2.5 shrink-0">
          {item.phone && (
            <a
              href={`tel:${item.phone}`}
              className="flex-1 min-h-[44px] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 border border-emerald-400/50 transition-all active:scale-95 text-xs sm:text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>اتصال مباشر: {item.phone}</span>
            </a>
          )}

          {item.phone && (
            <a
              href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-600 dark:text-emerald-400 border border-amber-500/40 font-black rounded-2xl flex items-center justify-center gap-2 transition-all text-xs sm:text-sm shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
              <span>واتساب</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

