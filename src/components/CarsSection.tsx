import React, { useState, useEffect } from 'react';
import { CarListing } from '../types';
import { initialCarListings } from '../data/mockData';
import { subscribeToListings } from '../lib/listingsService';
import { ShoppingBag, Plus, Phone, MapPin, Calendar, Tag, Wrench, Car as CarIcon, Laptop, Home, CreditCard, ShieldCheck, Filter, ArrowUpDown, RefreshCw, X, Share2, Flag, Crown, Star, Trash2, Bookmark, BookmarkCheck, Globe, QrCode, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAppMode } from '../context/AppModeContext';
import { PaymentModal, PaymentItemDetails } from './PaymentModal';
import { ShareAppModal } from './ShareAppModal';
import { ReportModal } from './ReportModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { MakeOfferModal } from './MakeOfferModal';
import { CompareModal } from './CompareModal';
import { RatingModal } from './RatingModal';
import { AdDetailModal } from './AdDetailModal';
import { getItemAverageRating } from '../lib/ratings';
import { shareListingItem } from '../lib/share';
import { useBookmarks } from '../context/BookmarkContext';
import { INTERNATIONAL_COUNTRIES } from '../lib/locations';
import { ListingFilterChips, PricePresetOption } from './ListingFilterChips';
import { useReports } from '../context/ReportContext';
import { QuickShareButtons } from './QuickShareButtons';
import { PostDateBadge } from './PostDateBadge';
import { getListingDate } from '../lib/dateUtils';
import { LazyImage } from './LazyImage';

interface CarsSectionProps {
  searchQuery?: string;
}

export const CarsSection: React.FC<CarsSectionProps> = ({ searchQuery = '' }) => {
  const { language } = useLanguage();
  const { appMode } = useAppMode();
  const { isPostDeleted } = useReports();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [items, setItems] = useState<CarListing[]>(initialCarListings);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = subscribeToListings((updatedListings) => {
      setItems(updatedListings);
    });
    return () => unsubscribe();
  }, []);
  const [filterCondition, setFilterCondition] = useState<'all' | 'new' | 'used'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'tools' | 'appliances' | 'electronics' | 'car'>('all');
  
  // Sorting & Advanced Filter State
  const [sortOption, setSortOption] = useState<'default' | 'price_asc' | 'price_desc' | 'newest' | 'oldest'>('default');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedPricePreset, setSelectedPricePreset] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const carPricePresets: PricePresetOption[] = [
    { id: 'all', labelAr: 'الكل 💵', labelEn: 'All Prices' },
    { id: 'under_100', labelAr: 'أقل من $100', labelEn: 'Under $100', maxPrice: 100 },
    { id: '100_500', labelAr: '$100 - $500', labelEn: '$100 - $500', minPrice: 100, maxPrice: 500 },
    { id: '500_5000', labelAr: '$500 - $5,000', labelEn: '$500 - $5k', minPrice: 500, maxPrice: 5000 },
    { id: 'above_5000', labelAr: 'أكثر من $5,000 💎', labelEn: 'Over $5,000 💎', minPrice: 5000 },
  ];

  const handleSelectPricePreset = (presetId: string, min?: number, max?: number) => {
    setSelectedPricePreset(presetId);
    setMinPrice(min !== undefined ? min.toString() : '');
    setMaxPrice(max !== undefined ? max.toString() : '');
  };

  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PaymentItemDetails | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [shareItem, setShareItem] = useState<CarListing | null>(null);
  const [reportItem, setReportItem] = useState<CarListing | null>(null);
  const [deleteItem, setDeleteItem] = useState<CarListing | null>(null);
  const [offerItem, setOfferItem] = useState<CarListing | null>(null);
  const [detailItem, setDetailItem] = useState<CarListing | null>(null);
  const [comparedItems, setComparedItems] = useState<CarListing[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [rateItem, setRateItem] = useState<CarListing | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingsVersion, setRatingsVersion] = useState(0);

  const toggleCompareItem = (item: CarListing) => {
    if (comparedItems.some((i) => i.id === item.id)) {
      setComparedItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      if (comparedItems.length >= 4) {
        alert(language === 'ar' ? 'يمكنك مقارنة 4 عناصر كحد أقصى في نفس الوقت' : 'Max 4 items can be compared');
        return;
      }
      setComparedItems((prev) => [...prev, item]);
      setIsCompareOpen(true);
    }
  };

  const handleOpenPayment = (item: CarListing) => {
    setSelectedPaymentItem({
      id: item.id,
      title: item.title,
      priceUSD: item.priceUSD,
      priceSYP: item.priceSYP,
      image: item.image,
      type: 'product',
    });
    setIsPaymentOpen(true);
  };

  const handleShareListing = async (item: CarListing) => {
    const res = await shareListingItem({
      title: item.title,
      text: `${language === 'ar' ? 'إعلان OMS' : 'OMS Listing'}: ${item.title} - ${item.city} | $${item.priceUSD} (${item.priceSYP.toLocaleString()} ل.س)`,
      url: `${window.location.origin}${window.location.pathname}?tab=cars&id=${item.id}`,
    });
    if (res.success && res.method === 'clipboard') {
      alert(language === 'ar' ? 'تم نسخ رابط ومعلومات الإعلان بنجاح (Web Share) 📋' : 'Listing link and details copied to clipboard!');
    }
  };

  const handleToggleCarBookmark = (item: CarListing) => {
    toggleBookmark({
      id: item.id,
      itemType: 'car',
      title: item.title,
      subtitle: `${item.city} • ${item.condition === 'new' ? (language === 'ar' ? 'جديد' : 'New') : (language === 'ar' ? 'مستعمل' : 'Used')}`,
      city: item.city,
      priceSYP: item.priceSYP,
      priceUSD: item.priceUSD,
      image: item.image,
      phone: item.phone,
      savedAt: new Date().toISOString(),
      originalData: item,
    });
  };

  const citiesList = ['all', 'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس', 'حماة'];

  const resetFilters = () => {
    setFilterCondition('all');
    setFilterCategory('all');
    setFilterCity('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedPricePreset('all');
    setDateFilter('all');
    setSortOption('default');
  };

  const activeFiltersCount =
    (filterCondition !== 'all' ? 1 : 0) +
    (filterCategory !== 'all' ? 1 : 0) +
    (filterCity !== 'all' ? 1 : 0) +
    (selectedPricePreset !== 'all' || minPrice || maxPrice ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0);

  const filteredItems = items
    .filter((item) => {
      if (isPostDeleted(item.id)) return false;
      const matchesCondition = filterCondition === 'all' || item.condition === filterCondition;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesCity = filterCity === 'all' || 
        item.city.toLowerCase().includes(filterCity.toLowerCase()) || 
        filterCity.toLowerCase().includes(item.city.toLowerCase());

      const minP = minPrice ? parseFloat(minPrice) : 0;
      const maxP = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = item.priceUSD >= minP && item.priceUSD <= maxP;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        if (item.createdAt) {
          const postTime = new Date(item.createdAt).getTime();
          if (!isNaN(postTime)) {
            const diffHours = (Date.now() - postTime) / (1000 * 60 * 60);
            if (dateFilter === 'today') matchesDate = diffHours <= 24;
            else if (dateFilter === 'week') matchesDate = diffHours <= 24 * 7;
            else if (dateFilter === 'month') matchesDate = diffHours <= 24 * 30;
          }
        }
      }

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        (item.make && item.make.toLowerCase().includes(query)) ||
        (item.model && item.model.toLowerCase().includes(query)) ||
        (item.phone && item.phone.includes(query));

      return matchesCondition && matchesCategory && matchesCity && matchesPrice && matchesDate && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === 'newest') {
        const timeA = getListingDate(a.createdAt).getTime();
        const timeB = getListingDate(b.createdAt).getTime();
        return timeB - timeA;
      }
      if (sortOption === 'oldest') {
        const timeA = getListingDate(a.createdAt).getTime();
        const timeB = getListingDate(b.createdAt).getTime();
        return timeA - timeB;
      }
      if (sortOption === 'price_asc') return a.priceUSD - b.priceUSD;
      if (sortOption === 'price_desc') return b.priceUSD - a.priceUSD;

      // Default sorting: VIP/Featured first, then by publication date newest first
      const aRank = a.featuredPlan === 'vip' ? 3 : a.featuredPlan === 'golden' || a.featured ? 2 : 1;
      const bRank = b.featuredPlan === 'vip' ? 3 : b.featuredPlan === 'golden' || b.featured ? 2 : 1;
      if (aRank !== bRank) return bRank - aRank;

      const timeA = getListingDate(a.createdAt).getTime();
      const timeB = getListingDate(b.createdAt).getTime();
      return timeB - timeA;
    });

  return (
    <div className="p-4 max-w-7xl w-full mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">
              {language === 'ar' ? 'سوق بيع وشراء الأدوات مستعمل وجديد' : 'New & Used Goods & Vehicles Market'}
            </h2>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              {language === 'ar' ? 'الصفحة الرئيسية ⭐️' : 'Home Main'}
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {language === 'ar'
              ? 'المنصة الأولى للبيع والشراء المباشر في سوريا: أدوات ومعدات كهربائية، قطع غيار، إلكترونيات، وسيارات مع نظام تقييمات الشراء المعتمد.'
              : 'Buy and sell new & used items, electrical tools, equipment, electronics, and cars with verified ratings.'}
          </p>

          {/* Quick Rating Button */}
          <button
            onClick={() => {
              setRateItem(null);
              setIsRatingOpen(true);
            }}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs transition-all shadow cursor-pointer flex items-center gap-1.5"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{language === 'ar' ? 'سجل تقييمات الأدوات والقطع ⭐️' : 'All Tool & Item Ratings ⭐️'}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-bold px-1">
            {language === 'ar' ? 'الحالة:' : 'Condition:'}
          </span>
          <button
            onClick={() => setFilterCondition('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCondition === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setFilterCondition('used')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCondition === 'used' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'مستعمل ♻️' : 'Used ♻️'}
          </button>
          <button
            onClick={() => setFilterCondition('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCondition === 'new' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'جديد ✨' : 'New ✨'}
          </button>
        </div>
      </div>

      {/* Category Selection Bar & Advanced Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الكل' : 'All'}</span>
          </button>

          <button
            onClick={() => setFilterCategory('tools')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              filterCategory === 'tools'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'أدوات صيانة' : 'Tools'}</span>
          </button>

          <button
            onClick={() => setFilterCategory('appliances')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              filterCategory === 'appliances'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'أجهزة منزلية' : 'Appliances'}</span>
          </button>

          <button
            onClick={() => setFilterCategory('electronics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              filterCategory === 'electronics'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إلكترونيات' : 'Electronics'}</span>
          </button>

          <button
            onClick={() => setFilterCategory('car')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              filterCategory === 'car'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CarIcon className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'سيارات' : 'Cars'}</span>
          </button>
        </div>

        {/* Sorting & Filter Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="default" className="bg-slate-900">{language === 'ar' ? 'ترتيب افتراضي' : 'Default Sorting'}</option>
              <option value="price_asc" className="bg-slate-900">{language === 'ar' ? 'السعر: من الأقل للأعلى 💵' : 'Price: Low to High'}</option>
              <option value="price_desc" className="bg-slate-900">{language === 'ar' ? 'السعر: من الأعلى للأقل 💎' : 'Price: High to Low'}</option>
              <option value="newest" className="bg-slate-900">{language === 'ar' ? 'التاريخ: الأحدث أولاً 📅' : 'Date: Newest First'}</option>
              <option value="oldest" className="bg-slate-900">{language === 'ar' ? 'التاريخ: الأقدم أولاً ⌛' : 'Date: Oldest First'}</option>
            </select>
          </div>

          {/* Toggle Filter Sidebar Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-indigo-300" />
            <span>{language === 'ar' ? 'فلترة متقدمة' : 'Filters'}</span>
            {activeFiltersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Chips Bar (Price range, Location, Date recency) */}
      <ListingFilterChips
        selectedCity={filterCity}
        onSelectCity={(city) => setFilterCity(city)}
        selectedPricePreset={selectedPricePreset}
        pricePresets={carPricePresets}
        onSelectPricePreset={handleSelectPricePreset}
        selectedDateFilter={dateFilter}
        onSelectDateFilter={(d) => setDateFilter(d)}
        onResetAll={resetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Filter Options Expandable Panel */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 animate-fadeIn shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Filter className="w-4 h-4" />
              <span>{language === 'ar' ? 'تخصيص نطاق البحث والفلترة' : 'Advanced Search & Filter Panel'}</span>
            </span>
            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {/* Filter by City / Location */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>{language === 'ar' ? 'الدولة والمدينة 🌍' : 'Country & City 🌍'}</span>
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="all">{language === 'ar' ? 'جميع البلدان والمدن 🌍' : 'All Countries & Cities'}</option>
                {INTERNATIONAL_COUNTRIES.map((c) => (
                  <optgroup key={c.code} label={`${c.flag} ${language === 'ar' ? c.nameAr : c.nameEn}`}>
                    <option value={c.nameAr}>{c.flag} كل {c.nameAr}</option>
                    {c.cities.map((ci) => (
                      <option key={ci.nameAr} value={ci.nameAr}>
                        {c.flag} {ci.nameAr}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Min Price ($ USD) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400">
                {language === 'ar' ? 'الحد الأدنى للسعر ($ USD)' : 'Min Price ($)'}
              </label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Max Price ($ USD) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400">
                {language === 'ar' ? 'الحد الأعلى للسعر ($ USD)' : 'Max Price ($)'}
              </label>
              <input
                type="number"
                placeholder="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setDetailItem(item)}
            className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative cursor-pointer ${
              item.featuredPlan === 'vip'
                ? 'border-2 border-cyan-500 shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                : item.featuredPlan === 'golden' || item.featured
                ? 'border-2 border-amber-500 shadow-amber-500/10 ring-1 ring-amber-400/40'
                : 'border border-emerald-500/25 dark:border-slate-800 hover:border-emerald-500/60'
            }`}
          >
            {/* VIP / Featured Ribbon Badge */}
            {item.featuredPlan === 'vip' && (
              <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 text-white font-black text-[10px] px-2.5 py-0.5 flex items-center justify-between shadow-xs">
                <span className="flex items-center gap-1 truncate">
                  <Crown className="w-3 h-3 text-yellow-300 animate-bounce shrink-0" />
                  <span className="truncate">VIP الماسي 💎</span>
                </span>
                <span className="text-[8px] bg-slate-950/50 text-white px-1 py-0.2 rounded font-mono">10X</span>
              </div>
            )}

            {item.featuredPlan === 'golden' && (
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-0.5 flex items-center justify-between shadow-xs">
                <span className="flex items-center gap-1 truncate">
                  <Star className="w-3 h-3 fill-slate-950 text-slate-950 shrink-0" />
                  <span className="truncate">مميز ذهبي 🌟</span>
                </span>
              </div>
            )}

            {/* Compact Image Container */}
            <div className="relative h-32 sm:h-36 md:h-40 bg-slate-100 dark:bg-slate-950 overflow-hidden">
              {item.video || item.mediaType === 'video' ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video
                    src={item.video || item.image}
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-indigo-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-md">
                    <span>🎥 فيديو</span>
                  </div>
                </div>
              ) : (
                <LazyImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              {/* Floating Quick Bookmark Icon Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCarBookmark(item);
                }}
                title={
                  isBookmarked(item.id)
                    ? (language === 'ar' ? 'الإعلان محفوظ في المفضلة 🔖' : 'Saved 🔖')
                    : (language === 'ar' ? 'إضافة للمفضلة 🔖' : 'Bookmark 🔖')
                }
                className={`absolute top-2 left-2 p-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-90 shadow-md cursor-pointer z-10 flex items-center justify-center ${
                  isBookmarked(item.id)
                    ? 'bg-amber-400 text-slate-950 border-amber-300 ring-1 ring-amber-400/50 shadow-amber-500/30'
                    : 'bg-white/80 dark:bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-amber-500 dark:text-amber-400 border-slate-200 dark:border-slate-700/80'
                }`}
              >
                {isBookmarked(item.id) ? (
                  <BookmarkCheck className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </button>

              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span
                  className={`font-bold text-[9px] px-1.5 py-0.2 rounded-md shadow-xs backdrop-blur-md ${
                    item.condition === 'new'
                      ? 'bg-slate-950/80 border border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-950/80 border border-slate-700/80 text-slate-300'
                  }`}
                >
                  {item.condition === 'new'
                    ? language === 'ar'
                      ? 'جديد ✨'
                      : 'New'
                    : language === 'ar'
                    ? 'مستعمل ♻️'
                    : 'Used'}
                </span>
              </div>

              <span className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded-md border border-slate-700 backdrop-blur font-medium flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                <span>{item.city}</span>
              </span>
            </div>

            {/* Compact Body Content */}
            <div className="p-2.5 sm:p-3 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <PostDateBadge createdAt={item.createdAt} fallbackIndex={index} />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-emerald-500 transition-colors pt-0.5">
                  {item.title}
                </h3>
              </div>

              {/* Price Row */}
              <div className="bg-emerald-50/70 dark:bg-slate-950 p-2 rounded-xl border border-emerald-200/60 dark:border-slate-800 flex items-center justify-between dir-ltr">
                <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  ${item.priceUSD.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-mono dir-rtl font-bold">
                  {item.priceSYP.toLocaleString()} ل.س
                </span>
              </div>

              {/* Compact Quick Buttons */}
              <div className="flex items-center gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                <a
                  href={`tel:${item.phone}`}
                  className="flex-1 min-h-[30px] flex items-center justify-center gap-1 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] sm:text-[11px] transition-all shadow-xs active:scale-95"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'ar' ? 'اتصال' : 'Call'}</span>
                </a>

                <button
                  onClick={() => handleOpenPayment(item)}
                  className="flex-1 min-h-[30px] flex items-center justify-center gap-1 py-1 px-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-lg text-[10px] sm:text-[11px] transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-3 h-3 text-slate-950" />
                  <span>{language === 'ar' ? 'حجز 🛒' : 'Reserve'}</span>
                </button>

                <button
                  onClick={() => setDetailItem(item)}
                  title={language === 'ar' ? 'عرض باقي التفاصيل والتأكيدات' : 'View Details'}
                  className="p-1.5 min-h-[30px] bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-lg font-bold text-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        item={selectedPaymentItem}
      />

      {/* Share Item Modal */}
      <ShareAppModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        url={shareItem ? `${window.location.origin}${window.location.pathname}?tab=cars&id=${shareItem.id}` : ''}
        title={shareItem ? `${shareItem.title} - ${shareItem.priceUSD}$ (${shareItem.city})` : ''}
        description={shareItem ? `شاهد هذا الإعلان مميز على منصة OMS: ${shareItem.title} بسعر $${shareItem.priceUSD.toLocaleString()} (${shareItem.priceSYP.toLocaleString()} ل.س)` : ''}
      />

      {/* Report Post Modal */}
      <ReportModal
        isOpen={!!reportItem}
        onClose={() => setReportItem(null)}
        postId={reportItem?.id || ''}
        postTitle={reportItem?.title || ''}
        postCategory="سيارات ومستلزمات وسوق"
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem) {
            setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
            setDeleteItem(null);
          }
        }}
        title={language === 'ar' ? 'تأكيد حذف الإعلان' : 'Confirm Listing Deletion'}
        message={
          language === 'ar'
            ? 'هل أنت متأكد من رغبتك في حذف هذا الإعلان بشكل نهائي من منصة OMS؟ لن تتمكن من استعادته بعد الحذف.'
            : 'Are you sure you want to permanently delete this listing from OMS? This action cannot be undone.'
        }
        itemName={deleteItem?.title}
        confirmText={language === 'ar' ? 'نعم، احذف الإعلان' : 'Yes, Delete Listing'}
      />

      {/* Make Offer Modal */}
      <MakeOfferModal
        isOpen={!!offerItem}
        onClose={() => setOfferItem(null)}
        itemTitle={offerItem?.title || ''}
        originalPriceUSD={offerItem?.priceUSD || 0}
        originalPriceSYP={offerItem?.priceSYP || 0}
        sellerPhone={offerItem?.phone || ''}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        items={comparedItems}
        onRemoveItem={(id) => setComparedItems((prev) => prev.filter((i) => i.id !== id))}
        onClearAll={() => {
          setComparedItems([]);
          setIsCompareOpen(false);
        }}
      />

      {/* Item Rating Modal */}
      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => {
          setIsRatingOpen(false);
          setRateItem(null);
        }}
        item={rateItem}
        onRatingsUpdated={() => setRatingsVersion((v) => v + 1)}
      />

      {/* Full Ad Detail Modal (opened on post click) */}
      <AdDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        itemType="car"
        onOpenOffer={(item) => {
          setDetailItem(null);
          setOfferItem(item);
        }}
        onOpenPayment={(item) => {
          setDetailItem(null);
          handleOpenPayment(item);
        }}
        onOpenRate={(item) => {
          setDetailItem(null);
          setRateItem(item);
          setIsRatingOpen(true);
        }}
        onToggleCompare={(item) => {
          toggleCompareItem(item);
        }}
        onOpenShare={(item) => {
          setDetailItem(null);
          setShareItem(item);
        }}
        onOpenReport={(item) => {
          setDetailItem(null);
          setReportItem(item);
        }}
        isCompared={detailItem ? comparedItems.some((i) => i.id === detailItem.id) : false}
      />
    </div>
  );
};

