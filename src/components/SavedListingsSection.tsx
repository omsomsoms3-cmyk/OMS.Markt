import React, { useState } from 'react';
import { useBookmarks } from '../context/BookmarkContext';
import { useLanguage } from '../context/LanguageContext';
import { SavedListingItem } from '../types';
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  Search,
  ExternalLink,
  Phone,
  Share2,
  Car,
  Home,
  Briefcase,
  Truck,
  MapPin,
  DollarSign,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  X,
  CheckSquare,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Mic,
  MicOff,
  Volume2,
  Smartphone,
  ShoppingBag
} from 'lucide-react';
import { shareListingItem } from '../lib/share';
import { broadcastNotification } from '../lib/messaging';
import { QuickShareButtons } from './QuickShareButtons';
import { exportBookmarksToCSV } from '../lib/exportCSV';
import { LazyImage } from './LazyImage';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';

export const SavedListingsSection: React.FC = () => {
  const { bookmarks, removeBookmark, clearAllBookmarks, confirmBookmark, unconfirmBookmark } = useBookmarks();
  const { language, isRtl } = useLanguage();

  const [filterType, setFilterType] = useState<'all' | 'car' | 'realestate' | 'job' | 'taxi' | 'news' | 'phone' | 'goods'>('all');
  const [confirmationFilter, setConfirmationFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(language === 'ar' ? 'التعرف الصوتي غير مدعوم في هذا المتصفح' : 'Voice search is not supported');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        if (transcript) setSearch(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Confirmation Modal State
  const [confirmingItemId, setConfirmingItemId] = useState<string | null>(null);
  const [confirmNotes, setConfirmNotes] = useState<string>('');

  const handleShare = async (item: any) => {
    const res = await shareListingItem({
      title: item.title,
      text: `${item.subtitle} | OMS Saved Listing`,
      url: window.location.href,
    });
    if (res.success && res.method === 'clipboard') {
      alert(language === 'ar' ? 'تم نسخ الرابط والمعلومات للحافظة 📋' : 'Listing copied to clipboard!');
    }
  };

  const handleOpenConfirmModal = (itemId: string, existingNotes?: string) => {
    setConfirmingItemId(itemId);
    setConfirmNotes(existingNotes || '');
  };

  const handleExecuteConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingItemId) return;

    confirmBookmark(confirmingItemId, confirmNotes.trim());

    const item = bookmarks.find((b) => b.id === confirmingItemId);
    broadcastNotification({
      title: language === 'ar' ? 'تم تأكيد الإعلان المحفوظ في المفضلة! ✅' : 'Bookmark Confirmed! ✅',
      body: language === 'ar'
        ? `قام المستخدم بتأكيد الإعلان: "${item?.title || ''}". يمكنك العودة إليه لاحقاً.`
        : `Confirmed bookmark: "${item?.title || ''}". You can re-access it anytime.`,
      category: 'system',
      type: 'system'
    });

    setConfirmingItemId(null);
    setConfirmNotes('');
  };

  const filteredBookmarks = bookmarks.filter((item) => {
    const matchesType = filterType === 'all' || item.itemType === filterType;
    const matchesConfirmation =
      confirmationFilter === 'all' ||
      (confirmationFilter === 'confirmed' && item.confirmed) ||
      (confirmationFilter === 'pending' && !item.confirmed);
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      item.city.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesConfirmation && matchesSearch;
  });

  const {
    displayedItems,
    visibleCount,
    hasMore,
    isLoadingMore,
    loadMore,
    observerTargetRef,
    totalCount,
  } = useInfiniteScroll<SavedListingItem>(filteredBookmarks, {
    initialCount: 12,
    step: 12,
    dependencies: [filterType, confirmationFilter, search],
  });

  const getItemTypeBadge = (type: string) => {
    switch (type) {
      case 'car':
        return {
          label: language === 'ar' ? 'سوق / سيارات' : 'Cars / Market',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: <Car className="w-3.5 h-3.5" />,
        };
      case 'realestate':
        return {
          label: language === 'ar' ? 'عقارات' : 'Real Estate',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Home className="w-3.5 h-3.5" />,
        };
      case 'job':
        return {
          label: language === 'ar' ? 'وظائف' : 'Jobs',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Briefcase className="w-3.5 h-3.5" />,
        };
      case 'taxi':
        return {
          label: language === 'ar' ? 'تكسي وتوصيل' : 'Taxi & Delivery',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <Truck className="w-3.5 h-3.5" />,
        };
      case 'news':
        return {
          label: language === 'ar' ? 'أخبار رسمية' : 'Official News',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: <FileText className="w-3.5 h-3.5" />,
        };
      case 'phone':
        return {
          label: language === 'ar' ? 'هواتف وأسعار' : 'Phones & Tech',
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: <Smartphone className="w-3.5 h-3.5" />,
        };
      case 'goods':
        return {
          label: language === 'ar' ? 'سلع ومنتجات' : 'Syrian Goods',
          color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          icon: <ShoppingBag className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: language === 'ar' ? 'إعلان' : 'Listing',
          color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          icon: <Bookmark className="w-3.5 h-3.5" />,
        };
    }
  };

  const activeItemToConfirm = bookmarks.find((b) => b.id === confirmingItemId);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
              <BookmarkCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'المفضلة وقائمة التأكيد اللاحق' : 'Saved Bookmarks & Confirmation'}</span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>{language === 'ar' ? 'الإعلانات والفرص المحفوظة' : 'Saved Listings & Opportunities'}</span>
              <span className="text-sm px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded-full font-bold">
                {bookmarks.length}
              </span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl flex items-center gap-1.5 flex-wrap">
              <span>
                {language === 'ar'
                  ? 'تصلك كافة الإعلانات التي قمت بحفظها في المفضلة، ويمكنك تأكيد أي إعلان ومراجعة تفاصيله في وقت لاحق.'
                  : 'Save listings to your favorites list and confirm them whenever you are ready.'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {language === 'ar' ? 'حفظ تلقائي محلي (LocalStorage) + سحابي' : 'Auto LocalStorage + Cloud Sync'}
              </span>
            </p>
          </div>

          {bookmarks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => exportBookmarksToCSV(filteredBookmarks.length > 0 ? filteredBookmarks : bookmarks)}
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/40"
                title={language === 'ar' ? 'تصدير المحفوظات إلى ملف Excel / CSV' : 'Export saved listings to CSV'}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'تصدير CSV / Excel 📊' : 'Export CSV 📊'}</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(language === 'ar' ? 'هل أنت تأكد من مسح جميع المحفوظات؟' : 'Are you sure you want to clear all saved bookmarks?')) {
                    clearAllBookmarks();
                  }
                }}
                className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'إفراغ قائمة المفضلة' : 'Clear All Saved'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Category Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {[
            { id: 'all', label: language === 'ar' ? 'الكل' : 'All', count: bookmarks.length },
            { id: 'car', label: language === 'ar' ? 'سيارات وسوق' : 'Cars & Market', count: bookmarks.filter(b => b.itemType === 'car').length },
            { id: 'realestate', label: language === 'ar' ? 'عقارات' : 'Real Estate', count: bookmarks.filter(b => b.itemType === 'realestate').length },
            { id: 'job', label: language === 'ar' ? 'وظائف' : 'Jobs', count: bookmarks.filter(b => b.itemType === 'job').length },
            { id: 'taxi', label: language === 'ar' ? 'تكسي وتوصيل' : 'Taxi', count: bookmarks.filter(b => b.itemType === 'taxi').length },
            { id: 'news', label: language === 'ar' ? 'أخبار رسمية' : 'News', count: bookmarks.filter(b => b.itemType === 'news').length },
            { id: 'phone', label: language === 'ar' ? 'هواتف وأسعار' : 'Phones', count: bookmarks.filter(b => b.itemType === 'phone').length },
            { id: 'goods', label: language === 'ar' ? 'سلع ومنتجات' : 'Goods', count: bookmarks.filter(b => b.itemType === 'goods').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterType === tab.id ? 'bg-slate-950 text-amber-300' : 'bg-slate-900 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Status Confirmation Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setConfirmationFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              confirmationFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'جميع المحفوظات' : 'All Status'}
          </button>
          <button
            onClick={() => setConfirmationFilter('confirmed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              confirmationFilter === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ar' ? 'مُؤَكَّدة ✅' : 'Confirmed'}</span>
          </button>
          <button
            onClick={() => setConfirmationFilter('pending')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              confirmationFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'بانتظار التأكيد 📌' : 'Pending Confirmation'}</span>
          </button>
        </div>

        {/* Search input with microphone voice search */}
        <div className="relative w-full lg:w-60">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isListening
                ? (language === 'ar' ? '🎙️ تحدث الآن...' : '🎙️ Listening...')
                : (language === 'ar' ? 'بحث بالمفضلات أو الصوت 🎙️...' : 'Search bookmarks or voice 🎙️...')
            }
            className={`w-full bg-slate-950 border ${
              isListening ? 'border-rose-500 ring-2 ring-rose-500/40 text-amber-300' : 'border-slate-700'
            } rounded-xl pl-9 pr-9 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors`}
          />
          <button
            type="button"
            onClick={handleToggleVoice}
            title={language === 'ar' ? 'البحث الصوتي بالمايكروفون 🎙️' : 'Voice Search 🎙️'}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 p-1 rounded-md transition-colors cursor-pointer"
          >
            {isListening ? (
              <Mic className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Bookmarks Grid / Empty State */}
      {filteredBookmarks.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
            <Bookmark className="w-8 h-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              {language === 'ar' ? 'لا توجد إعلانات محفوظة في القائمة' : 'No saved listings found'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'يمكنك ضغط رمز الإشارة المرجعية 🔖 على أي إعلان لحفظه في مفضلتك وتأكيده لاحقاً بسهولة.'
                : 'Bookmark any listing across the marketplace to confirm it later at your convenience.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedItems.map((item) => {
            const badge = getItemTypeBadge(item.itemType);
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col justify-between ${
                  item.confirmed
                    ? 'border-emerald-500/50 shadow-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div>
                  {/* Card Header & Badge */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${badge.color}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      {item.confirmed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 animate-fadeIn">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{language === 'ar' ? 'مُؤَكَّد ✅' : 'Confirmed'}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeBookmark(item.id)}
                      className="p-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-lg transition-all cursor-pointer"
                      title={language === 'ar' ? 'إزالة من المفضلة' : 'Remove bookmark'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    {item.image && (
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                        <LazyImage
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-medium">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{item.city}</span>
                      </span>

                      {item.priceSYP && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <span>{item.priceSYP.toLocaleString()} ل.س</span>
                        </span>
                      )}

                      {item.priceUSD && (
                        <span className="inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <span>${item.priceUSD.toLocaleString()}</span>
                        </span>
                      )}
                    </div>

                    {/* Confirmation Status Details */}
                    {item.confirmed ? (
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-emerald-300 font-bold text-[11px]">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{language === 'ar' ? 'تم تأكيد الإعلان لاحقاً' : 'Confirmed at later time'}</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{item.confirmedAt}</span>
                        </div>
                        {item.confirmationNotes && (
                          <p className="text-[11px] text-slate-300 italic bg-slate-950/60 p-2 rounded-lg border border-emerald-500/20">
                            "{item.confirmationNotes}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'ar' ? 'بانتظار التأكيد لاحقاً' : 'Awaiting confirmation'}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">{item.savedAt}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`tel:${item.phone}`}
                      className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{item.phone}</span>
                    </a>

                    <button
                      onClick={() => handleShare(item)}
                      className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded-xl transition-all cursor-pointer border border-slate-700"
                      title={language === 'ar' ? 'مشاركة الإعلان' : 'Share Listing'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Confirmation Action Button */}
                  {item.confirmed ? (
                    <button
                      onClick={() => unconfirmBookmark(item.id)}
                      className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <span>{language === 'ar' ? 'إلغاء التأكيد 🔄' : 'Unconfirm Listing 🔄'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenConfirmModal(item.id, item.confirmationNotes)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تأكيد الإعلان الآن 📌' : 'Confirm Listing Now 📌'}</span>
                    </button>
                  )}

                  {/* Quick Social Share Buttons (WhatsApp / Telegram) */}
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-[10px] font-bold text-slate-400">
                      {language === 'ar' ? 'مشاركة المحفوظ:' : 'Share Saved:'}
                    </span>
                    <QuickShareButtons
                      title={item.title}
                      text={`${item.subtitle} | OMS Saved Item`}
                      url={window.location.href}
                    />
                  </div>
                </div>
              </div>
            );

          })}
        </div>
      )}

      {/* Infinite Scroll Indicator */}
      <InfiniteScrollLoader
        observerTargetRef={observerTargetRef}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        visibleCount={visibleCount}
        totalCount={totalCount}
        onLoadMore={loadMore}
        language={language}
      />

      {/* Confirmation Modal */}
      {confirmingItemId && activeItemToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'ar' ? 'تأكيد الإعلان المحفوظ' : 'Confirm Favorited Listing'}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{activeItemToConfirm.title}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmingItemId(null)}
                className="p-1 bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteConfirm} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400 font-bold block">{language === 'ar' ? 'تفاصيل الإعلان:' : 'Listing Details:'}</span>
                <p className="text-white font-bold">{activeItemToConfirm.title}</p>
                <p className="text-slate-300">{activeItemToConfirm.subtitle}</p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  {language === 'ar' ? 'ملاحظات وتأكيد الاتفاق (اختياري):' : 'Confirmation Notes (Optional):'}
                </label>
                <textarea
                  rows={3}
                  placeholder={language === 'ar' ? 'مثال: تم الاتفاق مع الناشرين وتحديد موعد الاستلام والمعاينة يوم الغد...' : 'e.g. Agreed with publisher, scheduled viewing tomorrow...'}
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  {language === 'ar' ? 'إتمام تأكيد الإعلان ⚡️' : 'Confirm Listing Now ⚡️'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingItemId(null)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

