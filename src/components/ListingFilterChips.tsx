import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DollarSign, MapPin, Clock, RefreshCw, Filter, Sparkles, Tag, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

export interface PricePresetOption {
  id: string;
  labelAr: string;
  labelEn: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ListingFilterChipsProps {
  // Location Chips
  selectedCity: string;
  onSelectCity: (city: string) => void;
  customCities?: string[];

  // Price Range Chips
  selectedPricePreset: string;
  pricePresets: PricePresetOption[];
  onSelectPricePreset: (presetId: string, min?: number, max?: number) => void;

  // Date Recency Chips
  selectedDateFilter: 'all' | 'today' | 'week' | 'month';
  onSelectDateFilter: (filter: 'all' | 'today' | 'week' | 'month') => void;

  // Reset Callback
  onResetAll?: () => void;
  activeFiltersCount?: number;
}

export const POPULAR_CITIES = [
  { id: 'all', labelAr: 'الكل 🌍', labelEn: 'All 🌍' },
  { id: 'دمشق', labelAr: 'دمشق 🏛️', labelEn: 'Damascus 🏛️' },
  { id: 'ريف دمشق', labelAr: 'ريف دمشق 🌳', labelEn: 'Rif Dimashq 🌳' },
  { id: 'حلب', labelAr: 'حلب 🏰', labelEn: 'Aleppo 🏰' },
  { id: 'حمص', labelAr: 'حمص 🏙️', labelEn: 'Homs 🏙️' },
  { id: 'اللاذقية', labelAr: 'اللاذقية 🏖️', labelEn: 'Latakia 🏖️' },
  { id: 'طرطوس', labelAr: 'طرطوس ⚓', labelEn: 'Tartous ⚓' },
  { id: 'حماة', labelAr: 'حماة 🌾', labelEn: 'Hama 🌾' },
  { id: 'الرياض', labelAr: 'الرياض 🇸🇦', labelEn: 'Riyadh 🇸🇦' },
  { id: 'دبي', labelAr: 'دبي 🇦🇪', labelEn: 'Dubai 🇦🇪' },
  { id: 'برلين', labelAr: 'برلين 🇩🇪', labelEn: 'Berlin 🇩🇪' },
];

export const ListingFilterChips: React.FC<ListingFilterChipsProps> = ({
  selectedCity,
  onSelectCity,
  selectedPricePreset,
  pricePresets,
  onSelectPricePreset,
  selectedDateFilter,
  onSelectDateFilter,
  onResetAll,
  activeFiltersCount = 0,
}) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const dateOptions: { id: 'all' | 'today' | 'week' | 'month'; labelAr: string; labelEn: string; icon: string }[] = [
    { id: 'all', labelAr: 'كل الأوقات 📅', labelEn: 'All Time 📅', icon: '📅' },
    { id: 'today', labelAr: 'اليوم (24 س) ⚡', labelEn: 'Today ⚡', icon: '⚡' },
    { id: 'week', labelAr: 'هذا الأسبوع 🚀', labelEn: 'This Week 🚀', icon: '🚀' },
    { id: 'month', labelAr: 'هذا الشهر 🗓️', labelEn: 'This Month 🗓️', icon: '🗓️' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-emerald-500/25 dark:border-slate-800 rounded-2xl shadow-sm text-slate-900 dark:text-slate-100 overflow-hidden transition-all duration-300">
      {/* Super Slim Merged Filter Bar Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 text-xs">
        {/* Left Badge & Title */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="p-1 bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-lg flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 hidden sm:inline">
            {language === 'ar' ? 'الفلاتر:' : 'Filters:'}
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {/* Middle Merged Single-Line Scrollable Chips (Collapsed Preview Mode) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none flex-1 max-w-full">
          {/* Quick Cities */}
          {POPULAR_CITIES.slice(0, 6).map((c) => {
            const isSelected = selectedCity === c.id || (c.id !== 'all' && selectedCity.includes(c.id));
            return (
              <button
                key={`slim-city-${c.id}`}
                onClick={() => onSelectCity(c.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs border border-emerald-400'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <span>{language === 'ar' ? c.labelAr : c.labelEn}</span>
              </button>
            );
          })}

          {/* Quick Date Filters */}
          {dateOptions.slice(1).map((d) => {
            const isSelected = selectedDateFilter === d.id;
            return (
              <button
                key={`slim-date-${d.id}`}
                onClick={() => onSelectDateFilter(d.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs border border-sky-400'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <span>{language === 'ar' ? d.labelAr : d.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Right Toggle Arrow Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onResetAll && activeFiltersCount > 0 && (
            <button
              onClick={onResetAll}
              title={language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
              className="p-1 text-[10px] text-rose-500 hover:text-rose-400 font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden md:inline">{language === 'ar' ? 'مسح' : 'Reset'}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
            title={isExpanded ? 'إخفاء الفلاتر التفصيلية' : 'توسيع كل الفلاتر'}
          >
            <span>{isExpanded ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'توسيع 🔽' : 'More 🔽')}</span>
            <ChevronDown className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Categorized Rows (Dropdown View when user clicks expand arrow) */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 animate-fadeIn text-xs">
          {/* Row 1: Location Chips */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'ar' ? 'المدينة والموقع الجغرافي:' : 'Filter by Location:'}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {POPULAR_CITIES.map((c) => {
                const isSelected = selectedCity === c.id || (c.id !== 'all' && selectedCity.includes(c.id));
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCity(c.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs border border-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{language === 'ar' ? c.labelAr : c.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Price Range Chips */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'ar' ? 'نطاق السعر ($ USD):' : 'Filter by Price Range ($):'}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {pricePresets.map((p) => {
                const isSelected = selectedPricePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPricePreset(p.id, p.minPrice, p.maxPrice)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs border border-amber-300'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Tag className="w-3 h-3 opacity-70" />
                    <span>{language === 'ar' ? p.labelAr : p.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Date Recency Chips */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>{language === 'ar' ? 'تاريخ النشر والحداثة:' : 'Filter by Date:'}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {dateOptions.map((d) => {
                const isSelected = selectedDateFilter === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onSelectDateFilter(d.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs border border-sky-400'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{language === 'ar' ? d.labelAr : d.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

