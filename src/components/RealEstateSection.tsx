import React, { useState, useEffect } from 'react';
import { RealEstateListing } from '../types';
import { initialRealEstateListings } from '../data/mockData';
import { subscribeToRealEstateListings, saveRealEstateToFirestore } from '../lib/listingsService';
import { getListingDate } from '../lib/dateUtils';
import { PostDateBadge } from './PostDateBadge';
import { Home, Plus, Phone, MapPin, Tag, Filter, CheckCircle2, Building, DollarSign, X, ArrowUpDown, RefreshCw, Calendar, Maximize2, Share2, Flag, Trash2, Bookmark, BookmarkCheck, Globe, CreditCard, ShoppingBag, QrCode, MoreHorizontal, ZoomIn } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ShareAppModal } from './ShareAppModal';
import { ReportModal } from './ReportModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { PaymentModal, PaymentItemDetails } from './PaymentModal';
import { AdDetailModal } from './AdDetailModal';
import { ImageLightboxModal } from './ImageLightboxModal';
import { shareListingItem, shareToWhatsApp, shareToTelegram } from '../lib/share';
import { useBookmarks } from '../context/BookmarkContext';
import { INTERNATIONAL_COUNTRIES } from '../lib/locations';
import { PricePresetOption, ListingFilterChips } from './ListingFilterChips';
import { PriceRangeSlider } from './PriceRangeSlider';
import { SmartLocationFilter } from './SmartLocationFilter';
import { SmartRealEstateSpecsFilter } from './SmartRealEstateSpecsFilter';
import { useReports } from '../context/ReportContext';
import { QuickShareButtons } from './QuickShareButtons';
import { LazyImage } from './LazyImage';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';

interface RealEstateSectionProps {
  searchQuery?: string;
}

export const RealEstateSection: React.FC<RealEstateSectionProps> = ({ searchQuery = '' }) => {
  const { language } = useLanguage();
  const { isPostDeleted } = useReports();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [listings, setListings] = useState<RealEstateListing[]>(initialRealEstateListings);
  
  useEffect(() => {
    const unsubscribe = subscribeToRealEstateListings((data) => {
      setListings(data);
    });
    return () => unsubscribe();
  }, []);
  
  // Filtering & Sorting State
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'apartment' | 'house' | 'shop' | 'land' | 'hotel' | 'furnished_room' | 'farm' | 'chalet'>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedPricePreset, setSelectedPricePreset] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortOption, setSortOption] = useState<'default' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'space_desc'>('default');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Smart Property Specs Filter State
  const [selectedRooms, setSelectedRooms] = useState<string>('all');
  const [selectedSpaceRange, setSelectedSpaceRange] = useState<string>('all');
  const [selectedCladding, setSelectedCladding] = useState<string>('all');

  const realEstatePricePresets: PricePresetOption[] = [
    { id: 'all', labelAr: 'الكل 💵', labelEn: 'All Prices' },
    { id: 'budget_rent', labelAr: 'إيجار اقتصادي (< $300)', labelEn: 'Budget Rent (< $300)', maxPrice: 300 },
    { id: 'mid_rent', labelAr: 'إيجار/شقة متوسطة ($300 - $1,000)', labelEn: 'Mid Rent ($300 - $1k)', minPrice: 300, maxPrice: 1000 },
    { id: 'buy_mid', labelAr: 'شراء / تمليك ($1,000 - $50,000)', labelEn: 'Buy Mid ($1k - $50k)', minPrice: 1000, maxPrice: 50000 },
    { id: 'luxury', labelAr: 'عقارات فاخرة (> $50,000) 💎', labelEn: 'Luxury Over $50k 💎', minPrice: 50000 },
  ];

  const handleSelectPricePreset = (presetId: string, min?: number, max?: number) => {
    setSelectedPricePreset(presetId);
    setMinPrice(min !== undefined ? min.toString() : '');
    setMaxPrice(max !== undefined ? max.toString() : '');
  };

  const handleResetSpecs = () => {
    setSelectedRooms('all');
    setSelectedSpaceRange('all');
    setSelectedCladding('all');
  };

  const [shareItem, setShareItem] = useState<RealEstateListing | null>(null);
  const [reportItem, setReportItem] = useState<RealEstateListing | null>(null);
  const [deleteItem, setDeleteItem] = useState<RealEstateListing | null>(null);
  const [detailItem, setDetailItem] = useState<RealEstateListing | null>(null);
  const [lightboxItem, setLightboxItem] = useState<RealEstateListing | null>(null);
  const [paymentItem, setPaymentItem] = useState<PaymentItemDetails | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // New Listing Form Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCity, setNewCity] = useState('دمشق');
  const [newArea, setNewArea] = useState('');
  const [newPriceUSD, setNewPriceUSD] = useState(250);
  const [newType, setNewType] = useState<'rent' | 'sale'>('rent');
  const [newCategory, setNewCategory] = useState<'apartment' | 'house' | 'shop' | 'land' | 'hotel' | 'furnished_room' | 'farm' | 'chalet'>('apartment');
  const [newPhone, setNewPhone] = useState('0999000111');
  const [newSeller, setNewSeller] = useState('أبو علي للعقارات');

  const citiesList = ['all', 'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس', 'حماة'];

  const resetFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setFilterCity('all');
    setFilterArea('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedPricePreset('all');
    setDateFilter('all');
    setSortOption('default');
    setSelectedRooms('all');
    setSelectedSpaceRange('all');
    setSelectedCladding('all');
  };

  const activeFiltersCount =
    (filterType !== 'all' ? 1 : 0) +
    (filterCategory !== 'all' ? 1 : 0) +
    (filterCity !== 'all' ? 1 : 0) +
    (filterArea ? 1 : 0) +
    (selectedPricePreset !== 'all' || minPrice || maxPrice ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0) +
    (selectedRooms !== 'all' ? 1 : 0) +
    (selectedSpaceRange !== 'all' ? 1 : 0) +
    (selectedCladding !== 'all' ? 1 : 0);

  const filtered = listings
    .filter((item) => {
      if (isPostDeleted(item.id)) return false;
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (filterCity !== 'all') {
        const itemCity = item.city.toLowerCase();
        const targetCity = filterCity.toLowerCase();
        const matchesLocation = itemCity.includes(targetCity) || targetCity.includes(itemCity);
        if (!matchesLocation) return false;
      }

      if (filterArea) {
        const matchesArea = item.city.includes(filterArea) || item.area.includes(filterArea) || item.title.includes(filterArea);
        if (!matchesArea) return false;
      }

      // Rooms count filter
      if (selectedRooms !== 'all' && item.rooms !== undefined) {
        if (selectedRooms === '1' && item.rooms !== 1) return false;
        if (selectedRooms === '2' && item.rooms !== 2) return false;
        if (selectedRooms === '3' && item.rooms !== 3) return false;
        if (selectedRooms === '4_plus' && item.rooms < 4) return false;
      }

      // Space range filter (m²)
      if (selectedSpaceRange !== 'all' && item.spaceSqM) {
        if (selectedSpaceRange === 'under_80' && item.spaceSqM >= 80) return false;
        if (selectedSpaceRange === '80_150' && (item.spaceSqM < 80 || item.spaceSqM > 150)) return false;
        if (selectedSpaceRange === '150_300' && (item.spaceSqM < 150 || item.spaceSqM > 300)) return false;
        if (selectedSpaceRange === 'over_300' && item.spaceSqM <= 300) return false;
      }

      const minP = minPrice ? parseFloat(minPrice) : 0;
      const maxP = maxPrice ? parseFloat(maxPrice) : Infinity;
      if (item.priceUSD < minP || item.priceUSD > maxP) return false;

      if (dateFilter !== 'all') {
        if (item.createdAt) {
          const postTime = new Date(item.createdAt).getTime();
          if (!isNaN(postTime)) {
            const diffHours = (Date.now() - postTime) / (1000 * 60 * 60);
            if (dateFilter === 'today' && diffHours > 24) return false;
            if (dateFilter === 'week' && diffHours > 24 * 7) return false;
            if (dateFilter === 'month' && diffHours > 24 * 30) return false;
          }
        }
      }

      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matches =
          item.title.toLowerCase().includes(query) ||
          item.city.toLowerCase().includes(query) ||
          item.area.toLowerCase().includes(query) ||
          (item.sellerName && item.sellerName.toLowerCase().includes(query)) ||
          item.phone.includes(query);
        if (!matches) return false;
      }

      return true;
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
      if (sortOption === 'space_desc') return b.spaceSqM - a.spaceSqM;

      // Default sorting: Featured first, then by date newest first
      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;

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
  } = useInfiniteScroll<RealEstateListing>(filtered, {
    initialCount: 12,
    step: 12,
    dependencies: [filterType, filterCategory, filterCity, filterArea, minPrice, maxPrice, dateFilter, sortOption, searchQuery, selectedRooms, selectedSpaceRange, selectedCladding],
  });

  const handleShareRealEstate = async (item: RealEstateListing) => {
    const res = await shareListingItem({
      title: item.title,
      text: `${language === 'ar' ? 'عقار OMS' : 'OMS Real Estate'}: ${item.title} - ${item.city} (${item.area}) | $${item.priceUSD.toLocaleString()} (${item.priceSYP.toLocaleString()} ل.س)`,
      url: `${window.location.origin}${window.location.pathname}?tab=realestate&id=${item.id}`,
    });
    if (res.success && res.method === 'clipboard') {
      alert(language === 'ar' ? 'تم نسخ رابط ومعلومات العقار بنجاح (Web Share) 📋' : 'Real estate info and link copied to clipboard!');
    }
  };

  const handleToggleRealEstateBookmark = (item: RealEstateListing) => {
    toggleBookmark({
      id: item.id,
      itemType: 'realestate',
      title: item.title,
      subtitle: `${item.city} (${item.area}) • ${item.spaceSqM} م² • ${item.type === 'sale' ? (language === 'ar' ? 'للبيع' : 'For Sale') : (language === 'ar' ? 'للإيجار' : 'For Rent')}`,
      city: item.city,
      priceSYP: item.priceSYP,
      priceUSD: item.priceUSD,
      image: item.images && item.images.length > 0 ? item.images[0] : undefined,
      phone: item.phone,
      savedAt: new Date().toISOString(),
      originalData: item,
    });
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArea.trim()) return;

    const newItem: RealEstateListing = {
      id: `re-${Date.now()}`,
      title: newTitle,
      type: newType,
      category: newCategory,
      city: newCity,
      area: newArea,
      priceUSD: newPriceUSD,
      priceSYP: newPriceUSD * 14950,
      spaceSqM: 110,
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
      phone: newPhone,
      sellerName: newSeller,
      featured: true,
      createdAt: new Date().toISOString(),
    };

    setListings([newItem, ...listings]);
    saveRealEstateToFirestore(newItem).catch((err) => console.error('Failed to save real estate:', err));
    setShowAddModal(false);
    setNewTitle('');
    setNewArea('');
  };

  return (
    <div className="p-4 max-w-7xl w-full mx-auto space-y-6">
      {/* Top Controls & Banner */}
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-400" />
            عقارات وإيجارات المنازل والمحلات في سوريا
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            شقق للبيع والإيجار، محلات تجارية، وأراضي في دمشق وحلب والساحل وريف دمشق.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 space-x-reverse px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة إعلان عقاري جديد</span>
        </button>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {language === 'ar' ? `الكل (${listings.length})` : `All (${listings.length})`}
          </button>

          <button
            onClick={() => setFilterType('rent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'rent' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'إيجارات 🏠' : 'For Rent 🏠'}
          </button>

          <button
            onClick={() => setFilterType('sale')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'sale' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {language === 'ar' ? 'بيع شقق ومحلات 🏢' : 'For Sale 🏢'}
          </button>
        </div>

        {/* Sorting Dropdown & Expandable Filter Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="default" className="bg-slate-900">{language === 'ar' ? 'ترتيب عقاري افتراضي' : 'Default Sorting'}</option>
              <option value="price_asc" className="bg-slate-900">{language === 'ar' ? 'السعر: من الأقل للأعلى 💵' : 'Price: Low to High'}</option>
              <option value="price_desc" className="bg-slate-900">{language === 'ar' ? 'السعر: من الأعلى للأقل 💎' : 'Price: High to Low'}</option>
              <option value="space_desc" className="bg-slate-900">{language === 'ar' ? 'المساحة: الأكبر أولاً 📐' : 'Space: Largest First'}</option>
              <option value="newest" className="bg-slate-900">{language === 'ar' ? 'التاريخ: الأحدث أولاً 📅' : 'Date: Newest First'}</option>
              <option value="oldest" className="bg-slate-900">{language === 'ar' ? 'التاريخ: الأقدم أولاً ⌛' : 'Date: Oldest First'}</option>
            </select>
          </div>

          {/* Advanced Filter Toggle Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'فلترة متقدمة' : 'Filters'}</span>
            {activeFiltersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Real Estate Sub-Category Quick Filter Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
        {[
          { id: 'all', labelAr: 'الكل 🏢', labelEn: 'All' },
          { id: 'hotel', labelAr: '🏨 حجز فندق', labelEn: 'Hotels' },
          { id: 'furnished_room', labelAr: '🛋️ غرفة مفروشة', labelEn: 'Furnished Room' },
          { id: 'farm', labelAr: '🏡 مزرعة وشاليه', labelEn: 'Farm & Chalet' },
          { id: 'apartment', labelAr: '🏢 شقق سكنية', labelEn: 'Apartments' },
          { id: 'house', labelAr: '🏠 بيوت وفلل', labelEn: 'Houses' },
          { id: 'shop', labelAr: '🏪 محلات تجارية', labelEn: 'Shops' },
          { id: 'land', labelAr: '🏞️ أراضي', labelEn: 'Land' },
        ].map((cat) => {
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md shadow-emerald-500/20 scale-105'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {language === 'ar' ? cat.labelAr : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Filter Chips Bar (Price range, Location, Date recency) */}
      <ListingFilterChips
        selectedCity={filterCity}
        onSelectCity={(city) => setFilterCity(city)}
        selectedPricePreset={selectedPricePreset}
        pricePresets={realEstatePricePresets}
        onSelectPricePreset={handleSelectPricePreset}
        selectedDateFilter={dateFilter}
        onSelectDateFilter={(d) => setDateFilter(d)}
        onResetAll={resetFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Advanced Filter Options Drawer */}
      {showAdvancedFilters && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Filter className="w-4 h-4" />
              <span>{language === 'ar' ? 'تخصيص نطاق البحث والفلترة العقارية' : 'Smart Real Estate Filter Console'}</span>
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
            maxVal={maxPrice ? parseFloat(maxPrice) : 100000}
            minLimit={0}
            maxLimit={100000}
            step={200}
            currencySymbol="$"
            onChange={(min, max) => {
              setMinPrice(min > 0 ? min.toString() : '');
              setMaxPrice(max < 100000 ? max.toString() : '');
            }}
            presetRanges={[
              { labelAr: 'إيجار اقتصادي (< $300) 🏠', labelEn: '< $300 Rent', min: 0, max: 300 },
              { labelAr: 'إيجار متوسط ($300 - $1,000) 🔑', labelEn: '$300 - $1k Rent', min: 300, max: 1000 },
              { labelAr: 'شراء متوسط ($1,000 - $30,000) 🏘️', labelEn: '$1k - $30k Buy', min: 1000, max: 30000 },
              { labelAr: 'شراء واستثمار ($30,000 - $80,000) 🏬', labelEn: '$30k - $80k', min: 30000, max: 80000 },
              { labelAr: 'عقارات فاخرة (> $80,000) 💎', labelEn: '> $80k Luxury 💎', min: 80000, max: 100000 },
            ]}
          />

          {/* Smart Location Filter */}
          <SmartLocationFilter
            selectedCity={filterCity}
            onSelectCity={(city) => setFilterCity(city)}
            selectedArea={filterArea}
            onSelectArea={(area) => setFilterArea(area)}
          />

          {/* Smart Real Estate Specifications Filter */}
          <SmartRealEstateSpecsFilter
            selectedCategory={filterCategory}
            onSelectCategory={(cat) => setFilterCategory(cat as any)}
            selectedRooms={selectedRooms}
            onSelectRooms={(rooms) => setSelectedRooms(rooms)}
            selectedSpaceRange={selectedSpaceRange}
            onSelectSpaceRange={(space) => setSelectedSpaceRange(space)}
            selectedCladding={selectedCladding}
            onSelectCladding={(cladding) => setSelectedCladding(cladding)}
            onResetSpecs={handleResetSpecs}
          />
        </div>
      )}

      {/* Grid Listings */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayedItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setDetailItem(item)}
            className="bg-white dark:bg-slate-800/90 border border-emerald-500/25 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/60 transition-all flex flex-col justify-between group cursor-pointer relative"
          >
            {/* Compact Image Container with Lightbox Zoom capability */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setLightboxItem(item);
              }}
              className="relative h-32 sm:h-36 md:h-40 bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-zoom-in group/img"
              title={language === 'ar' ? 'انقر لتكبير الصورة العقارية' : 'Click to zoom property image'}
            >
              <LazyImage
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${
                  item.type === 'rent' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {item.type === 'rent' ? 'إيجار' : 'بيع'}
                </span>
              </div>

              {/* Zoom Hover Overlay Hint */}
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-white text-[10px] font-bold flex items-center gap-1 border border-slate-700/80 backdrop-blur shadow-lg">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'تكبير الصورة 🔍' : 'Zoom Image'}</span>
                </span>
              </div>

              {/* Bookmark & Web Share Overlay Buttons */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxItem(item);
                  }}
                  title={language === 'ar' ? 'تكبير ومعاينة الصورة' : 'Zoom Image Preview'}
                  className="p-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-90 shadow-md cursor-pointer flex items-center justify-center bg-white/80 dark:bg-slate-950/80 text-amber-500 border-slate-200 dark:border-slate-700 hover:bg-amber-400 hover:text-slate-950"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleRealEstateBookmark(item);
                  }}
                  title={isBookmarked(item.id) ? 'محفوظ' : 'حفظ'}
                  className={`p-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-90 shadow-md cursor-pointer ${
                    isBookmarked(item.id)
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-white/80 dark:bg-slate-950/80 text-amber-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isBookmarked(item.id) ? (
                    <BookmarkCheck className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <span className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded-md border border-slate-700 backdrop-blur font-medium flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                <span>{item.city} ({item.area})</span>
              </span>
            </div>

            {/* Compact Card Body */}
            <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <PostDateBadge createdAt={item.createdAt} fallbackIndex={index} />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-500 transition-colors pt-0.5">
                  {item.title}
                </h3>
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

              {/* Quick Reserve/Call Buttons */}
              <div className="flex items-center gap-1 pt-0.5" onClick={(e) => e.stopPropagation()}>
                <a
                  href={`tel:${item.phone}`}
                  className="flex-1 h-7 flex items-center justify-center gap-1 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] transition-all shadow-xs active:scale-95 shrink-0"
                >
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">{language === 'ar' ? 'اتصال' : 'Call'}</span>
                </a>

                <button
                  onClick={() => {
                    setPaymentItem({
                      id: item.id,
                      title: item.title,
                      priceUSD: item.priceUSD,
                      priceSYP: item.priceSYP,
                      image: item.images[0],
                      type: 'real_estate',
                    });
                    setIsPaymentOpen(true);
                  }}
                  className="flex-1 h-7 flex items-center justify-center gap-1 py-1 px-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-lg text-[10px] transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                >
                  <CreditCard className="w-3 h-3 text-slate-950 shrink-0" />
                  <span>{language === 'ar' ? 'حجز 🛒' : 'Reserve'}</span>
                </button>

                <button
                  onClick={() => setShareItem(item)}
                  title={language === 'ar' ? 'مشاركة الإعلان العقاري (واتساب، تليجرام، رابط)' : 'Share Property'}
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

      {/* Share Real Estate Item Modal */}
      <ShareAppModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        url={shareItem ? `${window.location.origin}${window.location.pathname}?tab=realestate&id=${shareItem.id}` : ''}
        title={shareItem ? `${shareItem.title} - ${shareItem.city} (${shareItem.priceUSD}$)` : ''}
        description={shareItem ? `إعلان عقاري مميز عبر منصة OMS: ${shareItem.title} في ${shareItem.city} (${shareItem.area}) - بسعر $${shareItem.priceUSD.toLocaleString()}` : ''}
      />

      {/* Report Post Modal */}
      <ReportModal
        isOpen={!!reportItem}
        onClose={() => setReportItem(null)}
        postId={reportItem?.id || ''}
        postTitle={reportItem?.title || ''}
        postCategory="عقارات"
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
              إضافة إعلان عقاري جديد OMS
            </h3>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">عنوان الإعلان</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: شقة 3 غرف وصالة للمكتب أو السكن..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">نوع العرض</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'rent' | 'sale')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="rent">إيجار</option>
                    <option value="sale">بيع</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">نوع العقار</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="apartment">🏢 شقة سكنية</option>
                    <option value="hotel">🏨 حجز فندق / جناح فندقي</option>
                    <option value="furnished_room">🛋️ غرفة مفروشة للايجار</option>
                    <option value="farm">🏡 مزرعة وشاليه للاستجمام</option>
                    <option value="house">🏠 منزل/فيلا</option>
                    <option value="shop">🏪 محل تجاري</option>
                    <option value="land">🏞️ أرض</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">المحافظة</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">المنطقة/الشارع</label>
                  <input
                    type="text"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="مثال: المزة، الشعلان، الجميلية..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">السعر ($)</label>
                  <input
                    type="number"
                    value={newPriceUSD}
                    onChange={(e) => setNewPriceUSD(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">رقم الهاتف للاتصال</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white dir-ltr text-left"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg"
                >
                  نشر الإعلان العقاري فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Real Estate Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem) {
            setListings((prev) => prev.filter((l) => l.id !== deleteItem.id));
            setDeleteItem(null);
          }
        }}
        title={language === 'ar' ? 'تأكيد حذف الإعلان العقاري' : 'Confirm Real Estate Listing Deletion'}
        message={
          language === 'ar'
            ? 'هل أنت متأكد من رغبتك في حذف هذا العقار بشكل نهائي؟ لا يمكن التراجع عن هذه العملية.'
            : 'Are you sure you want to permanently delete this property listing?'
        }
        itemName={deleteItem ? `${deleteItem.title} (${deleteItem.city})` : ''}
        confirmText={language === 'ar' ? 'نعم، احذف العقار' : 'Yes, Delete Property'}
      />

      {/* Payment & Reservation Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        item={paymentItem}
      />

      {/* Real Estate Detail Modal */}
      <AdDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        itemType="realestate"
        onOpenOffer={() => {}}
        onOpenPayment={(item) => {
          setDetailItem(null);
          setPaymentItem({
            id: item.id,
            title: item.title,
            priceUSD: item.priceUSD,
            priceSYP: item.priceSYP,
            image: item.images?.[0] || item.image,
            type: 'real_estate',
          });
          setIsPaymentOpen(true);
        }}
        onOpenShare={(item) => {
          setDetailItem(null);
          setShareItem(item);
        }}
        onOpenReport={(item) => {
          setDetailItem(null);
          setReportItem(item);
        }}
      />

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!lightboxItem}
        onClose={() => setLightboxItem(null)}
        imageUrl={lightboxItem?.images?.[0] || ''}
        title={lightboxItem?.title || ''}
        priceUSD={lightboxItem?.priceUSD}
        priceSYP={lightboxItem?.priceSYP}
        city={lightboxItem?.city}
        phone={lightboxItem?.phone}
        images={lightboxItem?.images || []}
        onReserve={() => {
          if (lightboxItem) {
            setPaymentItem({
              id: lightboxItem.id,
              title: lightboxItem.title,
              priceUSD: lightboxItem.priceUSD,
              priceSYP: lightboxItem.priceSYP,
              image: lightboxItem.images?.[0] || '',
              type: 'real_estate',
            });
            setIsPaymentOpen(true);
            setLightboxItem(null);
          }
        }}
        onShare={() => {
          if (lightboxItem) {
            handleShareRealEstate(lightboxItem);
          }
        }}
      />
    </div>
  );
};
