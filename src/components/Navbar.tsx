import React, { useState, useRef, useEffect } from 'react';
import { TabType } from '../types';
import { OmsLogo } from './OmsLogo';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Globe, TrendingUp, Home, Car, ShoppingBag, Truck, BookOpen, MessageSquare, ExternalLink, Settings, Languages, User, PlusCircle, Search, X, ChevronRight, ChevronDown, SlidersHorizontal, Tag, MapPin, Share2, Briefcase, Flag, ShieldAlert, Sun, Moon, Bell, BellRing, History, Clock, Trash2, Bookmark, Zap, Mic, MicOff, Volume2, QrCode, Building, Compass, HelpCircle, Download, Smartphone, Radio } from 'lucide-react';
import { initialCarListings, initialRealEstateListings, initialTaxiOrders, initialJobListings } from '../data/mockData';
import { BASE_MOBILE_PHONES } from '../data/mobilePhonesData';
import { useReports } from '../context/ReportContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useAppMode } from '../context/AppModeContext';
import { useAuth } from '../context/AuthContext';
import { AdminReportsModal } from './AdminReportsModal';
import { QRScannerModal } from './QRScannerModal';
import { NetworkQualityIndicator } from './NetworkQualityIndicator';
import { SwipeableCategoryBar, CategoryItemId } from './SwipeableCategoryBar';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedCategory?: CategoryItemId;
  onSelectCategory?: (categoryId: CategoryItemId, tab: TabType) => void;
  userEmail: string;
  isLoggedIn: boolean;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenCreateAd?: () => void;
  onOpenShare?: () => void;
  onOpenNotifications?: () => void;
  onOpenIntegrations?: () => void;
  onOpenAppModeModal?: () => void;
  onOpenTour?: () => void;
  onOpenInstallGuide?: () => void;
  unreadNotificationsCount?: number;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  onSelectCategory,
  userEmail,
  isLoggedIn,
  onOpenSettings,
  onOpenProfile,
  onOpenCreateAd,
  onOpenShare,
  onOpenNotifications,
  onOpenIntegrations,
  onOpenAppModeModal,
  onOpenTour,
  onOpenInstallGuide,
  unreadNotificationsCount = 0,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { unreadCount, reports, autoAlerts, clearAlert } = useReports();
  const { bookmarksCount } = useBookmarks();
  const { appMode, toggleAppMode } = useAppMode();
  const { isLoggedIn: isAuthLoggedIn, userEmail: authEmail, displayName: authName, photoURL } = useAuth();
  const effectiveLoggedIn = isAuthLoggedIn || isLoggedIn;
  const effectiveEmail = isAuthLoggedIn ? authEmail : userEmail;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminReportsOpen, setIsAdminReportsOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Advanced Search Filters state
  const [searchMinPrice, setSearchMinPrice] = useState<string>('');
  const [searchMaxPrice, setSearchMaxPrice] = useState<string>('');
  const [searchCity, setSearchCity] = useState<string>('all');
  const [searchDateFilter, setSearchDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showSearchFilters, setShowSearchFilters] = useState<boolean>(false);

  const activeSearchFiltersCount =
    (searchMinPrice ? 1 : 0) +
    (searchMaxPrice ? 1 : 0) +
    (searchCity !== 'all' ? 1 : 0) +
    (searchDateFilter !== 'all' ? 1 : 0);

  const resetSearchFilters = () => {
    setSearchMinPrice('');
    setSearchMaxPrice('');
    setSearchCity('all');
    setSearchDateFilter('all');
  };

  const searchRef = useRef<HTMLDivElement>(null);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  // Local Storage Search History State (Last 5 Search Queries)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oms_search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 5);
        }
      }
      return ['هيونداي النترا', 'شقق دمشق', 'تكسي طارئ', 'محاسب', 'سامسونج S24'];
    } catch (e) {
      return ['هيونداي النترا', 'شقق دمشق', 'تكسي طارئ', 'محاسب', 'سامسونج S24'];
    }
  });

  const saveQueryToHistory = (queryStr: string) => {
    const trimmed = queryStr.trim();
    if (!trimmed || trimmed.length < 2) return;
    setSearchHistory((prev) => {
      // Remove any duplicate of this query (case-insensitive) and place it at the very top (index 0)
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Strictly top 5 recent searches
      try {
        localStorage.setItem('oms_search_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save search history', e);
      }
      return updated;
    });
  };

  const removeHistoryItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem('oms_search_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearSearchHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem('oms_search_history');
    } catch (e) {}
  };

  // Web Speech API Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleToggleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const errorMsg =
        language === 'ar'
          ? 'التعرف الصوتي غير مدعوم في هذا المتصفح. يرجى استخدام Chrome أو Edge.'
          : 'Voice recognition is not supported in this browser. Please use Chrome or Edge.';
      setSpeechError(errorMsg);
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setIsDropdownOpen(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        if (transcript) {
          setSearchQuery?.(transcript);
          setIsDropdownOpen(true);
        }

        if (event.results[0] && event.results[0].isFinal) {
          saveQueryToHistory(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          const errorText =
            language === 'ar'
              ? 'تأكد من السماح بالمايكروفون والمحاولة مرة أخرى.'
              : 'Please allow microphone access and try again.';
          setSpeechError(errorText);
          setTimeout(() => setSpeechError(null), 4000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setIsQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = searchQuery.trim().toLowerCase();

  // Helper functions for Advanced Search Filters
  const passesPriceFilter = (
    priceUSD?: number,
    priceSYP?: number,
    salaryUSD?: number,
    salarySYP?: number,
    estimatedCostSYP?: number
  ) => {
    const minP = searchMinPrice !== '' ? Number(searchMinPrice) : null;
    const maxP = searchMaxPrice !== '' ? Number(searchMaxPrice) : null;
    if (minP === null && maxP === null) return true;

    // Effective USD price calculation
    const itemUsd =
      priceUSD ??
      salaryUSD ??
      (priceSYP ? priceSYP / 15000 : salarySYP ? salarySYP / 15000 : estimatedCostSYP ? estimatedCostSYP / 15000 : 0);

    if (minP !== null && itemUsd < minP) return false;
    if (maxP !== null && itemUsd > maxP) return false;
    return true;
  };

  const passesCityFilter = (city?: string, fromCity?: string, area?: string) => {
    if (searchCity === 'all') return true;
    const target = searchCity.toLowerCase();
    const c1 = (city || '').toLowerCase();
    const c2 = (fromCity || '').toLowerCase();
    const a1 = (area || '').toLowerCase();
    return c1.includes(target) || c2.includes(target) || a1.includes(target);
  };

  const passesDateFilter = (dateInput?: string | Date | number) => {
    if (searchDateFilter === 'all') return true;
    if (!dateInput) return true;
    const time = new Date(dateInput).getTime();
    if (isNaN(time)) return true;

    const now = Date.now();
    const diffDays = (now - time) / (1000 * 60 * 60 * 24);

    if (searchDateFilter === 'today') return diffDays <= 1;
    if (searchDateFilter === 'week') return diffDays <= 7;
    if (searchDateFilter === 'month') return diffDays <= 30;
    return true;
  };

  const isSearchActive = q.length > 0 || activeSearchFiltersCount > 0;

  // Perform search across Car/Tools, Real Estate, Taxi, and Jobs with Advanced Filters
  const matchedCars = isSearchActive
    ? initialCarListings.filter(
        (c) =>
          (!q ||
            c.title.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            (c.make && c.make.toLowerCase().includes(q)) ||
            (c.model && c.model.toLowerCase().includes(q))) &&
          passesPriceFilter(c.priceUSD, c.priceSYP) &&
          passesCityFilter(c.city) &&
          passesDateFilter(c.createdAt)
      )
    : [];

  const matchedRealEstate = isSearchActive
    ? initialRealEstateListings.filter(
        (re) =>
          (!q ||
            re.title.toLowerCase().includes(q) ||
            re.city.toLowerCase().includes(q) ||
            re.area.toLowerCase().includes(q) ||
            (re.sellerName && re.sellerName.toLowerCase().includes(q))) &&
          passesPriceFilter(re.priceUSD, re.priceSYP) &&
          passesCityFilter(re.city, undefined, re.area) &&
          passesDateFilter(re.createdAt)
      )
    : [];

  const matchedTaxi = isSearchActive
    ? initialTaxiOrders.filter(
        (t) =>
          (!q ||
            t.fromCity.toLowerCase().includes(q) ||
            t.fromArea.toLowerCase().includes(q) ||
            t.toArea.toLowerCase().includes(q) ||
            t.customerName.toLowerCase().includes(q)) &&
          passesPriceFilter(undefined, undefined, undefined, undefined, t.estimatedCostSYP) &&
          passesCityFilter(undefined, t.fromCity, t.fromArea) &&
          passesDateFilter(t.createdAt)
      )
    : [];

  const matchedJobs = isSearchActive
    ? initialJobListings.filter(
        (j) =>
          (!q ||
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q) ||
            j.city.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q)) &&
          passesPriceFilter(j.salaryUSD, j.salarySYP) &&
          passesCityFilter(j.city) &&
          passesDateFilter(j.createdAt)
      )
    : [];

  const matchedPhones = isSearchActive
    ? BASE_MOBILE_PHONES.filter(
        (p) =>
          !q ||
          p.modelNameAr.toLowerCase().includes(q) ||
          p.modelNameEn.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.storage.toLowerCase().includes(q) ||
          p.warrantyAr.toLowerCase().includes(q)
      )
    : [];

  const totalMatches = matchedCars.length + matchedRealEstate.length + matchedTaxi.length + matchedJobs.length + matchedPhones.length;

  const allTabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'cars', label: language === 'ar' ? 'الإعلانات الشاملة' : 'Marketplace', icon: <Home className="w-4 h-4 text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" /> },
    { id: 'phones', label: language === 'ar' ? 'أسعار الهواتف (دقيقة بدقيقة)' : 'Phones & Tech', icon: <Smartphone className="w-4 h-4 text-indigo-300 drop-shadow-[0_0_6px_rgba(165,180,252,0.8)]" />, badge: language === 'ar' ? 'دقيقة بدقيقة 🔴' : 'Live 🔴' },
    { id: 'currency', label: t('tabCurrency'), icon: <TrendingUp className="w-4 h-4 text-cyan-300 drop-shadow-[0_0_6px_rgba(103,232,249,0.8)]" />, badge: language === 'ar' ? 'يومي حي' : 'Daily' },
    { id: 'news', label: language === 'ar' ? 'أخبار سانا الرسمية' : 'SANA News', icon: <Radio className="w-4 h-4 text-rose-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" />, badge: language === 'ar' ? 'ساعة بساعة' : 'Hourly' },
    { id: 'realestate', label: t('tabRealEstate'), icon: <Building className="w-4 h-4 text-sky-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]" /> },
    { id: 'jobs', label: language === 'ar' ? 'فرص العمل والخدمات' : 'Jobs & Services', icon: <Briefcase className="w-4 h-4 text-blue-300 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]" />, badge: language === 'ar' ? 'جديد 🔥' : 'New 🔥' },
    { id: 'saved', label: language === 'ar' ? 'المحفوظات' : 'Saved', icon: <Bookmark className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]" />, badge: bookmarksCount > 0 ? `${bookmarksCount}` : undefined },
    { id: 'taxidelivery', label: t('tabTaxiDelivery'), icon: <Truck className="w-4 h-4 text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]" /> },
    { id: 'embed', label: t('tabEmbed'), icon: <Globe className="w-4 h-4 text-teal-300 drop-shadow-[0_0_6px_rgba(94,234,212,0.8)]" />, badge: t('badgeLive') },
    { id: 'ledger', label: t('tabLedger'), icon: <BookOpen className="w-4 h-4 text-purple-300 drop-shadow-[0_0_6px_rgba(216,180,254,0.8)]" /> },
    { id: 'messages', label: t('tabMessages'), icon: <MessageSquare className="w-4 h-4 text-indigo-300 drop-shadow-[0_0_6px_rgba(165,180,252,0.8)]" /> },
  ];

  const tabs = appMode === 'essential'
    ? allTabs.filter((t) => ['cars', 'realestate', 'jobs', 'saved'].includes(t.id))
    : allTabs;

  const handleResultClick = (targetTab: TabType) => {
    if (searchQuery.trim()) {
      saveQueryToHistory(searchQuery);
    }
    setActiveTab(targetTab);
    setIsDropdownOpen(false);
  };

  return (
    <header className={`border-b text-slate-100 sticky top-0 z-50 shadow-xl backdrop-blur-md transition-colors duration-300 ${
      appMode === 'essential'
        ? 'bg-gradient-to-r from-slate-950 via-sky-950/90 to-slate-900 border-sky-800/40'
        : 'bg-gradient-to-r from-[#022c22] via-[#043427] to-[#021f18] border-emerald-800/50'
    }`}>
      {/* Decorative New Syrian Flag Stripe */}
      <div className="h-1.5 w-full grid grid-cols-3 relative overflow-hidden">
        <div className="bg-[#007A3D]" />
        <div className="bg-white flex items-center justify-center gap-1">
          <span className="text-[7px] text-red-600 leading-none">★</span>
          <span className="text-[7px] text-red-600 leading-none">★</span>
          <span className="text-[7px] text-red-600 leading-none">★</span>
        </div>
        <div className="bg-black" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand Logo - Returns Home */}
        <div
          onClick={() => {
            setActiveTab('cars');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center justify-center sm:justify-start gap-2.5 shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all w-full sm:w-auto text-center sm:text-right"
          title={language === 'ar' ? 'الرجوع إلى الشاشة الرئيسية' : 'Return to Home Screen'}
        >
          <OmsLogo size="md" showSubtitle={false} className="hover:scale-105 transition-transform" />
          <div className="block">
            <h1 className="text-base font-bold text-white tracking-wide leading-tight flex items-center justify-center sm:justify-start gap-1.5">
              <span>{t('appTitle')}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-mono">
                {t('officialLogo')}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">{t('appSubtitle')}</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full sm:flex-1 max-w-md mx-auto sm:mx-0">
          <div className="relative flex items-center">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-amber-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery?.(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  saveQueryToHistory(searchQuery);
                }
              }}
              placeholder={
                isListening
                  ? (language === 'ar' ? '🎙️ تحدث الآن، جاري الاستماع...' : '🎙️ Listening... speak now')
                  : (language === 'ar'
                    ? 'بحث مباشر بالاسم أو الصوت 🎙️...'
                    : 'Search by text or voice 🎙️...')
              }
              className={`w-full bg-slate-950 border ${
                isListening
                  ? 'border-rose-500 ring-2 ring-rose-500/40 text-amber-300'
                  : 'border-slate-700/80 hover:border-slate-600 focus:border-amber-500 text-slate-100'
              } rounded-xl pl-16 pr-9 py-1.5 text-xs placeholder-slate-400 focus:outline-none transition-all shadow-inner font-sans`}
            />

            {/* Left Controls inside input: Clear button, Voice Microphone button, QR Scanner & Filter toggle */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery?.('');
                    setIsDropdownOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                  title={language === 'ar' ? 'مسح النص' : 'Clear search'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Advanced Search Filters Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setShowSearchFilters(!showSearchFilters);
                  setIsDropdownOpen(true);
                }}
                title={language === 'ar' ? 'تصفية نتائج البحث حسب السعر، الموقع، والتاريخ' : 'Advanced Search Filters'}
                className={`p-1 px-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                  activeSearchFiltersCount > 0 || showSearchFilters
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                {activeSearchFiltersCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 px-1 py-0.2 rounded-full font-black text-[9px]">
                    {activeSearchFiltersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceSearch}
                title={
                  isListening
                    ? (language === 'ar' ? 'إيقاف البحث الصوتي 🛑' : 'Stop Voice Search 🛑')
                    : (language === 'ar' ? 'البحث الصوتي بالمايكروفون (Web Speech API) 🎙️' : 'Voice Search (Web Speech API) 🎙️')
                }
                className={`p-1 rounded-lg transition-all cursor-pointer flex items-center justify-center relative ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                  </>
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsQRScannerOpen(true)}
                title={language === 'ar' ? 'مسح رمز QR للكاميرا 📷' : 'Scan QR Code via Camera 📷'}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Voice Search Toast / Error banner */}
          {speechError && (
            <div className="absolute top-full right-0 left-0 mt-1.5 bg-rose-950 border border-rose-500/50 text-rose-200 p-2 rounded-xl text-[10px] font-bold z-50 flex items-center gap-1.5 shadow-xl animate-fadeIn">
              <Volume2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Autocomplete Search Dropdown & Advanced Filters */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto divide-y divide-slate-800 text-xs backdrop-blur-md dir-rtl">
              
              {/* Active Voice Search Animated Banner */}
              {isListening && (
                <div className="bg-gradient-to-r from-rose-950/90 via-slate-950 to-amber-950/90 p-2.5 border-b border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <span className="truncate">
                      {language === 'ar' ? 'جاري الاستماع لصوتك... قل اسم السيارة أو العقار أو الخدمة' : 'Listening to your voice... say a car, property, or service name'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleVoiceSearch}
                    className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 text-[10px] rounded-lg shrink-0 cursor-pointer"
                  >
                    {language === 'ar' ? 'إيقاف' : 'Stop'}
                  </button>
                </div>
              )}

              {/* Advanced Search Filter System Panel */}
              {(showSearchFilters || activeSearchFiltersCount > 0) && (
                <div className="p-3 bg-slate-950/90 border-b border-slate-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px]">
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span>{language === 'ar' ? 'فلترة نتائج البحث المتقدمة 🎛️' : 'Advanced Search Filters 🎛️'}</span>
                      {activeSearchFiltersCount > 0 && (
                        <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                          {activeSearchFiltersCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {activeSearchFiltersCount > 0 && (
                        <button
                          type="button"
                          onClick={resetSearchFilters}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowSearchFilters(false)}
                        className="text-slate-400 hover:text-white text-[10px] p-1 rounded-md hover:bg-slate-800 cursor-pointer"
                        title={language === 'ar' ? 'إغلاق لوحة الفلترة' : 'Close filters'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Filter 1: Price Range */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-bold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>{language === 'ar' ? 'نطاق السعر ($ USD المعادل):' : 'Price Range ($ USD):'}</span>
                      </span>
                      {(searchMinPrice || searchMaxPrice) && (
                        <span className="text-[10px] text-amber-400 font-mono">
                          ${searchMinPrice || '0'} - ${searchMaxPrice || '∞'}
                        </span>
                      )}
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={searchMinPrice}
                        onChange={(e) => setSearchMinPrice(e.target.value)}
                        placeholder={language === 'ar' ? 'السعر من ($)' : 'Min ($)'}
                        className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="number"
                        value={searchMaxPrice}
                        onChange={(e) => setSearchMaxPrice(e.target.value)}
                        placeholder={language === 'ar' ? 'السعر إلى ($)' : 'Max ($)'}
                        className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Quick Price Presets */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                      {[
                        { labelAr: 'الكل', labelEn: 'All', min: '', max: '' },
                        { labelAr: '< $1,000', labelEn: '< $1k', min: '0', max: '1000' },
                        { labelAr: '$1k - $10k', labelEn: '$1k - $10k', min: '1000', max: '10000' },
                        { labelAr: '> $10,000', labelEn: '> $10k', min: '10000', max: '' },
                      ].map((preset, idx) => {
                        const isActive = searchMinPrice === preset.min && searchMaxPrice === preset.max;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSearchMinPrice(preset.min);
                              setSearchMaxPrice(preset.max);
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer border ${
                              isActive
                                ? 'bg-amber-500 text-slate-950 font-black border-amber-300'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
                            }`}
                          >
                            {language === 'ar' ? preset.labelAr : preset.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filter 2: Location / City */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{language === 'ar' ? 'الموقع / المحافظة:' : 'Location / City:'}</span>
                    </label>

                    <select
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-[11px] text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="all">{language === 'ar' ? 'جميع المناطق والمحافظات 🌍' : 'All Locations'}</option>
                      <option value="دمشق">🏛️ دمشق</option>
                      <option value="ريف دمشق">🌳 ريف دمشق</option>
                      <option value="حلب">🏰 حلب</option>
                      <option value="حمص">🏙️ حمص</option>
                      <option value="اللاذقية">🏖️ اللاذقية</option>
                      <option value="طرطوس">⚓ طرطوس</option>
                      <option value="حماة">🌾 حماة</option>
                      <option value="الرياض">🇸🇦 الرياض</option>
                      <option value="دبي">🇦🇪 دبي</option>
                    </select>
                  </div>

                  {/* Filter 3: Date Published */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>{language === 'ar' ? 'تاريخ النشر والحداثة:' : 'Date Published:'}</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[10px]">
                      {[
                        { id: 'all', labelAr: 'كل الأوقات 📅', labelEn: 'All Time' },
                        { id: 'today', labelAr: 'اليوم (24س) ⚡', labelEn: 'Today' },
                        { id: 'week', labelAr: 'هذا الأسبوع 🚀', labelEn: 'This Week' },
                        { id: 'month', labelAr: 'هذا الشهر 🗓️', labelEn: 'This Month' },
                      ].map((opt) => {
                        const isActive = searchDateFilter === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSearchDateFilter(opt.id as any)}
                            className={`py-1 px-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                              isActive
                                ? 'bg-sky-600 text-white font-black border-sky-400'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
                            }`}
                          >
                            {language === 'ar' ? opt.labelAr : opt.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {q.length === 0 ? (
                /* Recent Search History (Last 5) & Popular Suggestions Panel */
                <div className="p-3 space-y-3.5">
                  {/* Search History - Last 5 searches */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <History className="w-4 h-4 text-amber-400" />
                        <span>{language === 'ar' ? 'سجل البحث الأخير (آخر 5 عمليات بحث):' : 'Recent Search History (Last 5):'}</span>
                        {searchHistory.length > 0 && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                            {searchHistory.length}/5
                          </span>
                        )}
                      </span>
                      {searchHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={clearSearchHistory}
                          className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-[10px] cursor-pointer bg-slate-800/60 hover:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-slate-700/50 hover:border-rose-500/30"
                          title={language === 'ar' ? 'مسح سجل البحث بالكامل' : 'Clear all search history'}
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>{language === 'ar' ? 'مسح السجل' : 'Clear All'}</span>
                        </button>
                      )}
                    </div>

                    {searchHistory.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {searchHistory.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSearchQuery?.(item);
                              saveQueryToHistory(item);
                            }}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/80 text-slate-200 text-xs cursor-pointer transition-all group shadow-xs"
                            title={language === 'ar' ? `البحث عن: ${item}` : `Search for: ${item}`}
                          >
                            <div className="flex items-center gap-2 truncate min-w-0">
                              <span className="w-5 h-5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                                {idx + 1}
                              </span>
                              <Clock className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                              <span className="font-semibold truncate text-slate-200 group-hover:text-amber-200">
                                {item}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-amber-400/0 group-hover:text-amber-400/80 transition-opacity font-bold hidden sm:inline">
                                {language === 'ar' ? 'بحث ↵' : 'Search ↵'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => removeHistoryItem(e, item)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title={language === 'ar' ? 'حذف من السجل' : 'Remove from history'}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-center text-slate-500 text-[11px]">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                        <span>{language === 'ar' ? 'لا يوجد عمليات بحث سابقة. ابحث عن أي منتج أو سيارة أو عقار ليتم حفظه تلقائياً هنا.' : 'No recent searches. Search for any item to automatically save it here.'}</span>
                      </div>
                    )}
                  </div>

                  {/* Popular Suggestions */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === 'ar' ? '🔥 الأكثر بحثاً وشهرة اليوم:' : '🔥 Popular Searches Today:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {[
                        { label: language === 'ar' ? 'هيونداي النترا' : 'Hyundai Elantra', query: 'النترا' },
                        { label: language === 'ar' ? 'شقق للآجار دمشق' : 'Damascus Apartments', query: 'دمشق' },
                        { label: language === 'ar' ? 'تكسي طارئ' : 'Emergency Taxi', query: 'تكسي' },
                        { label: language === 'ar' ? 'وظائف وسائقين' : 'Drivers & Jobs', query: 'سائق' },
                        { label: language === 'ar' ? 'آيفون وسامسونج' : 'iPhone & Samsung', query: 'سامسونج' },
                      ].map((tag, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSearchQuery?.(tag.query);
                            saveQueryToHistory(tag.query);
                          }}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition-all cursor-pointer font-medium hover:border-amber-400/60"
                        >
                          🔍 {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : totalMatches === 0 ? (
                <div className="p-4 text-center text-slate-400 space-y-3">
                  <div>
                    <p className="font-bold text-slate-300">
                      {language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results found'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {language === 'ar' ? `جرب البحث عن كلمة أخرى بدلاً من "${q}"` : `Try searching for something else`}
                    </p>
                  </div>

                  {searchHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-right">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10.5px] font-bold text-amber-400 flex items-center gap-1">
                          <History className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'الرجوع لعمليات البحث السابقة:' : 'Previous Searches:'}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {searchHistory.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSearchQuery?.(item);
                              saveQueryToHistory(item);
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-amber-300 text-[10.5px] cursor-pointer transition-all"
                          >
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="bg-slate-950 px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-800">
                    <span>{language === 'ar' ? `نتائج البحث المباشر (${totalMatches})` : `Live Search Results (${totalMatches})`}</span>
                    <span className="text-amber-400 font-mono text-[10px]">تحديث فوري</span>
                  </div>

                  {/* Quick Previous Searches Strip */}
                  {searchHistory.length > 0 && (
                    <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                      <span className="text-[10px] text-slate-500 font-bold shrink-0 flex items-center gap-1">
                        <History className="w-3 h-3 text-amber-400/80" />
                        <span>{language === 'ar' ? 'السجل:' : 'History:'}</span>
                      </span>
                      {searchHistory.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchQuery?.(item);
                            saveQueryToHistory(item);
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-[10px] whitespace-nowrap shrink-0 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Section 1: Cars & Tools */}
                  {matchedCars.length > 0 && (
                    <div className="p-2 space-y-1 bg-slate-900/40">
                      <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          <span>{language === 'ar' ? 'الأدوات والسيارات' : 'Cars & Tools'} ({matchedCars.length})</span>
                        </span>
                        <button
                          onClick={() => handleResultClick('cars')}
                          className="hover:underline text-slate-400"
                        >
                          {language === 'ar' ? 'عرض الكل' : 'View All'}
                        </button>
                      </div>

                      {matchedCars.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleResultClick('cars')}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-9 h-9 object-cover rounded-lg border border-slate-700 shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                                {item.title}
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                <span>{item.city}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-left shrink-0 font-mono">
                            <span className="text-emerald-400 font-bold block">${item.priceUSD}</span>
                            <span className="text-[9px] text-slate-400 block">{item.priceSYP.toLocaleString()} ل.س</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section 2: Real Estate */}
                  {matchedRealEstate.length > 0 && (
                    <div className="p-2 space-y-1 bg-slate-900/60">
                      <div className="px-2 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          <span>{language === 'ar' ? 'العقارات والشقق' : 'Real Estate'} ({matchedRealEstate.length})</span>
                        </span>
                        <button
                          onClick={() => handleResultClick('realestate')}
                          className="hover:underline text-slate-400"
                        >
                          {language === 'ar' ? 'عرض الكل' : 'View All'}
                        </button>
                      </div>

                      {matchedRealEstate.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleResultClick('realestate')}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-9 h-9 object-cover rounded-lg border border-slate-700 shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                                {item.title}
                              </p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                <span>{item.city} - {item.area}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-left shrink-0 font-mono">
                            <span className="text-amber-400 font-bold block">${item.priceUSD}</span>
                            <span className="text-[9px] text-slate-400 block">{item.priceSYP.toLocaleString()} ل.س</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section 3: Taxi & Delivery */}
                  {matchedTaxi.length > 0 && (
                    <div className="p-2 space-y-1 bg-slate-900/40">
                      <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          <span>{language === 'ar' ? 'التكسي والتوصيل' : 'Taxi & Delivery'} ({matchedTaxi.length})</span>
                        </span>
                        <button
                          onClick={() => handleResultClick('taxidelivery')}
                          className="hover:underline text-slate-400"
                        >
                          {language === 'ar' ? 'عرض الكل' : 'View All'}
                        </button>
                      </div>

                      {matchedTaxi.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleResultClick('taxidelivery')}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                        >
                          <div className="truncate">
                            <p className="font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                              {item.fromCity} ({item.fromArea}) ➔ {item.toArea}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.customerName} | {item.type === 'taxi' ? 'تكسي خاص' : 'توصيل طرد'}
                            </p>
                          </div>

                          <div className="text-left shrink-0 font-mono">
                            <span className="text-cyan-400 font-bold block">{item.estimatedCostSYP.toLocaleString()} ل.س</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section 4: Jobs */}
                  {matchedJobs.length > 0 && (
                    <div className="p-2 space-y-1 bg-slate-900/60">
                      <div className="px-2 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>{language === 'ar' ? 'فرص العمل والوظائف' : 'Jobs'} ({matchedJobs.length})</span>
                        </span>
                        <button
                          onClick={() => handleResultClick('jobs')}
                          className="hover:underline text-slate-400"
                        >
                          {language === 'ar' ? 'عرض الكل' : 'View All'}
                        </button>
                      </div>

                      {matchedJobs.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleResultClick('jobs')}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                        >
                          <div className="truncate">
                            <p className="font-bold text-slate-100 truncate group-hover:text-blue-300 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>{item.company}</span> • <span>{item.city}</span>
                            </p>
                          </div>

                          <div className="text-left shrink-0 font-mono">
                            <span className="text-emerald-400 font-bold block">{item.salarySYP.toLocaleString()} ل.س</span>
                            {item.salaryUSD && <span className="text-[9px] text-amber-400 block">${item.salaryUSD}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section 5: Mobile Phones & Tech Prices (Minute by Minute) */}
                  {matchedPhones.length > 0 && (
                    <div className="p-2 space-y-1 bg-slate-900/80 border-t border-slate-800">
                      <div className="px-2 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-indigo-400" />
                          <span>{language === 'ar' ? 'أسعار الهواتف والمنتجات (دقيقة بدقيقة)' : 'Phones & Tech Live'} ({matchedPhones.length})</span>
                        </span>
                        <button
                          onClick={() => handleResultClick('phones')}
                          className="hover:underline text-indigo-400 font-bold"
                        >
                          {language === 'ar' ? 'عرض الكل 📱' : 'View All'}
                        </button>
                      </div>

                      {matchedPhones.slice(0, 3).map((phone) => (
                        <div
                          key={phone.id}
                          onClick={() => handleResultClick('phones')}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={phone.image}
                              alt={phone.modelNameAr}
                              className="w-9 h-9 object-cover rounded-lg border border-slate-700 shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                                {language === 'ar' ? phone.modelNameAr : phone.modelNameEn}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {phone.brand} • {phone.storage} • {phone.ram}
                              </p>
                            </div>
                          </div>

                          <div className="text-left shrink-0 font-mono">
                            <span className="text-indigo-400 font-bold block">${phone.priceUSD}</span>
                            <span className="text-[9px] text-emerald-400 block">{phone.customsTier}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions, Settings & Quick Controls Hub */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto shrink-0">
          {/* Network Connection Quality Warning Indicator */}
          <NetworkQualityIndicator />

          {/* Consolidated Quick Controls Button (Theme, Language, Share, Integrations & App Mode) */}
          <div className="relative shrink-0" ref={quickMenuRef}>
            <button
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              title={
                language === 'ar'
                  ? 'خيارات القائمة السريعة (الثيم، اللغة، المشاركة، الربط البرمجي، النمط)'
                  : 'Quick Options Menu (Theme, Language, Share, Integrations, App Mode)'
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-amber-500/30 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="text-[10px] text-slate-500 font-normal">|</span>
                <Languages className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] text-slate-500 font-normal">|</span>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isQuickMenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </button>

            {/* Expanded Popover Window */}
            {isQuickMenuOpen && (
              <>
                {/* Mobile Backdrop Overlay */}
                <div
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs sm:hidden z-40"
                  onClick={() => setIsQuickMenuOpen(false)}
                />

                <div className="max-sm:fixed max-sm:top-24 max-sm:left-4 max-sm:right-4 max-sm:mx-auto max-sm:w-[calc(100vw-2rem)] max-sm:max-w-xs sm:absolute sm:top-full sm:left-0 sm:w-72 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 text-right dir-rtl space-y-2">
                  {/* Header */}
                  <div className="px-2 py-1 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'خيارات التحكم والتخصيص' : 'Quick Controls & Options'}</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                      5-in-1
                    </span>
                  </div>

                  {/* 1. Day / Night Switch */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 transition-all text-xs font-bold text-slate-200 cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-100">{language === 'ar' ? 'وضع الليل والنهار (الثيم)' : 'Day & Night Mode'}</p>
                        <p className="text-[10px] text-slate-400">
                          {isDark ? (language === 'ar' ? 'الوضع الليلي مفعل 🌙' : 'Dark Mode Active 🌙') : (language === 'ar' ? 'الوضع النهاري مفعل ☀️' : 'Light Mode Active ☀️')}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 px-2.5 py-1 rounded-lg text-amber-400 border border-slate-700 font-bold transition-colors">
                      {language === 'ar' ? 'تبديل' : 'Switch'}
                    </span>
                  </button>

                  {/* 2. Language Selector */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleLanguage();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 transition-all text-xs font-bold text-slate-200 cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                        <Languages className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-100">{language === 'ar' ? 'لغة الواجهة' : 'App Language'}</p>
                        <p className="text-[10px] text-slate-400">
                          {language === 'ar' ? 'العربية 🇸🇾 (انقر للتغيير)' : language === 'en' ? 'English 🇬🇧' : 'Deutsch 🇩🇪'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 group-hover:bg-sky-500 group-hover:text-slate-950 px-2.5 py-1 rounded-lg text-sky-400 border border-slate-700 font-bold transition-colors">
                      {language === 'ar' ? 'تغيير' : 'Change'}
                    </span>
                  </button>

                  {/* 3. Connected Integrations Suite */}
                  {onOpenIntegrations && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenIntegrations();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 transition-all text-xs font-bold text-slate-200 cursor-pointer group active:scale-98"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Zap className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-100">{language === 'ar' ? 'مركز الربط البرمجي (8/8)' : 'Integrations Center'}</p>
                          <p className="text-[10px] text-slate-400">{language === 'ar' ? 'ربط الخدمات والأدوات الخارجية' : 'Connect external services & APIs'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 px-2.5 py-1 rounded-lg text-emerald-400 border border-slate-700 font-bold transition-colors">
                        {language === 'ar' ? 'فتح' : 'Open'}
                      </span>
                    </button>
                  )}

                  {/* 4. Participation & Share */}
                  {onOpenShare && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenShare();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 transition-all text-xs font-bold text-slate-200 cursor-pointer group active:scale-98"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-100">{language === 'ar' ? 'المشاركة والانضمام' : 'Share & Participate'}</p>
                          <p className="text-[10px] text-slate-400">{language === 'ar' ? 'دعوة الأصلقاء ونشر المنصة' : 'Invite friends & share'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 px-2.5 py-1 rounded-lg text-emerald-400 border border-slate-700 font-bold transition-colors">
                        {language === 'ar' ? 'مشاركة' : 'Share'}
                      </span>
                    </button>
                  )}

                  {/* 5. App Mode Switcher */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      if (onOpenAppModeModal) {
                        onOpenAppModeModal();
                      } else {
                        toggleAppMode();
                      }
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 transition-all text-xs font-bold text-slate-200 cursor-pointer group active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${appMode === 'advanced' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-100">{language === 'ar' ? 'نمط العرض والتشغيل' : 'App Mode'}</p>
                        <p className="text-[10px] text-slate-400">
                          {appMode === 'essential' ? (language === 'ar' ? 'النمط البسيط ⚡️' : 'Simple Essential') : (language === 'ar' ? 'النمط المتقدم + AI 🚀' : 'Pro Advanced')}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 group-hover:bg-indigo-500 group-hover:text-slate-950 px-2.5 py-1 rounded-lg text-indigo-300 border border-slate-700 font-bold transition-colors">
                      {language === 'ar' ? 'ضبط' : 'Set'}
                    </span>
                  </button>
                  {/* 6. Install App on Mobile */}
                  {onOpenInstallGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenInstallGuide();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 transition-all text-xs font-bold text-slate-200 cursor-pointer group active:scale-98"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Download className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-300">{language === 'ar' ? 'تثبيت التطبيق على هاتفك' : 'Install App on Mobile'}</p>
                          <p className="text-[10px] text-slate-400">
                            {language === 'ar' ? 'إضافة للشاشة الرئيسية (Add to Home Screen) 📲' : 'Add to Home Screen 📲'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg font-black transition-colors shadow-sm">
                        {language === 'ar' ? 'تثبيت' : 'Install'}
                      </span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Install Guide Button in Header */}
          {onOpenInstallGuide && (
            <button
              onClick={onOpenInstallGuide}
              title={language === 'ar' ? 'تثبيت التطبيق على هاتفك مجاناً (Add to Home Screen)' : 'Install App to Home Screen'}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'ar' ? 'تثبيت التطبيق 📲' : 'Install App 📲'}</span>
            </button>
          )}

          {/* Saved Listings Quick Access Button with Badge */}
          <button
            onClick={() => setActiveTab('saved')}
            title={language === 'ar' ? `المحفوظات (${bookmarksCount})` : `Saved Items (${bookmarksCount})`}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 relative cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              {bookmarksCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-amber-500 text-slate-950 font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-slate-950 shadow-md animate-pulse">
                  {bookmarksCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">{language === 'ar' ? 'المحفوظات' : 'Saved'}</span>
          </button>

          {/* FCM Real-time Notifications Bell (Advanced mode only) */}
          {appMode === 'advanced' && onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              title={language === 'ar' ? 'التنبيهات الفورية والمشتركة (FCM)' : 'FCM Real-time Alerts'}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 relative cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">{language === 'ar' ? 'التنبيهات' : 'Alerts'}</span>
              {unreadNotificationsCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center -mr-1 animate-bounce shadow-md">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Admin Reports Button (Advanced mode only) */}
          {appMode === 'advanced' && (
            <button
              onClick={() => setIsAdminReportsOpen(true)}
              title={language === 'ar' ? 'مركز بلاغات الإدارة والتنبيهات' : 'Admin Reports Center'}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 relative cursor-pointer"
            >
              <ShieldAlert className={`w-4 h-4 ${autoAlerts.length > 0 ? 'text-red-400 animate-bounce' : 'text-red-400'}`} />
              <span className="hidden sm:inline">{language === 'ar' ? 'البلاغات' : 'Reports'}</span>
              {(unreadCount + autoAlerts.length) > 0 && (
                <span className="bg-red-500 text-white font-black text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center -mr-1 animate-pulse">
                  {unreadCount + autoAlerts.length}
                </span>
              )}
            </button>
          )}



          {/* Create Ad Button */}
          {onOpenCreateAd && (
            <button
              onClick={onOpenCreateAd}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'إنشاء إعلان' : 'Post Ad'}</span>
            </button>
          )}

          {/* Interactive Tour Guide Button */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              title={language === 'ar' ? 'دليل استخدام التطبيق (الجولة التعارفية)' : 'App Interactive Tour Guide'}
              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">{language === 'ar' ? 'دليل التطبيق' : 'Tour'}</span>
            </button>
          )}

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title={t('settings')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Button / Status */}
          <button
            onClick={onOpenProfile}
            title={t('userProfile')}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold relative overflow-visible ${effectiveLoggedIn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
              {effectiveLoggedIn && photoURL ? (
                <img src={photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              {effectiveLoggedIn && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-sm z-10"></span>
              )}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <span className="text-slate-400 block text-[10px] leading-none">
                {effectiveLoggedIn ? (language === 'ar' ? 'متصل أونلاين 🟢' : 'Online Active 🟢') : t('status')}
              </span>
              <span className={`font-mono font-medium leading-tight ${effectiveLoggedIn ? 'text-emerald-400' : 'text-red-400'}`}>
                {effectiveLoggedIn ? effectiveEmail : t('logout')}
              </span>
            </div>
          </button>

          {appMode === 'advanced' && (
            <a
              href="https://stellar-sawine-ae83b5.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/30 active:scale-95"
            >
              <span>{t('openNetlify')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Swipeable & Horizontally Scrollable Category Bar with Left/Right arrows & touch drag */}
      <SwipeableCategoryBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSubCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      {/* Admin Reports Modal */}
      <AdminReportsModal
        isOpen={isAdminReportsOpen}
        onClose={() => setIsAdminReportsOpen(false)}
      />

      {/* Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanResult={(text) => {
          setSearchQuery?.(text);
          saveQueryToHistory(text);
          setIsDropdownOpen(true);
        }}
      />
    </header>
  );
};

