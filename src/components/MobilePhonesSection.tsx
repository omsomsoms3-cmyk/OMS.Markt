import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Smartphone,
  Radio,
  Clock,
  RefreshCw,
  Search,
  Zap,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Scale,
  Calculator,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Share2,
  Bookmark,
  Sparkles,
  Award,
  Battery,
  Cpu,
  Camera,
  Layers,
  PhoneCall,
  DollarSign,
  AlertCircle,
  Eye,
  Copy,
  Check,
  X,
  MessageCircle,
  Sun,
  Laptop,
  MoveHorizontal,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MobilePhoneItem, TechProductItem, PhoneBrand } from '../types';
import {
  PHONE_BRANDS_LIST,
  BASE_MOBILE_PHONES,
  BASE_TECH_PRODUCTS
} from '../data/mobilePhonesData';
import {
  getMinuteSyncStatus,
  getLiveRecalculatedPhones,
  getLiveRecalculatedTechProducts,
  calculateSyrianPhoneCustoms,
  getPhoneAverageMarketInfo,
  MinuteSyncStatus,
  CustomPhoneCalculationResult
} from '../lib/mobilePhonesService';

interface MobilePhonesSectionProps {
  searchQuery?: string;
  onSelectTab?: (tab: any) => void;
  externalUsdRate?: number;
}

export const MobilePhonesSection: React.FC<MobilePhonesSectionProps> = ({
  searchQuery = '',
  onSelectTab,
  externalUsdRate = 14900,
}) => {
  const { language, isRtl } = useLanguage();
  
  // Exchange rate state
  const [marketUsdRate, setMarketUsdRate] = useState<number>(externalUsdRate || 14900);
  const [tickSeed, setTickSeed] = useState<number>(0);
  
  // Minute Sync State
  const [syncStatus, setSyncStatus] = useState<MinuteSyncStatus>(() =>
    getMinuteSyncStatus(marketUsdRate)
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Phone & Tech Data State
  const [phones, setPhones] = useState<MobilePhoneItem[]>(() =>
    getLiveRecalculatedPhones(marketUsdRate, 0)
  );
  const [techProducts, setTechProducts] = useState<TechProductItem[]>(() =>
    getLiveRecalculatedTechProducts(marketUsdRate, 0)
  );

  // Filters State
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [customsFilter, setCustomsFilter] = useState<'all' | 'customed' | 'uncustoms'>('all');
  const [priceTierFilter, setPriceTierFilter] = useState<'all' | 'budget' | 'midrange' | 'flagship'>('all');
  const [sortBy, setSortBy] = useState<'bestseller' | 'price_asc' | 'price_desc' | 'newest' | 'change'>('bestseller');
  const [localSearch, setLocalSearch] = useState<string>('');
  
  // Modals & Tools State
  const [selectedPhoneForModal, setSelectedPhoneForModal] = useState<MobilePhoneItem | null>(null);
  const [isCustomsCalcOpen, setIsCustomsCalcOpen] = useState<boolean>(false);
  const [calcInputUSD, setCalcInputUSD] = useState<number>(850);
  const [calcResult, setCalcResult] = useState<CustomPhoneCalculationResult>(() =>
    calculateSyrianPhoneCustoms(850, marketUsdRate)
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedPhoneIds, setSavedPhoneIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oms_saved_phones');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Minute-by-Minute Live Timer (ticks every 1 second to update clock and countdown, updates prices every minute)
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncStatus((prev) => {
        const next = getMinuteSyncStatus(marketUsdRate);
        // If second rolls over to 00, trigger minute tick seed increment
        if (new Date().getSeconds() === 0) {
          setTickSeed((s) => s + 1);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [marketUsdRate]);

  // Recalculate prices when tickSeed or marketUsdRate changes
  useEffect(() => {
    setPhones(getLiveRecalculatedPhones(marketUsdRate, tickSeed));
    setTechProducts(getLiveRecalculatedTechProducts(marketUsdRate, tickSeed));
  }, [marketUsdRate, tickSeed]);

  // Update calculator when USD input or rate changes
  useEffect(() => {
    setCalcResult(calculateSyrianPhoneCustoms(calcInputUSD, marketUsdRate));
  }, [calcInputUSD, marketUsdRate]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTickSeed((s) => s + 1);
      setSyncStatus(getMinuteSyncStatus(marketUsdRate));
      setIsRefreshing(false);
    }, 500);
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedPhoneIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem('oms_saved_phones', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleCopyPrice = async (phone: MobilePhoneItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = `📱 ${phone.modelNameAr}\nالسعر مجمرك: ${phone.totalWithCustomsSYP.toLocaleString()} ل.س ($${phone.priceUSD + phone.customsTaxUSD})\nالسعر بدون جمركة: ${phone.priceWithoutCustomsSYP.toLocaleString()} ل.س ($${phone.priceUSD})\nرسم الجمركة: ${phone.customsTaxSYP.toLocaleString()} ل.س ($${phone.customsTaxUSD})\nالكفالة: ${phone.warrantyAr}\nالمصدر: تطبيق OMS الأسواق السورية (تحديث دقيقة بدقيقة)`;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedId(phone.id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch {}
  };

  const handleSharePhone = async (phone: MobilePhoneItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = `📱 ${phone.modelNameAr}\nالسعر مجمرك مع كفالة: ${phone.totalWithCustomsSYP.toLocaleString()} ل.س ($${phone.priceUSD + phone.customsTaxUSD})\nالسعر بدون جمركة: ${phone.priceWithoutCustomsSYP.toLocaleString()} ل.س\nرسم الجمركة السورية: ${phone.customsTaxSYP.toLocaleString()} ل.س\nالضمان: ${phone.warrantyAr}\nمحدث دقيقة بدقيقة عبر OMS أسواق سورية`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: phone.modelNameAr,
          text,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyPrice(phone, e);
    }
  };

  const effectiveSearch = (searchQuery || localSearch).trim().toLowerCase();

  // Filtered phones
  const filteredPhones = useMemo(() => {
    if (selectedBrand === 'tech_products') {
      return [];
    }

    return phones.filter((item) => {
      // Brand filter
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) {
        return false;
      }

      // Customs filter
      if (customsFilter === 'customed' && !item.isOfficialCustoms) {
        return false;
      }

      // Price Tier filter (Average price in Syria)
      if (priceTierFilter === 'budget' && item.totalWithCustomsSYP > 5000000) {
        return false;
      }
      if (priceTierFilter === 'midrange' && (item.totalWithCustomsSYP <= 5000000 || item.totalWithCustomsSYP > 15000000)) {
        return false;
      }
      if (priceTierFilter === 'flagship' && item.totalWithCustomsSYP <= 15000000) {
        return false;
      }

      // Text search
      if (effectiveSearch) {
        const matchesAr = item.modelNameAr.toLowerCase().includes(effectiveSearch);
        const matchesEn = item.modelNameEn.toLowerCase().includes(effectiveSearch);
        const matchesStorage = item.storage.toLowerCase().includes(effectiveSearch);
        const matchesBrand = item.brand.toLowerCase().includes(effectiveSearch);
        const matchesProcessor = item.processor.toLowerCase().includes(effectiveSearch);
        const matchesWarranty = item.warrantyAr.toLowerCase().includes(effectiveSearch);

        if (!matchesAr && !matchesEn && !matchesStorage && !matchesBrand && !matchesProcessor && !matchesWarranty) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.totalWithCustomsSYP - b.totalWithCustomsSYP;
      if (sortBy === 'price_desc') return b.totalWithCustomsSYP - a.totalWithCustomsSYP;
      if (sortBy === 'newest') return b.releaseYear - a.releaseYear;
      if (sortBy === 'change') return Math.abs(b.change24h) - Math.abs(a.change24h);
      // best seller default
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      return 0;
    });
  }, [phones, selectedBrand, customsFilter, sortBy, effectiveSearch]);

  // Filtered Tech Products
  const filteredTech = useMemo(() => {
    if (selectedBrand !== 'all' && selectedBrand !== 'tech_products') {
      return [];
    }

    return techProducts.filter((item) => {
      if (effectiveSearch) {
        const matchesAr = item.nameAr.toLowerCase().includes(effectiveSearch);
        const matchesEn = item.nameEn.toLowerCase().includes(effectiveSearch);
        const matchesBrand = item.brand.toLowerCase().includes(effectiveSearch);
        const matchesSpecs = item.specsAr.toLowerCase().includes(effectiveSearch);
        if (!matchesAr && !matchesEn && !matchesBrand && !matchesSpecs) {
          return false;
        }
      }
      return true;
    });
  }, [techProducts, selectedBrand, effectiveSearch]);

  // Active Phone Index & Navigation
  const currentPhoneIndex = useMemo(() => {
    if (!selectedPhoneForModal) return -1;
    return filteredPhones.findIndex((item) => item.id === selectedPhoneForModal.id);
  }, [selectedPhoneForModal, filteredPhones]);

  const goToNextPhone = useCallback(() => {
    if (filteredPhones.length === 0) return;
    if (currentPhoneIndex === -1) {
      setSelectedPhoneForModal(filteredPhones[0]);
    } else {
      const nextIdx = (currentPhoneIndex + 1) % filteredPhones.length;
      setSelectedPhoneForModal(filteredPhones[nextIdx]);
    }
  }, [currentPhoneIndex, filteredPhones]);

  const goToPrevPhone = useCallback(() => {
    if (filteredPhones.length === 0) return;
    if (currentPhoneIndex === -1) {
      setSelectedPhoneForModal(filteredPhones[filteredPhones.length - 1]);
    } else {
      const prevIdx = (currentPhoneIndex - 1 + filteredPhones.length) % filteredPhones.length;
      setSelectedPhoneForModal(filteredPhones[prevIdx]);
    }
  }, [currentPhoneIndex, filteredPhones]);

  // Touch & Mouse Drag State for Left/Right Swiping
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartXRef = useRef<number | null>(null);
  const isPointerDownRef = useRef<boolean>(false);

  const handleDragStart = (clientX: number) => {
    dragStartXRef.current = clientX;
    isPointerDownRef.current = true;
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isPointerDownRef.current || dragStartXRef.current === null) return;
    const diff = clientX - dragStartXRef.current;
    if (Math.abs(diff) < 260) {
      setDragOffset(diff);
    }
  };

  const handleDragEnd = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);
    
    // Swipe threshold
    if (dragOffset > 55) {
      // Swiped right
      if (isRtl) {
        goToPrevPhone();
      } else {
        goToNextPhone();
      }
    } else if (dragOffset < -55) {
      // Swiped left
      if (isRtl) {
        goToNextPhone();
      } else {
        goToPrevPhone();
      }
    }
    setDragOffset(0);
    dragStartXRef.current = null;
  };

  // Keyboard navigation when phone modal is open
  useEffect(() => {
    if (!selectedPhoneForModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (isRtl) goToPrevPhone();
        else goToNextPhone();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) goToNextPhone();
        else goToPrevPhone();
      } else if (e.key === 'Escape') {
        setSelectedPhoneForModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoneForModal, goToNextPhone, goToPrevPhone, isRtl]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Master Minute-by-Minute Ticker Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-indigo-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 bottom-1 text-slate-800/20 font-black text-6xl select-none pointer-events-none font-mono">
          PHONES LIVE
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/40 shrink-0 shadow-lg shadow-indigo-500/10">
              <Smartphone className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                  {language === 'ar' ? 'تحديث دقيقة بدقيقة ⚡️' : 'Minute-by-Minute Live ⚡️'}
                </span>
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full border border-slate-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {language === 'ar' ? 'شامل الجمركة والكفالات السورية' : 'Includes Customs & Syrian Warranties'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {language === 'ar'
                  ? 'بورصة أسعار الهواتف والمنتجات في سورية (دقيقة بدقيقة)'
                  : 'Live Syrian Mobile Phone & Tech Product Prices (Minute by Minute)'}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {language === 'ar'
                  ? 'أسعار فورية لكافة أجهزة آبل وسامسونج وشاومي وإنفينيكس وتكنو وريلمي وهونر، مع احتساب رسمي لرسوم الجمركة والتصريح الجمركي وربط مباشر بسعر صرف الليرة السورية.'
                  : 'Real-time prices for iPhone, Samsung, Xiaomi, Infinix, Tecno & Realme with Syrian customs fees linked to live USD exchange rate.'}
              </p>
            </div>
          </div>

          {/* Real-time Clock, Rate & Tools Widget */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 w-full md:w-auto shrink-0 shadow-xl space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="font-mono text-sm">{syncStatus.currentTimeDamascus}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({language === 'ar' ? 'توقيت دمشق' : 'Damascus'})</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'ar' ? 'التحديث اللحظي بعد:' : 'Next minute tick:'}{' '}
                  <span className="text-amber-400 font-mono font-bold">{syncStatus.nextTickSeconds} {language === 'ar' ? 'ثانية' : 'sec'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (language === 'ar' ? 'تحديث لحظي' : 'Live Sync')}</span>
              </button>
            </div>

            {/* Live Benchmark Rate & Customs Quick Calc Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1 text-slate-300">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ar' ? 'سعر الدولار المعتمد:' : 'Benchmark USD:'}</span>
                <span className="font-mono font-bold text-amber-400">{marketUsdRate.toLocaleString()} ل.س</span>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomsCalcOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/60"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'حاسبة الجمركة' : 'Customs Calc'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Ticker Quick Highlights */}
        <div className="mt-4 pt-3 border-t border-indigo-500/20 flex items-center gap-2 overflow-hidden bg-slate-950/60 p-2 rounded-xl">
          <div className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{language === 'ar' ? 'أبرز الأسعار الآن' : 'LIVE TICK'}</span>
          </div>
          <div className="flex-1 overflow-x-auto scrollbar-none whitespace-nowrap text-xs text-slate-200">
            <div className="inline-flex items-center gap-6">
              {phones.slice(0, 6).map((item) => (
                <span
                  key={item.id}
                  onClick={() => setSelectedPhoneForModal(item)}
                  className="hover:text-indigo-300 transition-colors cursor-pointer font-bold inline-flex items-center gap-1.5"
                >
                  <span className="text-slate-300">{item.brand}:</span>
                  <span>{item.modelNameAr.split('(')[0]}</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {item.totalWithCustomsSYP.toLocaleString()} ل.س
                  </span>
                  <span className={`text-[10px] ${item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.change24h >= 0 ? `+${item.change24h}%` : `${item.change24h}%`}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Selector, Search & Filters Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'ابحث بالاسم أو الموديل (مثل iPhone 16, S24 Ultra, Redmi Note 13, A55, إنفيرتر...)'
                  : 'Search by model (e.g. iPhone 16 Pro, S24, Redmi Note 13, A55)...'
              }
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-indigo-500 text-white text-xs rounded-xl pr-9 pl-4 py-2.5 outline-none transition-all placeholder:text-slate-500"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Customs & Average Price Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCustomsFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  customsFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setCustomsFilter('customed')}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  customsFilter === 'customed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>{language === 'ar' ? 'مجمرك رسمي' : 'Customed'}</span>
              </button>
            </div>

            {/* Price Tier Segment */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPriceTierFilter('all')}
                className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  priceTierFilter === 'all' ? 'bg-slate-800 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'كل الأسعار' : 'All Prices'}
              </button>
              <button
                type="button"
                onClick={() => setPriceTierFilter('budget')}
                className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  priceTierFilter === 'budget' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'اقتصادي (< 5M)' : 'Budget'}
              </button>
              <button
                type="button"
                onClick={() => setPriceTierFilter('midrange')}
                className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  priceTierFilter === 'midrange' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'متوسط (5-15M)' : 'Midrange'}
              </button>
              <button
                type="button"
                onClick={() => setPriceTierFilter('flagship')}
                className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                  priceTierFilter === 'flagship' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'فلاقشيب (> 15M)' : 'Flagship'}
              </button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer w-full md:w-auto font-bold"
            >
              <option value="bestseller">{language === 'ar' ? '🔥 الأكثر طلباً وشعبية' : 'Best Sellers'}</option>
              <option value="price_asc">{language === 'ar' ? '💰 السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
              <option value="price_desc">{language === 'ar' ? '💎 السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
              <option value="newest">{language === 'ar' ? '✨ أحدث الموديلات (2024)' : 'Newest Models'}</option>
              <option value="change">{language === 'ar' ? '📈 أعلى تغير بالسعر' : 'Highest Price Move'}</option>
            </select>
          </div>
        </div>

        {/* Brand Tabs Horizontal Slider */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800/80">
          {PHONE_BRANDS_LIST.map((brand) => {
            const isActive = selectedBrand === brand.id;
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => setSelectedBrand(brand.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-md font-black'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span>{brand.logoText}</span>
                <span>{language === 'ar' ? brand.nameAr : brand.nameEn}</span>
                {brand.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400'}`}>
                    {brand.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Mobile Phone Cards */}
      {selectedBrand !== 'tech_products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>{language === 'ar' ? 'قائمة الهواتف الذكية المحدثة دقيقة بدقيقة' : 'Live Mobile Phone Catalog'}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {filteredPhones.length} {language === 'ar' ? 'جهاز' : 'models'}
              </span>
            </h3>

            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {syncStatus.lastSyncFormatted}
            </span>
          </div>

          {filteredPhones.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Smartphone className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-white font-bold text-base">
                {language === 'ar' ? 'لم يتم العثور على هواتف مطابقة للبحث' : 'No phones found matching search'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'جرب البحث باسم آخر أو اختيار قسم كل الماركات' : 'Try searching another keyword or clearing filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhones.map((phone) => {
                const isSaved = savedPhoneIds.includes(phone.id);
                const isCopied = copiedId === phone.id;
                const avgInfo = getPhoneAverageMarketInfo(phone);

                return (
                  <div
                    key={phone.id}
                    onClick={() => setSelectedPhoneForModal(phone)}
                    className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    {/* Card Header & Product Image */}
                    <div className="relative h-48 w-full bg-slate-950 overflow-hidden flex items-center justify-center p-3">
                      <img
                        src={phone.image}
                        alt={phone.modelNameAr}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                        <span className="bg-slate-950/85 backdrop-blur-xs text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-indigo-800/60 shadow-sm">
                          {phone.brand}
                        </span>
                        {phone.isNewRelease && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-md shadow-md">
                            جديد 2024 ✨
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(phone.id, e)}
                          className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                              : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                          title={language === 'ar' ? 'حفظ في المفضلة' : 'Save'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Network & Storage overlay */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px]">
                        <span className="bg-slate-950/90 text-white font-mono font-bold px-2 py-0.5 rounded-md border border-slate-800">
                          {phone.storage}
                        </span>
                        <span className="bg-slate-950/90 text-slate-300 font-mono px-1.5 py-0.5 rounded-md border border-slate-800">
                          {phone.ram} RAM
                        </span>
                        <span className="bg-indigo-950/90 text-indigo-300 font-black px-1.5 py-0.5 rounded-md border border-indigo-800/80">
                          {phone.network}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-extrabold text-white group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
                          {phone.modelNameAr}
                        </h4>

                        {/* Specs Micro Pills */}
                        <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px] text-slate-400">
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80 flex items-center gap-1">
                            <Camera className="w-3 h-3 text-cyan-400" />
                            <span className="line-clamp-1">{phone.camera.split('+')[0]}</span>
                          </span>
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80 flex items-center gap-1">
                            <Battery className="w-3 h-3 text-emerald-400" />
                            <span>{phone.battery.split(' ')[0]} mAh</span>
                          </span>
                        </div>
                      </div>

                      {/* Pricing Breakdown Box (with average market indicators) */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/90 space-y-1.5">
                        {/* Full Average Price with Customs */}
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{language === 'ar' ? 'متوسط السعر مجمرك:' : 'Average Price:'}</span>
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {language === 'ar' ? 'السوق السوري' : 'Syria Market'}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-emerald-400 font-mono">
                              {avgInfo.avgTotalWithCustomsSYP.toLocaleString()} <span className="text-[10px] text-slate-300">ل.س</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ≈ ${(avgInfo.avgTotalUSD).toLocaleString()} USD
                            </div>
                          </div>
                        </div>

                        {/* Market Price Range (Min - Max) */}
                        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">{language === 'ar' ? 'نطاق الأسعار في المحافظات:' : 'Market Range:'}</span>
                          <span className="font-mono text-cyan-400 font-bold">
                            {(avgInfo.minTotalWithCustomsSYP / 1000000).toFixed(1)}M - {(avgInfo.maxTotalWithCustomsSYP / 1000000).toFixed(1)}M ل.س
                          </span>
                        </div>

                        {/* Customs Fee Breakdown */}
                        <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{language === 'ar' ? 'رسم الجمركة والتصريح:' : 'Customs Fee:'}</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {phone.customsTaxSYP.toLocaleString()} ل.س (${phone.customsTaxUSD})
                          </span>
                        </div>

                        {/* Price Without Customs */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{language === 'ar' ? 'بدون جمركة:' : 'No Customs:'}</span>
                          <span className="font-mono">
                            {phone.priceWithoutCustomsSYP.toLocaleString()} ل.س (${phone.priceUSD})
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Warranty & Quick Action */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[150px]">
                          🛡️ {phone.warrantyAr}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleCopyPrice(phone, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer border border-slate-700"
                            title={language === 'ar' ? 'نسخ السعر' : 'Copy Price'}
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleSharePhone(phone, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer border border-slate-700"
                            title={language === 'ar' ? 'مشاركة' : 'Share'}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tech, Solar & Gadgets Grid */}
      {(selectedBrand === 'all' || selectedBrand === 'tech_products') && filteredTech.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'أجهزة ذكية ومنظومات الطاقة البديلة والإنفرترات' : 'Smart Devices & Solar Energy Systems'}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {filteredTech.length}
              </span>
            </h3>
            <span className="text-[11px] text-amber-400 font-mono font-bold">
              {language === 'ar' ? '⚡️ أسعار لحظية دقيقة بدقيقة' : 'Live Ticker'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTech.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-24 h-24 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center p-1.5">
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                      {item.categoryAr}
                    </span>
                    <h4 className="text-xs font-extrabold text-white leading-snug">
                      {item.nameAr}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.specsAr}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-amber-400 font-mono">
                      {item.priceSYP.toLocaleString()} <span className="text-[10px] text-slate-300">ل.س</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ≈ ${item.priceUSD} USD
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    {item.warrantyAr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Syrian Customs (الجمركة) Interactive Calculator Modal */}
      {isCustomsCalcOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-5 sm:p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/40">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {language === 'ar' ? 'حاسبة الجمركة السورية والتصريح الجمركي' : 'Syrian Phone Customs Calculator'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'حساب فوري للرسوم على منظومة مطابقة الهواتف' : 'Calculate telecommunications tariff & total price'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomsCalcOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Input USD Price */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {language === 'ar' ? 'أدخل سعر الهاتف بالدولار الأمريكي ($):' : 'Enter Phone Price in USD ($):'}
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={calcInputUSD}
                  onChange={(e) => setCalcInputUSD(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-sm font-mono font-bold rounded-xl pr-9 pl-4 py-2.5 outline-none"
                  min="1"
                  step="10"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[120, 250, 450, 850, 1200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCalcInputUSD(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      calcInputUSD === preset
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Calculation Results Breakdown */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-900/40 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">{language === 'ar' ? 'الشريحة الجمركية المقدرة:' : 'Tariff Tier:'}</span>
                <span className="font-bold text-indigo-400">{calcResult.tierNameAr}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{language === 'ar' ? 'السعر بدون جمركة بالليرة:' : 'Base SYP Price:'}</span>
                <span className="font-mono font-bold text-slate-200">{calcResult.priceWithoutCustomsSYP.toLocaleString()} ل.س</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{language === 'ar' ? 'رسم الجمركة والتصريح الجمركي:' : 'Customs & Tax Fee:'}</span>
                <span className="font-mono font-bold text-amber-400">
                  {calcResult.customsFeeSYP.toLocaleString()} ل.س (${calcResult.customsFeeUSD})
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="font-extrabold text-white">{language === 'ar' ? 'السعر الإجمالي مجمرك نظامي:' : 'Total Customed Price:'}</span>
                <span className="font-mono font-black text-emerald-400">
                  {calcResult.totalWithCustomsSYP.toLocaleString()} ل.س
                </span>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 text-center">
                {language === 'ar'
                  ? `* محسوب بناءً على سعر صرف الدولار المباشر (${marketUsdRate.toLocaleString()} ل.س / $)`
                  : `* Calculated using live benchmark rate of ${marketUsdRate.toLocaleString()} SYP / $`}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomsCalcOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {language === 'ar' ? 'تم واعتماد الحساب' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* Full Phone Specifications & Purchase Guide Modal with Centered Positioning, Drag & Swipe, and Side Navigation */}
      {selectedPhoneForModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedPhoneForModal(null);
            }
          }}
        >
          {/* Floating Left Navigation Button (Desktop) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isRtl) goToNextPhone();
              else goToPrevPhone();
            }}
            aria-label="Previous / Next Phone"
            title={language === 'ar' ? 'الهاتف التالي (سهم يسار)' : 'Next Phone'}
            className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white border border-slate-700 hover:border-indigo-500 shadow-2xl items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Floating Right Navigation Button (Desktop) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isRtl) goToPrevPhone();
              else goToNextPhone();
            }}
            aria-label="Next / Previous Phone"
            title={language === 'ar' ? 'الهاتف السابق (سهم يمين)' : 'Previous Phone'}
            className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white border border-slate-700 hover:border-indigo-500 shadow-2xl items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Centered Modal Container with Interactive Drag Translation */}
          <div 
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            style={{
              transform: dragOffset ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.02}deg)` : undefined,
              transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              cursor: isDragging ? 'grabbing' : 'default'
            }}
            className="relative bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto animate-fadeIn max-h-[90vh] flex flex-col mx-auto select-none"
          >
            {/* Top Drag & Swipe Interactive Banner */}
            <div className="bg-slate-950/95 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-bold">
                <MoveHorizontal className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {language === 'ar' ? 'اسحب لليمين أو اليسار لتصفح باقي الهواتف' : 'Swipe or drag left/right to browse phones'}
                </span>
              </div>

              {/* Counter Indicator */}
              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono text-[11px] font-bold text-slate-300">
                <span>{currentPhoneIndex >= 0 ? currentPhoneIndex + 1 : 1}</span>
                <span className="text-slate-500">/</span>
                <span>{filteredPhones.length}</span>
              </div>
            </div>

            {/* Modal Header */}
            <div className="relative h-56 w-full bg-slate-950 shrink-0 flex items-center justify-center p-4">
              <img
                src={selectedPhoneForModal.image}
                alt={selectedPhoneForModal.modelNameAr}
                className="max-h-full max-w-full object-contain pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/60 pointer-events-none" />

              <button
                type="button"
                onClick={() => setSelectedPhoneForModal(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 transition-all cursor-pointer shadow-lg z-20"
              >
                ✕
              </button>

              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                  {selectedPhoneForModal.brand}
                </span>
                <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                  مجمرك رسمي 🛡️
                </span>
              </div>

              <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between text-xs text-slate-200 pointer-events-none">
                <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700 font-mono font-bold">
                  {selectedPhoneForModal.storage} • {selectedPhoneForModal.ram} RAM
                </span>
                <span className="font-mono text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-lg font-black text-sm">
                  {selectedPhoneForModal.totalWithCustomsSYP.toLocaleString()} ل.س
                </span>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 select-text">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                  {selectedPhoneForModal.modelNameAr}
                </h3>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">
                  {selectedPhoneForModal.modelNameEn} • {selectedPhoneForModal.network} • {selectedPhoneForModal.colorAr}
                </p>
              </div>

              {/* Price & Customs Table */}
              {(() => {
                const modalAvg = getPhoneAverageMarketInfo(selectedPhoneForModal);
                return (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                    <h4 className="font-extrabold text-white text-xs flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'ar' ? 'متوسط السعر والجمركة السورية الرسمية ⚖️' : 'Syrian Average Price & Official Customs'}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        {language === 'ar' ? 'متوسط دقيق' : 'Fair Average'}
                      </span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'متوسط السعر مجمرك نظامي:' : 'Average Customed Price:'}</span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          {modalAvg.avgTotalWithCustomsSYP.toLocaleString()} ل.س
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ≈ ${modalAvg.avgTotalUSD.toLocaleString()} USD
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'رسم الجمركة والتصريح السوري:' : 'Customs Fee:'}</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {selectedPhoneForModal.customsTaxSYP.toLocaleString()} ل.س
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ≈ ${selectedPhoneForModal.customsTaxUSD} USD
                        </span>
                      </div>
                    </div>

                    {/* Regional Spread */}
                    <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold">{language === 'ar' ? 'النطاق السعري في المحافظات:' : 'Syrian Market Spread:'}</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {(modalAvg.minTotalWithCustomsSYP / 1000000).toFixed(2)}M - {(modalAvg.maxTotalWithCustomsSYP / 1000000).toFixed(2)}M ل.س
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{language === 'ar' ? 'السعر العالمي بدون جمركة:' : 'Global Price Without Customs:'}</span>
                      <span className="font-mono text-slate-300">
                        {selectedPhoneForModal.priceWithoutCustomsSYP.toLocaleString()} ل.س (${selectedPhoneForModal.priceUSD})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{language === 'ar' ? 'الضمان والوكيل المعتمد:' : 'Official Warranty:'}</span>
                      <span className="text-indigo-400 font-bold">{selectedPhoneForModal.warrantyAr}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Technical Specifications */}
              <div className="space-y-2 text-xs">
                <h4 className="font-extrabold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'ar' ? 'المواصفات الفنية والتقنية الكاملة' : 'Full Specifications'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 block">{language === 'ar' ? 'الشاشة:' : 'Screen:'}</span>
                    <span className="font-semibold text-slate-200">{selectedPhoneForModal.screen}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 block">{language === 'ar' ? 'المعالج:' : 'Processor:'}</span>
                    <span className="font-semibold text-slate-200">{selectedPhoneForModal.processor}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 block">{language === 'ar' ? 'الكاميرا:' : 'Camera:'}</span>
                    <span className="font-semibold text-slate-200">{selectedPhoneForModal.camera}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 block">{language === 'ar' ? 'البطارية والشحن:' : 'Battery:'}</span>
                    <span className="font-semibold text-slate-200">{selectedPhoneForModal.battery}</span>
                  </div>
                </div>
              </div>

              {/* Governorates Popularity */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">{language === 'ar' ? 'متوفر ومطلوب في:' : 'Available in:'}</span>
                {selectedPhoneForModal.popularInCities.map((c, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                    📍 {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer Controls with Quick Prev/Next & Action buttons */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={goToPrevPhone}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'السابق' : 'Prev'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleSharePhone(selectedPhoneForModal, e)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">{language === 'ar' ? 'مشاركة السعر' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhoneForModal(null)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20 cursor-pointer text-center"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>

              <button
                type="button"
                onClick={goToNextPhone}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ar' ? 'التالي' : 'Next'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
