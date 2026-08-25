import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Wheat, 
  Apple, 
  Egg, 
  Cake, 
  Coffee, 
  ShieldCheck, 
  Layers, 
  BadgePercent,
  ExternalLink,
  MapPin,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Bookmark
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';
import { SyrianGoodItem, SYRIAN_GOODS_CATEGORIES, INITIAL_SYRIAN_GOODS } from '../data/syrianGoodsData';
import { LazyImage } from './LazyImage';

interface SyrianGoodsSectionProps {
  searchQuery?: string;
  onRefresh?: () => void;
  isSyncing?: boolean;
}

export const SyrianGoodsSection: React.FC<SyrianGoodsSectionProps> = ({
  searchQuery = '',
  onRefresh,
  isSyncing = false,
}) => {
  const { language, isRtl } = useLanguage();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [syrianOnlyFilter, setSyrianOnlyFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'change'>('default');
  const [selectedItemForModal, setSelectedItemForModal] = useState<SyrianGoodItem | null>(null);
  const [localSearch, setLocalSearch] = useState<string>('');

  const handleToggleBookmarkGood = (item: SyrianGoodItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleBookmark({
      id: item.id,
      itemType: 'goods',
      title: item.nameAr,
      subtitle: `${item.unit} • ${item.categoryAr} • ${item.isSyrianMade ? 'منتج سوري أصلي 🇸🇾' : 'سلعة مستوردة'}`,
      city: item.famousOrigin || 'سورية - كافة المحافظات',
      priceUSD: item.priceUSD,
      priceSYP: item.priceSYP,
      image: item.image,
      phone: '0944000000',
      savedAt: new Date().toLocaleDateString('ar-SY'),
      originalData: item,
    });
  };

  const effectiveSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredGoods = useMemo(() => {
    return INITIAL_SYRIAN_GOODS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Syrian-made only
      if (syrianOnlyFilter && !item.isSyrianMade) {
        return false;
      }
      // Search filter
      if (effectiveSearch) {
        const matchesName = item.nameAr.toLowerCase().includes(effectiveSearch) || item.nameEn.toLowerCase().includes(effectiveSearch);
        const matchesDesc = item.descriptionAr.toLowerCase().includes(effectiveSearch) || item.descriptionEn.toLowerCase().includes(effectiveSearch);
        const matchesOrigin = item.famousOrigin?.toLowerCase().includes(effectiveSearch);
        const matchesBrands = item.popularBrands?.some(b => b.toLowerCase().includes(effectiveSearch));
        if (!matchesName && !matchesDesc && !matchesOrigin && !matchesBrands) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceSYP - b.priceSYP;
      if (sortBy === 'price_desc') return b.priceSYP - a.priceSYP;
      if (sortBy === 'change') return Math.abs(b.change24h) - Math.abs(a.change24h);
      return 0;
    });
  }, [selectedCategory, syrianOnlyFilter, effectiveSearch, sortBy]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wheat': return <Wheat className="w-4 h-4" />;
      case 'Apple': return <Apple className="w-4 h-4" />;
      case 'Egg': return <Egg className="w-4 h-4" />;
      case 'Cake': return <Cake className="w-4 h-4" />;
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Slider */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'نشرة أسعار السلع والمنتجات السورية اليومية' : 'Daily Syrian Goods & Commodity Prices'}</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {filteredGoods.length} {language === 'ar' ? 'سلعة موثقة' : 'Items'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'أسعار فعلية حية مستقاة من أسواق الهال، بورصة التموين، ومنافذ التجارة السورية الموثوقة'
                  : 'Real actual prices tracked from local wholesale markets and official commerce bulletins.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button
              type="button"
              onClick={() => setSyrianOnlyFilter(!syrianOnlyFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                syrianOnlyFilter
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/40'
              }`}
            >
              <span>🇸🇾</span>
              <span>{language === 'ar' ? 'صنع في سوريا فقط' : '100% Syrian Made'}</span>
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isSyncing}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                title={language === 'ar' ? 'تحديث الأسعار' : 'Refresh'}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Search and Sort toolbar */}
        <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث عن سلعة، ماركة، أو مدينة سورية (مثل: زيت، صابون، فستق)...' : 'Search goods, brands, or cities...'}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 text-white text-xs rounded-xl pr-9 pl-4 py-2 outline-none transition-all placeholder:text-slate-500"
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap">{language === 'ar' ? 'ترتيب حسب:' : 'Sort:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950/90 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="default">{language === 'ar' ? 'الافتراضي' : 'Default'}</option>
              <option value="price_asc">{language === 'ar' ? 'السعر (من الأقل للأعلى)' : 'Price: Low to High'}</option>
              <option value="price_desc">{language === 'ar' ? 'السعر (من الأعلى للأقل)' : 'Price: High to Low'}</option>
              <option value="change">{language === 'ar' ? 'نسبة التغير اليومي' : 'Highest 24h Change'}</option>
            </select>
          </div>
        </div>

        {/* Category horizontal filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-3">
          {SYRIAN_GOODS_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-black'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span>{getCategoryIcon(cat.icon)}</span>
                <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Syrian Goods Grid */}
      {filteredGoods.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="text-white font-bold text-base">
            {language === 'ar' ? 'لا توجد سلع مطابقة لخيارات البحث' : 'No goods found matching your search'}
          </h4>
          <p className="text-xs text-slate-400">
            {language === 'ar' ? 'جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً من شريط الأقسام' : 'Try searching different keywords or selecting another category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoods.map((item) => {
            const isSaved = isBookmarked(item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemForModal(item)}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer group flex flex-col justify-between space-y-3 relative"
              >
                {/* Header & Badges */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {item.isSyrianMade && (
                      <span className="absolute bottom-0 right-0 left-0 bg-emerald-950/90 text-emerald-300 text-[8px] font-black text-center py-0.5 backdrop-blur-xs">
                        🇸🇾 سوري أصلي
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold truncate">
                        {item.categoryAr}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {item.change24h !== 0 && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                              item.change24h > 0
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.change24h > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {item.change24h > 0 ? `+${item.change24h}%` : `${item.change24h}%`}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmarkGood(item, e)}
                          className={`p-1 rounded-md border transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                          }`}
                          title={language === 'ar' ? 'حفظ في المفضلة' : 'Save'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-white text-sm mt-1 leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {language === 'ar' ? item.nameAr : item.nameEn}
                    </h4>

                    {item.famousOrigin && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{item.famousOrigin}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Display Box */}
                <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-bold">{item.unit}</span>
                    <div className="text-left">
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {item.priceSYP.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 mr-1 font-bold">ل.س</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-900 pt-1">
                    <span>
                      {language === 'ar' ? 'ما يعادل:' : 'USD Eqv:'}{' '}
                      <span className="text-sky-300 font-bold font-mono">${item.priceUSD.toFixed(2)}</span>
                    </span>
                    <span>
                      {language === 'ar' ? 'متوسط السوق:' : 'Avg:'}{' '}
                      <span className="text-slate-300 font-mono">{item.marketAverageSYP.toLocaleString()} ل.س</span>
                    </span>
                  </div>
                </div>

                {/* Footer Source info */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1 truncate text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{item.verifiedOnlineSource}</span>
                  </span>
                  <span className="shrink-0 text-slate-500 font-mono text-[9px]">
                    {item.lastUpdated}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Syrian Product Detail Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fadeIn">
            <div className="relative h-48 w-full bg-slate-950">
              <LazyImage
                src={selectedItemForModal.image}
                alt={selectedItemForModal.nameAr}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/60" />
              <button
                type="button"
                onClick={() => setSelectedItemForModal(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 transition-all"
              >
                ✕
              </button>
              {selectedItemForModal.isSyrianMade && (
                <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border border-emerald-400">
                  🇸🇾 منتج سوري أصلي
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                  {selectedItemForModal.categoryAr}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {selectedItemForModal.nameAr}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedItemForModal.nameEn}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{language === 'ar' ? 'الوحدة / العبوة:' : 'Unit:'}</span>
                  <span className="text-sm font-bold text-white">{selectedItemForModal.unit}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-900 pt-2">
                  <span className="text-xs text-slate-400">{language === 'ar' ? 'السعر الفعلي الحالي:' : 'Current Price:'}</span>
                  <div className="text-left">
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {selectedItemForModal.priceSYP.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 mr-1 font-bold">ل.س</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-xs">
                  <span className="text-slate-400">{language === 'ar' ? 'المعادل بالدولار الأمريكي:' : 'USD Value:'}</span>
                  <span className="text-sky-400 font-bold font-mono">${selectedItemForModal.priceUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-xs">
                  <span className="text-slate-400">{language === 'ar' ? 'نطاق الأسعار في السوق:' : 'Market Range:'}</span>
                  <span className="text-slate-300 font-mono">
                    {selectedItemForModal.minPriceSYP.toLocaleString()} - {selectedItemForModal.maxPriceSYP.toLocaleString()} ل.س
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                {selectedItemForModal.descriptionAr}
              </p>

              {selectedItemForModal.popularBrands && (
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'أشهر الماركات والمنتجين:' : 'Popular Brands:'}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItemForModal.popularBrands.map((brand, idx) => (
                      <span key={idx} className="bg-slate-800 text-amber-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-bold">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{selectedItemForModal.verifiedOnlineSource}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">{selectedItemForModal.lastUpdated}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleBookmarkGood(selectedItemForModal, e)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    isBookmarked(selectedItemForModal.id)
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title={language === 'ar' ? 'حفظ في المفضلة' : 'Save to Bookmarks'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked(selectedItemForModal.id) ? 'fill-amber-400' : ''}`} />
                  <span>{isBookmarked(selectedItemForModal.id) ? (language === 'ar' ? 'محفوظ' : 'Saved') : (language === 'ar' ? 'حفظ' : 'Bookmark')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedItemForModal(null)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق نافذة السلعة' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
