import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Building, 
  Home, 
  Briefcase, 
  Wrench, 
  Bookmark, 
  Car as CarIcon, 
  Truck, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  Laptop, 
  Sparkles,
  ShoppingBag,
  Handshake,
  Radio,
  Newspaper,
  Smartphone
} from 'lucide-react';
import { TabType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';
import { initialCarListings, initialRealEstateListings, initialJobListings, initialTaxiOrders } from '../data/mockData';

export type CategoryItemId = 
  | 'realestate_sale' 
  | 'realestate_rent' 
  | 'jobs' 
  | 'services' 
  | 'saved' 
  | 'cars' 
  | 'taxidelivery' 
  | 'currency' 
  | 'phones'
  | 'news'
  | 'tools' 
  | 'electronics';

interface SwipeableCategoryBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedSubCategory?: string;
  onSelectCategory?: (categoryId: CategoryItemId, tab: TabType) => void;
  className?: string;
}

export const SwipeableCategoryBar: React.FC<SwipeableCategoryBarProps> = ({
  activeTab,
  setActiveTab,
  selectedSubCategory,
  onSelectCategory,
  className = '',
}) => {
  const { language, isRtl } = useLanguage();
  const { bookmarksCount } = useBookmarks();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Listing counts calculations
  const realEstateSaleCount = initialRealEstateListings.filter(r => r.type === 'sale').length;
  const realEstateRentCount = initialRealEstateListings.filter(r => r.type === 'rent').length;
  const jobsCount = initialJobListings.length;
  const carsCount = initialCarListings.length;
  const taxiCount = initialTaxiOrders.length;

  const categories: {
    id: CategoryItemId;
    tab: TabType;
    labelAr: string;
    labelEn: string;
    sublabelAr?: string;
    icon: React.ReactNode;
    color: string;
    activeBorder: string;
    activeBg: string;
    badge?: string | number;
    highlight?: boolean;
  }[] = [
    {
      id: 'realestate_sale',
      tab: 'realestate',
      labelAr: 'العقارات (شراء وبيع)',
      labelEn: 'Properties (Sale)',
      sublabelAr: 'شقق وأراضي وفيلا',
      icon: <Building className="w-4 h-4" />,
      color: 'text-sky-400',
      activeBorder: 'border-sky-400 shadow-sky-500/30',
      activeBg: 'bg-gradient-to-r from-sky-600 to-blue-600 text-white',
      badge: `${realEstateSaleCount}`,
    },
    {
      id: 'realestate_rent',
      tab: 'realestate',
      labelAr: 'الإيجارات (سكن وتجاري)',
      labelEn: 'Rentals (Homes & Shops)',
      sublabelAr: 'شقق وغرف ومحلات',
      icon: <Home className="w-4 h-4" />,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-400 shadow-emerald-500/30',
      activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
      badge: `${realEstateRentCount}`,
      highlight: true,
    },
    {
      id: 'jobs',
      tab: 'jobs',
      labelAr: 'فرص العمل والوظائف',
      labelEn: 'Jobs & Careers',
      sublabelAr: 'شواغر ورواتب فورية',
      icon: <Briefcase className="w-4 h-4" />,
      color: 'text-blue-400',
      activeBorder: 'border-blue-400 shadow-blue-500/30',
      activeBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
      badge: `${jobsCount}`,
      highlight: true,
    },
    {
      id: 'services',
      tab: 'jobs',
      labelAr: 'الخدمات والمهن',
      labelEn: 'Services & Trades',
      sublabelAr: 'صيانة وحرف ومهن',
      icon: <Wrench className="w-4 h-4" />,
      color: 'text-amber-400',
      activeBorder: 'border-amber-400 shadow-amber-500/30',
      activeBg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950',
      badge: language === 'ar' ? 'متاح ⚡️' : 'Live',
    },
    {
      id: 'saved',
      tab: 'saved',
      labelAr: 'المحفوظات والمفضلة',
      labelEn: 'Saved & Bookmarks',
      sublabelAr: 'الإعلانات المحفوظة',
      icon: <Bookmark className="w-4 h-4" />,
      color: 'text-amber-300',
      activeBorder: 'border-amber-400 shadow-amber-500/30',
      activeBg: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950',
      badge: bookmarksCount > 0 ? bookmarksCount : undefined,
    },
    {
      id: 'cars',
      tab: 'cars',
      labelAr: 'سوق السيارات والمركبات',
      labelEn: 'Cars & Vehicles',
      sublabelAr: 'سيارات وقطع تبديل',
      icon: <CarIcon className="w-4 h-4" />,
      color: 'text-indigo-400',
      activeBorder: 'border-indigo-400 shadow-indigo-500/30',
      activeBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white',
      badge: `${carsCount}`,
    },
    {
      id: 'taxidelivery',
      tab: 'taxidelivery',
      labelAr: 'تكسي وتوصيل طرود',
      labelEn: 'Taxi & Delivery',
      sublabelAr: 'سفريات وشحن فوري',
      icon: <Truck className="w-4 h-4" />,
      color: 'text-yellow-400',
      activeBorder: 'border-yellow-400 shadow-yellow-500/30',
      activeBg: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950',
      badge: `${taxiCount}`,
    },
    {
      id: 'currency',
      tab: 'currency',
      labelAr: 'أسعار الصرف والذهب والسلع السورية',
      labelEn: 'Exchange, Gold & Syrian Goods',
      sublabelAr: 'تحديث يومي حي ومباشر',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-400 shadow-cyan-500/30',
      activeBg: 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white',
      badge: language === 'ar' ? 'يومي حي 🟢' : 'Daily 🟢',
    },
    {
      id: 'phones',
      tab: 'phones',
      labelAr: 'أسعار الهواتف والمنتجات (دقيقة بدقيقة)',
      labelEn: 'Live Phones & Tech Prices',
      sublabelAr: 'تحديث فوري شامل الجمركة ⚡️',
      icon: <Smartphone className="w-4 h-4 text-indigo-400" />,
      color: 'text-indigo-400',
      activeBorder: 'border-indigo-400 shadow-indigo-500/30',
      activeBg: 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white',
      badge: language === 'ar' ? 'دقيقة بدقيقة 🔴' : 'Live 🔴',
      highlight: true,
    },
    {
      id: 'news',
      tab: 'news',
      labelAr: 'أخبار الوكالة السورية الرسمية (سانا)',
      labelEn: 'Official Syrian News (SANA)',
      sublabelAr: 'تحديث على مدار الساعة ⚡️',
      icon: <Radio className="w-4 h-4 text-red-400" />,
      color: 'text-red-400',
      activeBorder: 'border-red-500 shadow-red-500/30',
      activeBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white',
      badge: language === 'ar' ? 'ساعة بساعة 🔴' : 'Hourly 🔴',
      highlight: true,
    },
    {
      id: 'electronics',
      tab: 'phones',
      labelAr: 'أجهزة وإلكترونيات وطاقة',
      labelEn: 'Electronics & Solar Tech',
      sublabelAr: 'هواتف وإنفرترات وبطاريات',
      icon: <Laptop className="w-4 h-4" />,
      color: 'text-purple-400',
      activeBorder: 'border-purple-400 shadow-purple-500/30',
      activeBg: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    },
    {
      id: 'tools',
      tab: 'cars',
      labelAr: 'معدات ومستلزمات',
      labelEn: 'Equipment & Tools',
      sublabelAr: 'أدوات وأجهزة منزلية',
      icon: <ShoppingBag className="w-4 h-4" />,
      color: 'text-teal-400',
      activeBorder: 'border-teal-400 shadow-teal-500/30',
      activeBg: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white',
    }
  ];

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    if (maxScroll <= 5) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    
    const absScroll = Math.abs(scrollLeft);
    
    if (isRtl) {
      // In RTL:
      // At starting position (absScroll ~ 0), we are at the right edge, so we can scroll left (canScrollLeft = true, canScrollRight = false)
      // When scrolled all the way to left (absScroll ~ maxScroll), canScrollLeft = false, canScrollRight = true
      const atStartRight = absScroll < 10;
      const atEndLeft = absScroll >= maxScroll - 10;
      setCanScrollLeft(!atEndLeft);
      setCanScrollRight(!atStartRight);
    } else {
      // In LTR:
      setCanScrollLeft(absScroll > 10);
      setCanScrollRight(absScroll < maxScroll - 10);
    }
  }, [isRtl]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 240;
    const delta = direction === 'left' ? -scrollAmount : scrollAmount;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
    setHasMoved(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleCategoryClick = (cat: typeof categories[0], e?: React.MouseEvent<HTMLButtonElement>) => {
    if (hasMoved) {
      // Prevent click action if user was dragging
      return;
    }
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    if (onSelectCategory) {
      onSelectCategory(cat.id, cat.tab);
    } else {
      setActiveTab(cat.tab);
    }
  };

  // Determine active item
  const isCategoryActive = (cat: typeof categories[0]) => {
    if (selectedSubCategory) {
      return selectedSubCategory === cat.id;
    }
    if (cat.tab === activeTab) {
      if (activeTab === 'realestate') {
        return cat.id === 'realestate_sale' || cat.id === 'realestate_rent';
      }
      return true;
    }
    return false;
  };

  return (
    <div className={`w-full bg-slate-950/95 border-y border-amber-500/30 backdrop-blur-md relative select-none z-30 transition-all ${className}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 relative flex items-center overflow-hidden">
        
        {/* Subtle Left Fade Gradient Overlay */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 pointer-events-none z-15 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent transition-opacity duration-300 ease-out ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Left Scroll Navigation Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          title={language === 'ar' ? 'سحب لليسار' : 'Scroll Left'}
          className={`hidden sm:flex absolute left-1 sm:left-2 z-20 w-7 h-7 rounded-full bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-amber-500/40 items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer backdrop-blur-xs ${
            canScrollLeft ? 'opacity-100 scale-100' : 'opacity-40 scale-95 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Swipeable & Draggable Scroll Container */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-2 sm:px-8 w-full cursor-grab active:cursor-grabbing scroll-smooth touch-pan-x ${
            isRtl ? 'dir-rtl' : 'dir-ltr'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat) => {
            const isActive = isCategoryActive(cat);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => handleCategoryClick(cat, e)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer group border text-right ${
                  isActive
                    ? `${cat.activeBg} ${cat.activeBorder} shadow-lg font-black scale-[1.02]`
                    : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 border-slate-800 hover:border-amber-500/40 font-bold shadow-xs'
                }`}
              >
                {/* Category Icon Container */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-xs ${
                    isActive
                      ? 'bg-slate-950/40 text-amber-300'
                      : `bg-slate-950/80 ${cat.color} border border-slate-800 group-hover:border-amber-500/30`
                  }`}
                >
                  {cat.icon}
                </div>

                {/* Category Titles */}
                <div className="flex flex-col items-start leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs whitespace-nowrap font-extrabold tracking-tight">
                      {language === 'ar' ? cat.labelAr : cat.labelEn}
                    </span>
                    {cat.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black font-mono shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  {cat.sublabelAr && (
                    <span
                      className={`text-[9.5px] whitespace-nowrap font-medium transition-colors ${
                        isActive ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {language === 'ar' ? cat.sublabelAr : ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Subtle Right Fade Gradient Overlay */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 pointer-events-none z-15 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent transition-opacity duration-300 ease-out ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Right Scroll Navigation Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          title={language === 'ar' ? 'سحب لليمين' : 'Scroll Right'}
          className={`hidden sm:flex absolute right-1 sm:right-2 z-20 w-7 h-7 rounded-full bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-amber-500/40 items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer backdrop-blur-xs ${
            canScrollRight ? 'opacity-100 scale-100' : 'opacity-40 scale-95 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>

      </div>

      {/* Mobile Touch Swipe Hint Footer with Smooth Pill Indicator */}
      <div className="sm:hidden flex items-center justify-center gap-3 px-3 py-1 bg-slate-950/90 border-t border-slate-800/60 text-[10px] text-slate-400 text-center">
        <span className="flex items-center justify-center gap-1.5 text-amber-400 font-bold">
          <span>👈</span>
          <span>{language === 'ar' ? 'اسحب الشريط للتنقل بين الأقسام' : 'Swipe to browse categories'}</span>
          <span>👉</span>
        </span>
        <span className="font-mono text-[9px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
          12 قسماً
        </span>
      </div>
    </div>
  );
};
