import React, { useState, useEffect } from 'react';
import { CarListing, TabType } from '../types';
import { initialCarListings } from '../data/mockData';
import { subscribeToListings } from '../lib/listingsService';
import { ShoppingBag, Plus, Phone, MapPin, Calendar, Tag, Wrench, Car as CarIcon, Laptop, Home, CreditCard, ShieldCheck, Filter, ArrowUpDown, RefreshCw, X, Share2, Flag, Crown, Star, Trash2, Bookmark, BookmarkCheck, Globe, QrCode, ChevronDown, ChevronUp, MoreHorizontal, ZoomIn, Maximize2, Sparkles, Building, Briefcase, Truck } from 'lucide-react';
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
import { ImageLightboxModal } from './ImageLightboxModal';
import { getItemAverageRating } from '../lib/ratings';
import { shareListingItem, shareToWhatsApp, shareToTelegram } from '../lib/share';
import { useBookmarks } from '../context/BookmarkContext';
import { INTERNATIONAL_COUNTRIES } from '../lib/locations';
import { PricePresetOption, ListingFilterChips } from './ListingFilterChips';
import { PriceRangeSlider } from './PriceRangeSlider';
import { SmartLocationFilter } from './SmartLocationFilter';
import { SmartCarSpecsFilter } from './SmartCarSpecsFilter';
import { useReports } from '../context/ReportContext';
import { QuickShareButtons } from './QuickShareButtons';
import { PostDateBadge } from './PostDateBadge';
import { getListingDate } from '../lib/dateUtils';
import { LazyImage } from './LazyImage';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';

interface CarsSectionProps {
  searchQuery?: string;
  onSelectTab?: (tab: TabType) => void;
}

export const CarsSection: React.FC<CarsSectionProps> = ({ searchQuery = '', onSelectTab }) => {
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
  const [filterArea, setFilterArea] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedPricePreset, setSelectedPricePreset] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Smart Specs Filter State
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [selectedYearRange, setSelectedYearRange] = useState<string>('all');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all');

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

  const handleResetSpecs = () => {
    setSelectedMake('all');
    setSelectedYearRange('all');
    setSelectedTransmission('all');
    setSelectedFuelType('all');
  };

  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PaymentItemDetails | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [shareItem, setShareItem] = useState<CarListing | null>(null);
  const [reportItem, setReportItem] = useState<CarListing | null>(null);
  const [deleteItem, setDeleteItem] = useState<CarListing | null>(null);
  const [offerItem, setOfferItem] = useState<CarListing | null>(null);
  const [detailItem, setDetailItem] = useState<CarListing | null>(null);
  const [lightboxItem, setLightboxItem] = useState<CarListing | null>(null);
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

  const handleNativeShare = async (item: CarListing) => {
    const shareTitle = item.title;
    const shareText = `شاهد هذا الإعلان على منصة OMS: ${item.title} - بسعر $${item.priceUSD.toLocaleString()} (${item.priceSYP.toLocaleString()} ل.س) - المحافظة: ${item.city}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?tab=cars&id=${item.id}`;
    await shareListingItem({ title: shareTitle, text: shareText, url: shareUrl });
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
    setFilterArea('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedPricePreset('all');
    setDateFilter('all');
    setSortOption('default');
    setSelectedMake('all');
    setSelectedYearRange('all');
    setSelectedTransmission('all');
    setSelectedFuelType('all');
  };

  const activeFiltersCount =
    (filterCondition !== 'all' ? 1 : 0) +
    (filterCategory !== 'all' ? 1 : 0) +
    (filterCity !== 'all' ? 1 : 0) +
    (filterArea ? 1 : 0) +
    (selectedPricePreset !== 'all' || minPrice || maxPrice ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0) +
    (selectedMake !== 'all' ? 1 : 0) +
    (selectedYearRange !== 'all' ? 1 : 0) +
    (selectedTransmission !== 'all' ? 1 : 0) +
    (selectedFuelType !== 'all' ? 1 : 0);

  const filteredItems = items
    .filter((item) => {
      if (isPostDeleted(item.id)) return false;
      const matchesCondition = filterCondition === 'all' || item.condition === filterCondition;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesCity = filterCity === 'all' || 
        item.city.toLowerCase().includes(filterCity.toLowerCase()) || 
        filterCity.toLowerCase().includes(item.city.toLowerCase());

      const matchesArea = !filterArea || item.city.includes(filterArea) || item.title.includes(filterArea);

      // Make matching
      let matchesMake = true;
      if (selectedMake !== 'all') {
        const itemText = `${item.title} ${item.make || ''} ${item.model || ''}`.toLowerCase();
        matchesMake = itemText.includes(selectedMake.toLowerCase());
      }

      // Year range matching
      let matchesYear = true;
      if (selectedYearRange !== 'all' && item.year) {
        if (selectedYearRange === '2024_2026') matchesYear = item.year >= 2024;
        else if (selectedYearRange === '2020_2023') matchesYear = item.year >= 2020 && item.year <= 2023;
        else if (selectedYearRange === '2015_2019') matchesYear = item.year >= 2015 && item.year <= 2019;
        else if (selectedYearRange === '2010_2014') matchesYear = item.year >= 2010 && item.year <= 2014;
        else if (selectedYearRange === 'under_2010') matchesYear = item.year < 2010;
      }

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

      return matchesCondition && matchesCategory && matchesCity && matchesArea && matchesMake && matchesYear && matchesPrice && matchesDate && matchesSearch;
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

  const {
    displayedItems,
    visibleCount,
    hasMore,
    isLoadingMore,
    loadMore,
    observerTargetRef,
    totalCount,
  } = useInfiniteScroll<CarListing>(filteredItems, {
    initialCount: 12,
    step: 12,
    dependencies: [filterCondition, filterCategory, filterCity, filterArea, minPrice, maxPrice, dateFilter, sortOption, searchQuery, selectedMake, selectedYearRange, selectedTransmission, selectedFuelType],
  });

  return (
    <div className="p-4 max-w-7xl w-full mx-auto space-y-6">
      {/* Unified Compact Control Panel */}
      <div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3.5 rounded-2xl shadow-xl space-y-2.5">
        {/* Top Bar: Categories + Conditions + Sort & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full shrink-0">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === 'car'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <CarIcon className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'سيارات' : 'Cars'}</span>
            </button>
          </div>

          {/* Right Group: Condition + Sorting + Filters Button + Rating Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Condition Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
              <button
                onClick={() => setFilterCondition('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterCondition === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setFilterCondition('used')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterCondition === 'used' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'مستعمل ♻️' : 'Used ♻️'}
              </button>
              <button
                onClick={() => setFilterCondition('new')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterCondition === 'new' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'ar' ? 'جديد ✨' : 'New ✨'}
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="default" className="bg-slate-900">{language === 'ar' ? 'ترتيب افتراضي' : 'Default'}</option>
                <option value="price_asc" className="bg-slate-900">{language === 'ar' ? 'السعر: الأقل للأعلى 💵' : 'Price: Low to High'}</option>
                <option value="price_desc" className="bg-slate-900">{language === 'ar' ? 'السعر: الأعلى للأقل 💎' : 'Price: High to Low'}</option>
                <option value="newest" className="bg-slate-900">{language === 'ar' ? 'التاريخ: الأحدث 📅' : 'Newest'}</option>
                <option value="oldest" className="bg-slate-900">{language === 'ar' ? 'التاريخ: الأقدم ⌛' : 'Oldest'}</option>
              </select>
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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

            {/* Quick Rating Button */}
            <button
              onClick={() => {
                setRateItem(null);
                setIsRatingOpen(true);
              }}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs transition-all shadow cursor-pointer flex items-center gap-1 shrink-0"
              title={language === 'ar' ? 'سجل تقييمات الأدوات والقطع' : 'Tool Ratings'}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'سجل التقييمات ⭐️' : 'Ratings ⭐️'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Location & Filter Chips (Seamlessly Integrated) */}
        <div className="pt-2 border-t border-slate-800/80">
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
        </div>
      </div>

      {/* Filter Options Expandable Panel */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Filter className="w-4 h-4" />
              <span>{language === 'ar' ? 'تخصيص نطاق البحث والفلترة الذكية' : 'Smart Search & Filter Console'}</span>
            </span>
            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors text-[11px] font-bold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{language === 'ar' ? 'إعادة ضبط كل الفلاتر' : 'Reset All Filters'}</span>
            </button>
          </div>

          {/* Interactive Price Range Slider */}
          <PriceRangeSlider
            minVal={minPrice ? parseFloat(minPrice) : 0}
            maxVal={maxPrice ? parseFloat(maxPrice) : 50000}
            minLimit={0}
            maxLimit={50000}
            step={100}
            currencySymbol="$"
            onChange={(min, max) => {
              setMinPrice(min > 0 ? min.toString() : '');
              setMaxPrice(max < 50000 ? max.toString() : '');
            }}
            presetRanges={[
              { labelAr: 'أقل من $500 💵', labelEn: '< $500', min: 0, max: 500 },
              { labelAr: '$500 - $3,000 🚗', labelEn: '$500 - $3k', min: 500, max: 3000 },
              { labelAr: '$3,000 - $12,000 🚘', labelEn: '$3k - $12k', min: 3000, max: 12000 },
              { labelAr: '$12,000 - $30,000 🏎️', labelEn: '$12k - $30k', min: 12000, max: 30000 },
              { labelAr: 'أكثر من $30,000 💎', labelEn: '> $30k 💎', min: 30000, max: 50000 },
            ]}
          />

          {/* Smart Location Filter */}
          <SmartLocationFilter
            selectedCity={filterCity}
            onSelectCity={(city) => setFilterCity(city)}
            selectedArea={filterArea}
            onSelectArea={(area) => setFilterArea(area)}
          />

          {/* Smart Car Specifications Filter */}
          <SmartCarSpecsFilter
            selectedMake={selectedMake}
            onSelectMake={(make) => setSelectedMake(make)}
            selectedYearRange={selectedYearRange}
            onSelectYearRange={(range) => setSelectedYearRange(range)}
            selectedTransmission={selectedTransmission}
            onSelectTransmission={(trans) => setSelectedTransmission(trans)}
            selectedFuelType={selectedFuelType}
            onSelectFuelType={(fuel) => setSelectedFuelType(fuel)}
            onResetSpecs={handleResetSpecs}
          />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayedItems.map((item, index) => (
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

            {/* Compact Image Container with Lightbox Zoom capability */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setLightboxItem(item);
              }}
              className="relative h-32 sm:h-36 md:h-40 bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-zoom-in group/img"
              title={language === 'ar' ? 'انقر لتكبير صورة السيارة' : 'Click to zoom vehicle image'}
            >
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

              {/* Zoom Hover Overlay Hint */}
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-white text-[10px] font-bold flex items-center gap-1 border border-slate-700/80 backdrop-blur shadow-lg">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'تكبير الصورة 🔍' : 'Zoom Image'}</span>
                </span>
              </div>

              {/* Floating Quick Bookmark & Web Share API Buttons */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxItem(item);
                  }}
                  title={language === 'ar' ? 'تكبير ومعاينة الصورة' : 'Zoom Image Preview'}
                  className="p-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-90 shadow-md cursor-pointer flex items-center justify-center bg-white/80 dark:bg-slate-950/80 hover:bg-amber-400 hover:text-slate-950 text-amber-500 dark:text-amber-400 border-slate-200 dark:border-slate-700/80"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

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
                  className={`p-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-90 shadow-md cursor-pointer flex items-center justify-center ${
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
              </div>

              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                {item.condition === 'certified' ? (
                  <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg shadow-lg border border-amber-300 flex items-center gap-1 backdrop-blur-md">
                    <ShieldCheck className="w-3 h-3 text-slate-950 fill-slate-950" />
                    <span>{language === 'ar' ? 'مفحوصة ومعتمدة 🛡️' : 'Certified 🛡️'}</span>
                  </span>
                ) : item.condition === 'new' ? (
                  <span className="bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{language === 'ar' ? 'جديد (وكالة) ✨' : 'New ✨'}</span>
                  </span>
                ) : (
                  <span className="bg-slate-950/85 border border-slate-700/80 text-slate-200 font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1 backdrop-blur-md">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>{language === 'ar' ? 'مستعمل ♻️' : 'Used ♻️'}</span>
                  </span>
                )}
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

                {/* Specs Chips (Year, Make, Mileage) */}
                {(item.year || item.make || (item.mileage !== undefined && item.mileage > 0)) && (
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {item.year && (
                      <span className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 font-mono font-bold">
                        {item.year}
                      </span>
                    )}
                    {item.make && (
                      <span className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 font-bold">
                        {item.make}
                      </span>
                    )}
                    {item.mileage !== undefined && item.mileage > 0 && (
                      <span className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 font-mono">
                        {item.mileage.toLocaleString()} km
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price Row (Wrapped & Compact to Prevent Overlap) */}
              <div className="bg-emerald-50/70 dark:bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-emerald-200/60 dark:border-slate-800 flex flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0.5 dir-ltr overflow-hidden">
                <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
                  ${item.priceUSD.toLocaleString()}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-mono font-bold dir-rtl shrink-0">
                  {item.priceSYP.toLocaleString()} <span className="text-[9px]">ل.س</span>
                </span>
              </div>

              {/* Compact Quick Buttons */}
              <div className="flex items-center gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
                <a
                  href={`tel:${item.phone || '+963900000000'}`}
                  title={language === 'ar' ? `اتصال مباشر بالبائع (${item.phone || 'OMS'})` : `Call seller (${item.phone || 'OMS'})`}
                  className="flex-1 h-7 flex items-center justify-center gap-1 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] transition-all shadow-xs active:scale-95 shrink-0"
                >
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">{language === 'ar' ? 'اتصال' : 'Call'}</span>
                </a>

                <button
                  onClick={() => handleOpenPayment(item)}
                  className="flex-1 h-7 flex items-center justify-center gap-1 py-1 px-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-lg text-[10px] transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                >
                  <CreditCard className="w-3 h-3 text-slate-950 shrink-0" />
                  <span>{language === 'ar' ? 'حجز 🛒' : 'Reserve'}</span>
                </button>

                <button
                  onClick={() => setShareItem(item)}
                  title={language === 'ar' ? 'مشاركة الإعلان (واتساب، تليجرام، رابط)' : 'Share Listing'}
                  className="w-7 h-7 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 rounded-lg font-bold text-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                </button>

                <button
                  onClick={() => setDetailItem(item)}
                  title={language === 'ar' ? 'عرض باقي التفاصيل والتأكيدات' : 'View Details'}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-lg font-bold text-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {/* Image Lightbox / Zoom Modal */}
      <ImageLightboxModal
        isOpen={!!lightboxItem}
        onClose={() => setLightboxItem(null)}
        imageUrl={lightboxItem?.image || ''}
        title={lightboxItem?.title || ''}
        priceUSD={lightboxItem?.priceUSD}
        priceSYP={lightboxItem?.priceSYP}
        city={lightboxItem?.city}
        phone={lightboxItem?.phone}
        images={lightboxItem ? [lightboxItem.image, ...(lightboxItem.gallery || [])] : []}
        onReserve={() => {
          if (lightboxItem) {
            handleOpenPayment(lightboxItem);
            setLightboxItem(null);
          }
        }}
        onShare={() => {
          if (lightboxItem) {
            handleNativeShare(lightboxItem);
          }
        }}
      />
    </div>
  );
};

