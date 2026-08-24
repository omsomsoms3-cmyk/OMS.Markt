import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Newspaper,
  Radio,
  Clock,
  RefreshCw,
  Search,
  Zap,
  Building2,
  FileText,
  TrendingUp,
  Wrench,
  MapPin,
  Landmark,
  Award,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Eye,
  Calendar,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  Printer,
  Copy,
  Check,
  MoveHorizontal,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  LayoutGrid,
  List,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SyrianOfficialNewsItem } from '../types';
import {
  SYRIAN_NEWS_CATEGORIES,
  SYRIAN_GOVERNORATES,
} from '../data/syrianOfficialNewsData';
import {
  getHourlySyncStatus,
  getRefreshedOfficialNews,
  playNewsSpeech,
  stopNewsSpeech,
  HourlySyncStatus
} from '../lib/syrianNewsService';

interface SyrianOfficialNewsSectionProps {
  searchQuery?: string;
  onSelectTab?: (tab: any) => void;
}

export const SyrianOfficialNewsSection: React.FC<SyrianOfficialNewsSectionProps> = ({
  searchQuery = '',
  onSelectTab
}) => {
  const { language, isRtl } = useLanguage();
  const [news, setNews] = useState<SyrianOfficialNewsItem[]>(() => getRefreshedOfficialNews());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('الكل');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<SyrianOfficialNewsItem | null>(null);
  const [syncStatus, setSyncStatus] = useState<HourlySyncStatus>(() => getHourlySyncStatus());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'full'>('cards');
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleExpandArticle = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedArticles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oms_saved_sana_news');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Hourly Live Update Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncStatus(getHourlySyncStatus());
    }, 10000); // update clock and countdown every 10s

    return () => clearInterval(timer);
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopNewsSpeech();
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    stopNewsSpeech();
    setSpeakingId(null);
    setTimeout(() => {
      setNews(getRefreshedOfficialNews());
      setSyncStatus(getHourlySyncStatus());
      setIsRefreshing(false);
    }, 600);
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedNewsIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('oms_saved_sana_news', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSpeechToggle = (item: SyrianOfficialNewsItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (speakingId === item.id) {
      stopNewsSpeech();
      setSpeakingId(null);
    } else {
      const textToSpeak = `${item.titleAr}. ${item.summaryAr}`;
      setSpeakingId(item.id);
      const started = playNewsSpeech(textToSpeak, () => {
        setSpeakingId(null);
      });
      if (!started) {
        setSpeakingId(null);
      }
    }
  };

  const effectiveSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Category filter
      if (selectedCategory === 'breaking') {
        if (!item.isBreaking) return false;
      } else if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Governorate filter
      if (selectedGovernorate !== 'الكل' && item.governorate !== selectedGovernorate && item.governorate !== 'شامل سورية') {
        return false;
      }

      // Text search filter
      if (effectiveSearch) {
        const matchesTitle = item.titleAr.toLowerCase().includes(effectiveSearch) || item.titleEn.toLowerCase().includes(effectiveSearch);
        const matchesSummary = item.summaryAr.toLowerCase().includes(effectiveSearch) || item.summaryEn.toLowerCase().includes(effectiveSearch);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(effectiveSearch));
        const matchesGov = item.governorate.toLowerCase().includes(effectiveSearch);
        const matchesBulletin = item.bulletinNumber.toLowerCase().includes(effectiveSearch);
        if (!matchesTitle && !matchesSummary && !matchesTags && !matchesGov && !matchesBulletin) {
          return false;
        }
      }

      return true;
    });
  }, [news, selectedCategory, selectedGovernorate, effectiveSearch]);

  const breakingNewsList = useMemo(() => {
    return news.filter((n) => n.isBreaking);
  }, [news]);

  const featuredNews = useMemo(() => {
    return filteredNews.find((n) => n.isFeatured) || filteredNews[0];
  }, [filteredNews]);

  const nonFeaturedNews = useMemo(() => {
    if (!featuredNews) return filteredNews;
    return filteredNews.filter((n) => n.id !== featuredNews.id);
  }, [filteredNews, featuredNews]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'FileText': return <FileText className="w-4 h-4 text-sky-400" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-teal-400" />;
      case 'MapPin': return <MapPin className="w-4 h-4 text-rose-400" />;
      case 'Landmark': return <Landmark className="w-4 h-4 text-purple-400" />;
      case 'Award': return <Award className="w-4 h-4 text-yellow-400" />;
      default: return <Newspaper className="w-4 h-4 text-slate-300" />;
    }
  };

  const handleShare = async (article: SyrianOfficialNewsItem) => {
    const text = `${article.titleAr}\n${article.summaryAr}\nالمصدر: الوكالة العربية السورية للأنباء (سانا)\nعبر تطبيق OMS الأسواق السورية`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.titleAr,
          text,
          url: window.location.href,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {}
    }
  };

  // Active Article Index & Navigation
  const currentArticleIndex = useMemo(() => {
    if (!selectedArticle) return -1;
    return filteredNews.findIndex((item) => item.id === selectedArticle.id);
  }, [selectedArticle, filteredNews]);

  const goToNextArticle = useCallback(() => {
    if (filteredNews.length === 0) return;
    stopNewsSpeech();
    setSpeakingId(null);
    if (currentArticleIndex === -1) {
      setSelectedArticle(filteredNews[0]);
    } else {
      const nextIdx = (currentArticleIndex + 1) % filteredNews.length;
      setSelectedArticle(filteredNews[nextIdx]);
    }
  }, [currentArticleIndex, filteredNews]);

  const goToPrevArticle = useCallback(() => {
    if (filteredNews.length === 0) return;
    stopNewsSpeech();
    setSpeakingId(null);
    if (currentArticleIndex === -1) {
      setSelectedArticle(filteredNews[filteredNews.length - 1]);
    } else {
      const prevIdx = (currentArticleIndex - 1 + filteredNews.length) % filteredNews.length;
      setSelectedArticle(filteredNews[prevIdx]);
    }
  }, [currentArticleIndex, filteredNews]);

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
        goToPrevArticle();
      } else {
        goToNextArticle();
      }
    } else if (dragOffset < -55) {
      // Swiped left
      if (isRtl) {
        goToNextArticle();
      } else {
        goToPrevArticle();
      }
    }
    setDragOffset(0);
    dragStartXRef.current = null;
  };

  // Keyboard navigation when article is open
  useEffect(() => {
    if (!selectedArticle) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (isRtl) goToPrevArticle();
        else goToNextArticle();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) goToNextArticle();
        else goToPrevArticle();
      } else if (e.key === 'Escape') {
        stopNewsSpeech();
        setSpeakingId(null);
        setSelectedArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticle, goToNextArticle, goToPrevArticle, isRtl]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Official SANA Agency Master Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-2 text-slate-800/20 font-black text-7xl select-none pointer-events-none font-mono">
          SANA
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-600/20 text-red-400 rounded-2xl border border-red-500/40 shrink-0 shadow-lg shadow-red-500/10">
              <Radio className="w-7 h-7 animate-pulse text-red-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-red-500 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  {language === 'ar' ? 'الوكالة السورية الرسمية (سانا)' : 'Official Syrian News (SANA)'}
                </span>
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full border border-slate-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'ar' ? 'مصدر رسمي موثق حصرياً' : '100% Verified Official Source'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {language === 'ar'
                  ? 'أخبار الوكالة العربية السورية للأنباء (سانا) — نشرة حية ساعة بساعة'
                  : 'Syrian Arab News Agency (SANA) — Official Hourly News Wire'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ar'
                  ? 'متابعة رسمية ومباشرة لكافة المراسيم، القرارات الاقتصادية، مشاريع التنمية والمحافظات، والفعاليات الوطنية من المصدر الرسمي فقط.'
                  : 'Direct official feed of decrees, economic bulletins, governorate projects, and national developments exclusively from SANA.'}
              </p>
            </div>
          </div>

          {/* Real-time Hourly Synchronizer Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 w-full md:w-auto shrink-0 shadow-xl flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <Clock className="w-4 h-4 animate-spin text-emerald-400" />
                <span className="font-mono">{syncStatus.currentDamascusTime}</span>
                <span className="text-[10px] text-slate-400 font-normal">({language === 'ar' ? 'توقيت دمشق' : 'Damascus'})</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {language === 'ar' ? 'التحديث القادم بعد:' : 'Next hourly sync:'}{' '}
                <span className="text-amber-400 font-mono font-bold">{syncStatus.nextUpdateInMinutes} {language === 'ar' ? 'دقيقة' : 'min'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-600/20 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? (language === 'ar' ? 'جاري الجلب...' : 'Syncing...') : (language === 'ar' ? 'تحديث النشرة فوراً' : 'Sync Live Wire')}</span>
            </button>
          </div>
        </div>

        {/* Breaking News Marquee Ticker */}
        {breakingNewsList.length > 0 && (
          <div className="mt-4 pt-3 border-t border-red-500/20 flex items-center gap-2 overflow-hidden bg-slate-950/60 p-2 rounded-xl">
            <div className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>{language === 'ar' ? 'عاجل سانا' : 'BREAKING'}</span>
            </div>
            <div className="flex-1 overflow-x-auto scrollbar-none whitespace-nowrap text-xs text-slate-200">
              <div className="inline-flex items-center gap-6">
                {breakingNewsList.map((item) => (
                  <span
                    key={item.id}
                    onClick={() => setSelectedArticle(item)}
                    className="hover:text-amber-300 transition-colors cursor-pointer font-bold inline-flex items-center gap-1.5"
                  >
                    <span>⚡️ {item.titleAr}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.relativeTimeAr})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search, Filter Toolbar & Governorate Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث في البرقيات والقرارات وأخبار المحافظات...' : 'Search official SANA dispatches...'}
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-red-500 text-white text-xs rounded-xl pr-9 pl-4 py-2.5 outline-none transition-all placeholder:text-slate-500"
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

          {/* Governorate Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'ar' ? 'المحافظة:' : 'Governorate:'}</span>
            </span>
            <select
              value={selectedGovernorate}
              onChange={(e) => setSelectedGovernorate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-red-500 cursor-pointer w-full md:w-auto font-bold"
            >
              {SYRIAN_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Horizontal Pills & View Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {SYRIAN_NEWS_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-red-600 text-white border-red-400 shadow-md font-black'
                      : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{getCategoryIcon(cat.icon)}</span>
                  <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle: Cards vs Full Posts Stream */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={language === 'ar' ? 'عرض بطاقات مدمجة' : 'Card View'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'بطاقات' : 'Cards'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('full')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'full'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={language === 'ar' ? 'عرض المقالات كاملة مباشرة بدون اختصار' : 'Full Posts Stream'}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'منشورات كاملة 📖' : 'Full Stream'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main News Layout */}
      {filteredNews.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Newspaper className="w-7 h-7" />
          </div>
          <h4 className="text-white font-bold text-base">
            {language === 'ar' ? 'لا توجد برقيات إخبارية مطابقة للبحث' : 'No news found matching your criteria'}
          </h4>
          <p className="text-xs text-slate-400">
            {language === 'ar' ? 'جرب تغيير خيار المحافظة أو اختيار قسم آخر من شريط الأقسام أعلاه' : 'Try searching another governorate or clearing filters.'}
          </p>
        </div>
      ) : viewMode === 'full' ? (
        /* Full Post Direct Stream - Complete Article Text Directly on Mobile Page Without Cutoff */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <BookOpen className="w-4 h-4 text-red-400" />
              <span>{language === 'ar' ? 'نمط قراءة المنشورات الكاملة: الأخبار معروضة بالنص الكامل' : 'Full Articles Mode: All dispatches rendered completely'}</span>
            </div>
            <span className="text-amber-400 font-mono font-bold text-[11px]">
              {filteredNews.length} {language === 'ar' ? 'خبر' : 'items'}
            </span>
          </div>

          <div className="space-y-6">
            {filteredNews.map((item) => {
              const isSaved = savedNewsIds.includes(item.id);
              const isSpeaking = speakingId === item.id;

              return (
                <article
                  key={item.id}
                  className="bg-slate-900/95 border border-slate-800 hover:border-red-500/40 rounded-3xl overflow-hidden shadow-xl transition-all"
                >
                  {/* Article Media Header */}
                  <div className="relative h-48 sm:h-72 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.titleAr}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/50" />

                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                        {item.source}
                      </span>
                      {item.isBreaking && (
                        <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                          عاجل ⚡️
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200">
                      <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700 font-bold text-amber-300">
                        📍 {item.governorate} • {item.categoryAr}
                      </span>
                      <span className="bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-700 font-mono text-slate-300 text-[11px]">
                        {item.bulletinNumber}
                      </span>
                    </div>
                  </div>

                  {/* Article Full Body */}
                  <div className="p-5 sm:p-7 space-y-4">
                    {/* Header bar: relative time & speech */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.relativeTimeAr}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleSpeechToggle(item, e)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSpeaking
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          }`}
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeaking ? (language === 'ar' ? 'إيقاف الصوت' : 'Stop') : (language === 'ar' ? 'استماع' : 'Listen')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(item.id, e)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title={language === 'ar' ? 'حفظ' : 'Bookmark'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(item)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                          title={language === 'ar' ? 'مشاركة' : 'Share'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                      {item.titleAr}
                    </h3>

                    {/* Summary Highlight */}
                    <div className="bg-red-950/25 border border-red-500/30 p-4 rounded-2xl text-slate-200 text-xs sm:text-sm font-semibold leading-relaxed">
                      {item.summaryAr}
                    </div>

                    {/* Full Dispatch Content (Entire Uncut Text) */}
                    <div className="text-slate-200 text-sm sm:text-base leading-loose whitespace-pre-line pt-2">
                      {item.contentAr}
                    </div>

                    {/* Official Stamp & Link */}
                    <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-slate-300 font-bold">
                          {language === 'ar' ? 'برقية موثقة من وكالة سانا الرسمية' : 'Verified SANA Dispatch'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedArticle(item)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'فتح في عارض مكبّر' : 'Open Reader'}</span>
                        </button>

                        <a
                          href={item.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1"
                        >
                          <span>sana.sy</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        /* Compact Cards Layout with Expandable In-Place Full Post & Reader Modal */
        <div className="space-y-6">
          {/* Featured Hero Article */}
          {featuredNews && selectedCategory === 'all' && !effectiveSearch && (
            <div className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 rounded-3xl overflow-hidden shadow-2xl transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div
                  onClick={() => setSelectedArticle(featuredNews)}
                  className="lg:col-span-7 h-56 sm:h-72 lg:h-auto min-h-[220px] relative overflow-hidden bg-slate-950 cursor-pointer group"
                >
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.titleAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40 lg:hidden" />
                  {featuredNews.isBreaking && (
                    <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      {language === 'ar' ? 'عاجل سانا ⚡️' : 'Breaking'}
                    </span>
                  )}
                  <span className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-xl border border-slate-700">
                    📍 {featuredNews.governorate}
                  </span>
                </div>

                <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                        {featuredNews.categoryAr}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {featuredNews.bulletinNumber}
                      </span>
                    </div>

                    <h3
                      onClick={() => setSelectedArticle(featuredNews)}
                      className="text-xl sm:text-2xl font-black text-white hover:text-red-400 transition-colors leading-snug cursor-pointer"
                    >
                      {featuredNews.titleAr}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {featuredNews.summaryAr}
                    </p>
                  </div>

                  {/* Inline Expanded Content */}
                  {expandedArticles[featuredNews.id] && (
                    <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                      <div className="text-xs sm:text-sm text-slate-200 leading-loose whitespace-pre-line bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                        {featuredNews.contentAr}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleSpeechToggle(featuredNews, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          speakingId === featuredNews.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                        title={language === 'ar' ? 'استمع للخبر صوتياً' : 'Listen'}
                      >
                        {speakingId === featuredNews.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(featuredNews.id, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          savedNewsIds.includes(featuredNews.id)
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title={language === 'ar' ? 'حفظ في المفضلة' : 'Bookmark'}
                      >
                        <Bookmark className={`w-4 h-4 ${savedNewsIds.includes(featuredNews.id) ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleExpandArticle(featuredNews.id, e)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <span>{expandedArticles[featuredNews.id] ? (language === 'ar' ? 'طي النص' : 'Collapse') : (language === 'ar' ? 'قراءة الخبر كاملاً 📖' : 'Read Full')}</span>
                        {expandedArticles[featuredNews.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedArticle(featuredNews)}
                      className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'فتح العارض' : 'Open'}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Other Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(selectedCategory === 'all' && !effectiveSearch ? nonFeaturedNews : filteredNews).map((item) => {
              const isSaved = savedNewsIds.includes(item.id);
              const isSpeaking = speakingId === item.id;
              const isExpanded = expandedArticles[item.id];

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-red-500/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-red-500/10 transition-all flex flex-col justify-between"
                >
                  <div
                    onClick={() => setSelectedArticle(item)}
                    className="relative h-44 w-full bg-slate-950 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={item.image}
                      alt={item.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className="bg-slate-950/80 backdrop-blur-xs text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                        {item.categoryAr}
                      </span>
                      {item.isBreaking && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md animate-pulse">
                          عاجل ⚡️
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-2 right-2 text-[10px] bg-slate-950/80 text-amber-300 px-2 py-0.5 rounded font-bold border border-slate-800">
                      📍 {item.governorate}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{item.bulletinNumber}</span>
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <Eye className="w-3 h-3" />
                          <span>{item.viewsCount.toLocaleString()}</span>
                        </span>
                      </div>

                      <h4
                        onClick={() => setSelectedArticle(item)}
                        className="text-sm font-extrabold text-white hover:text-red-400 transition-colors leading-snug cursor-pointer"
                      >
                        {item.titleAr}
                      </h4>

                      {/* Summary or Full Content if Expanded */}
                      {isExpanded ? (
                        <div className="space-y-2 pt-1 animate-fadeIn">
                          <p className="text-xs text-amber-300/90 font-medium bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                            {item.summaryAr}
                          </p>
                          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/90 p-3 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                            {item.contentAr}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.summaryAr}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleSpeechToggle(item, e)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSpeaking
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title={language === 'ar' ? 'استمع صوتياً' : 'Listen'}
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(item.id, e)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title={language === 'ar' ? 'حفظ' : 'Bookmark'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleExpandArticle(item.id, e)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <span>{isExpanded ? (language === 'ar' ? 'طي' : 'Less') : (language === 'ar' ? 'قراءة الخبر كاملاً' : 'Full Text')}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedArticle(item)}
                        className="text-red-400 hover:text-red-300 font-mono text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{language === 'ar' ? 'عارض ↗' : 'View ↗'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Official Article Reader Modal with Responsive Centered Fit, Fullscreen, Drag & Swipe, and Side Navigation */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopNewsSpeech();
              setSpeakingId(null);
              setSelectedArticle(null);
              setIsFullscreen(false);
            }
          }}
        >
          {/* Floating Left Navigation Button (Desktop) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isRtl) goToNextArticle();
              else goToPrevArticle();
            }}
            aria-label="Previous / Next Article"
            title={language === 'ar' ? 'الخبر التالي (سهم يسار)' : 'Next Article'}
            className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-red-600 text-white border border-slate-700 hover:border-red-500 shadow-2xl items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Floating Right Navigation Button (Desktop) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isRtl) goToPrevArticle();
              else goToNextArticle();
            }}
            aria-label="Next / Previous Article"
            title={language === 'ar' ? 'الخبر السابق (سهم يمين)' : 'Previous Article'}
            className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-red-600 text-white border border-slate-700 hover:border-red-500 shadow-2xl items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
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
            className={`relative bg-slate-900 border border-slate-700 shadow-2xl animate-fadeIn flex flex-col mx-auto select-none ${
              isFullscreen
                ? 'w-full h-full max-h-screen rounded-none fixed inset-0 z-50'
                : 'rounded-3xl max-w-2xl w-full my-auto max-h-[94vh] sm:max-h-[90vh] overflow-hidden'
            }`}
          >
            {/* Top Drag & Swipe Interactive Banner */}
            <div className="bg-slate-950/95 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <MoveHorizontal className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {language === 'ar' ? 'اسحب للتنقل بين الأخبار' : 'Swipe left/right to browse'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Fullscreen toggle button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 rounded-md text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
                  title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Counter Indicator */}
                <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono text-[11px] font-bold text-slate-300">
                  <span>{currentArticleIndex >= 0 ? currentArticleIndex + 1 : 1}</span>
                  <span className="text-slate-500">/</span>
                  <span>{filteredNews.length}</span>
                </div>
              </div>
            </div>

            {/* Header image & modal close */}
            <div className="relative h-36 sm:h-48 md:h-56 w-full bg-slate-950 shrink-0">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.titleAr}
                className="w-full h-full object-cover pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/70 pointer-events-none" />
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopNewsSpeech();
                  setSpeakingId(null);
                  setSelectedArticle(null);
                  setIsFullscreen(false);
                }}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 transition-all cursor-pointer shadow-lg z-20"
              >
                ✕
              </button>

              <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                <span className="bg-red-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg">
                  {selectedArticle.source}
                </span>
                {selectedArticle.isBreaking && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow-lg">
                    عاجل ⚡️
                  </span>
                )}
              </div>

              <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-xs text-slate-200 pointer-events-none">
                <span className="bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-slate-700 font-bold text-[11px] text-amber-300">
                  📍 {selectedArticle.governorate} • {selectedArticle.categoryAr}
                </span>
                <span className="font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-lg text-[10px]">
                  {selectedArticle.bulletinNumber}
                </span>
              </div>
            </div>

            {/* Modal Body with Full Complete News Text */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 select-text overscroll-contain">
              {/* Controls bar: Font resize, Speech, Share */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">{language === 'ar' ? 'حجم الخط:' : 'Font:'}</span>
                  <button
                    type="button"
                    onClick={() => setFontSize('normal')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSize === 'normal' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSize === 'large' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('xlarge')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${fontSize === 'xlarge' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    A++
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeechToggle(selectedArticle)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      speakingId === selectedArticle.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {speakingId === selectedArticle.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{speakingId === selectedArticle.id ? (language === 'ar' ? 'إيقاف' : 'Stop') : (language === 'ar' ? 'استماع للخبر' : 'Listen')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(selectedArticle)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'مشاركة' : 'Share')}</span>
                  </button>
                </div>
              </div>

              {/* Title & Timing */}
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-snug">
                  {selectedArticle.titleAr}
                </h3>
                <p className="text-xs text-red-400 font-mono mt-1 flex items-center gap-1">
                  <span>{selectedArticle.source}</span> • <span>{selectedArticle.relativeTimeAr}</span>
                </p>
              </div>

              {/* Summary Highlight Box */}
              <div className="bg-red-950/30 border border-red-500/30 p-3.5 sm:p-4 rounded-2xl text-slate-200 text-xs sm:text-sm font-semibold leading-relaxed">
                {selectedArticle.summaryAr}
              </div>

              {/* Full Dispatch Content (Entire post text fully rendered without truncation) */}
              <div
                className={`text-slate-200 leading-loose whitespace-pre-line ${
                  fontSize === 'xlarge' ? 'text-base sm:text-lg' : fontSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                }`}
              >
                {selectedArticle.contentAr}
              </div>

              {/* Official Seal and Verification Stamp */}
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-extrabold text-white block">
                      {language === 'ar' ? 'توثيق الوكالة العربية السورية للأنباء (سانا)' : 'Official SANA Agency Stamp'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {language === 'ar' ? 'تم التحقق من البرقية الرسمية ونشرها وفق الأصول الصحفية' : 'Verified official dispatch'}
                    </span>
                  </div>
                </div>

                <a
                  href={selectedArticle.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 flex items-center gap-1 shrink-0"
                >
                  <span>sana.sy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {selectedArticle.tags.map((tag, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer with Mobile Quick Next/Prev & Close */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={goToPrevArticle}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'السابق' : 'Prev'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopNewsSpeech();
                  setSpeakingId(null);
                  setSelectedArticle(null);
                  setIsFullscreen(false);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-600/20 cursor-pointer text-center"
              >
                {language === 'ar' ? 'إغلاق الخبر' : 'Close Article'}
              </button>

              <button
                type="button"
                onClick={goToNextArticle}
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
