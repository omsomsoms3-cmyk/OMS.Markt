import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowUpDown, ArrowUp, Sparkles, MapPin, Filter, RefreshCw, X, ChevronDown, SlidersHorizontal, Check } from 'lucide-react';
import { INTERNATIONAL_COUNTRIES } from '../lib/locations';

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'space_desc';

interface FloatingSortFilterMenuProps {
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onResetAll?: () => void;
  activeFiltersCount?: number;
  titleAr?: string;
  titleEn?: string;
}

const TOP_SYRIAN_CITIES = [
  { nameAr: 'الكل', nameEn: 'All', value: 'all' },
  { nameAr: 'دمشق', nameEn: 'Damascus', value: 'دمشق' },
  { nameAr: 'ريف دمشق', nameEn: 'Rural Damascus', value: 'ريف دمشق' },
  { nameAr: 'حلب', nameEn: 'Aleppo', value: 'حلب' },
  { nameAr: 'حمص', nameEn: 'Homs', value: 'حمص' },
  { nameAr: 'اللاذقية', nameEn: 'Lattakia', value: 'اللاذقية' },
  { nameAr: 'طرطوس', nameEn: 'Tartous', value: 'طرطوس' },
  { nameAr: 'حماة', nameEn: 'Hama', value: 'حماة' },
];

export const FloatingSortFilterMenu: React.FC<FloatingSortFilterMenuProps> = ({
  sortOption,
  onSelectSort,
  selectedCity,
  onSelectCity,
  onResetAll,
  activeFiltersCount = 0,
  titleAr = 'ترتيب وفلترة العروض',
  titleEn = 'Sort & Filter',
}) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  return (
    <>
      {/* Sticky Ultra-Slim Top Bar */}
      <div className="sticky top-16 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-md transition-all my-3 text-xs overflow-hidden dir-rtl">
        {/* Main Super Slim Single-Line Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/80">
          {/* Left Badge & Title */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="p-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="font-extrabold text-[11px] text-white hidden sm:inline">
              {language === 'ar' ? titleAr : titleEn}
            </span>
            {(activeFiltersCount > 0 || sortOption !== 'default') && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                {activeFiltersCount || '1'}
              </span>
            )}
          </div>

          {/* Middle Merged Scrollable Quick Sort & Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1 max-w-full">
            {/* Price Ascending Pill */}
            <button
              type="button"
              onClick={() => onSelectSort(sortOption === 'price_asc' ? 'default' : 'price_asc')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1 border ${
                sortOption === 'price_asc'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-xs'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <ArrowUp className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{language === 'ar' ? 'الأقل سعراً 💵' : 'Price: Low'}</span>
            </button>

            {/* Newest Pill */}
            <button
              type="button"
              onClick={() => onSelectSort(sortOption === 'newest' ? 'default' : 'newest')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1 border ${
                sortOption === 'newest'
                  ? 'bg-emerald-600 text-white font-black border-emerald-400 shadow-xs'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{language === 'ar' ? 'الأحدث ⚡' : 'Recent'}</span>
            </button>

            {/* Quick Location Select Pill */}
            <div className="relative shrink-0">
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-lg px-2 py-0.5 text-[11px]">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-[11px]"
                >
                  <option value="all" className="bg-slate-900">
                    {language === 'ar' ? 'كل المواقع 📍' : 'All Places 📍'}
                  </option>
                  {TOP_SYRIAN_CITIES.slice(1).map((c) => (
                    <option key={c.value} value={c.value} className="bg-slate-900">
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Action & Expand Arrow Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onResetAll && (activeFiltersCount > 0 || sortOption !== 'default' || selectedCity !== 'all') && (
              <button
                type="button"
                onClick={onResetAll}
                title={language === 'ar' ? 'إعادة ضبط الترتيب' : 'Reset Sort'}
                className="p-1 text-[10px] text-rose-400 font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden md:inline">{language === 'ar' ? 'مسح' : 'Reset'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 text-[11px] font-black text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
              title={isExpanded ? 'إخفاء خيارات الترتيب' : 'توسيع خيارات الترتيب والفلترة الكاملة'}
            >
              <span>{isExpanded ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'توسيع 🔽' : 'More 🔽')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expanded Sorting & Location Options Row */}
        {isExpanded && (
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-3 animate-fadeIn">
            {/* All Sort Modes */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 block">
                {language === 'ar' ? 'اختر طريقة ترتيب المنشورات:' : 'Choose Sorting Order:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectSort('price_asc')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    sortOption === 'price_asc'
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'الأقل سعراً' : 'Price: Low'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSort('price_desc')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    sortOption === 'price_desc'
                      ? 'bg-indigo-600 text-white font-black border-indigo-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{language === 'ar' ? 'الأعلى سعراً' : 'Price: High'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSort('newest')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    sortOption === 'newest'
                      ? 'bg-emerald-600 text-white font-black border-emerald-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'ar' ? 'الأحدث أولاً' : 'Newest First'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSort('default')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    sortOption === 'default'
                      ? 'bg-cyan-600 text-white font-black border-cyan-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <span>{language === 'ar' ? 'الافتراضي ⭐' : 'Default'}</span>
                </button>
              </div>
            </div>

            {/* Quick Location Buttons */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'ar' ? 'تصفية سريعة بالمدينة:' : 'Filter by City:'}</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {TOP_SYRIAN_CITIES.map((city) => {
                  const isSelected = selectedCity === city.value;
                  return (
                    <button
                      key={city.value}
                      type="button"
                      onClick={() => onSelectCity(city.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border border-indigo-400 shadow-xs'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-amber-300" />}
                      <span>{language === 'ar' ? city.nameAr : city.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Side Button on Bottom Left (for easy access while scrolling) */}
      <button
        type="button"
        onClick={() => setIsOpenSidebar(true)}
        className="fixed bottom-20 left-4 z-30 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-3.5 rounded-full shadow-2xl border-2 border-slate-900 transition-all hover:scale-110 active:scale-90 cursor-pointer flex items-center gap-2 group"
        title={language === 'ar' ? 'قائمة الفلترة والترتيب العائمة 📑' : 'Floating Sort & Filter'}
      >
        <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-black hidden sm:inline pr-1">
          {language === 'ar' ? 'فلترة وترتيب' : 'Sort & Filter'}
        </span>
        {(activeFiltersCount > 0 || sortOption !== 'default') && (
          <span className="w-3 h-3 rounded-full bg-slate-950 border-2 border-amber-400 animate-ping"></span>
        )}
      </button>

      {/* Floating Sidebar Modal / Overlay */}
      {isOpenSidebar && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end animate-in fade-in duration-200">
          <div className="bg-slate-900 border-r border-slate-800 w-full max-w-sm h-full p-5 overflow-y-auto space-y-5 shadow-2xl dir-rtl flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {language === 'ar' ? titleAr : titleEn}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {language === 'ar' ? 'القائمة العائمة للترتيب والفلترة الجغرافية' : 'Floating sidebar filter'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenSidebar(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sorting Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>{language === 'ar' ? 'خيارات الترتيب والتنظيم:' : 'Sort Options:'}</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectSort('price_asc')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      sortOption === 'price_asc'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-amber-400" />
                      <span>{language === 'ar' ? 'السعر: من الأقل للأعلى 💵' : 'Price: Low to High'}</span>
                    </span>
                    {sortOption === 'price_asc' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSort('newest')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      sortOption === 'newest'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-black'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'ar' ? 'الأحدث أولاً (التاريخ) ⚡' : 'Recent / Newest'}</span>
                    </span>
                    {sortOption === 'newest' && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSort('price_desc')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      sortOption === 'price_desc'
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-black'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-indigo-400" />
                      <span>{language === 'ar' ? 'السعر: من الأعلى للأقل 💎' : 'Price: High to Low'}</span>
                    </span>
                    {sortOption === 'price_desc' && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSort('default')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      sortOption === 'default'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-black'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{language === 'ar' ? 'الترتيب الافتراضي (المميزة أولاً)' : 'Default Sorting'}</span>
                    {sortOption === 'default' && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                </div>
              </div>

              {/* Location Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تحديد المحافظة أو الموقع الجغرافي:' : 'Filter by Location:'}</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">{language === 'ar' ? 'جميع المناطق والمدن 🌍' : 'All Regions & Cities'}</option>
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
            </div>

            {/* Footer Buttons */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              {onResetAll && (
                <button
                  type="button"
                  onClick={onResetAll}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إعادة ضبط كل الفلاتر' : 'Reset All Filters'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpenSidebar(false)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                {language === 'ar' ? 'عرض نتائج الفلترة 🚀' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
