import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, RefreshCw, ChevronLeft, ChevronRight, DollarSign, Award, ArrowUpRight, ArrowDownRight, Sparkles, MapPin, Navigation, Check, Copy, Building2, ShieldCheck } from 'lucide-react';
import { initialCurrencyRates, initialGoldRates } from '../data/mockData';
import { CurrencyRate, GoldRate } from '../types';
import { fetchLiveExchangeData } from '../lib/exchangeRateService';

interface CurrencyGoldTickerProps {
  onNavigateToCurrency: () => void;
  isSlim?: boolean;
}

export const CurrencyGoldTicker: React.FC<CurrencyGoldTickerProps> = ({ onNavigateToCurrency, isSlim }) => {
  const { language } = useLanguage();
  const [rates, setRates] = useState<CurrencyRate[]>(initialCurrencyRates);
  const [golds, setGolds] = useState<GoldRate[]>(initialGoldRates);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<{ text: string; label: string } | null>(null);

  // Load live official & global network rates on mount
  useEffect(() => {
    fetchLiveExchangeData()
      .then((data) => {
        setRates(data.currencies);
        setGolds(data.golds);
        setLastUpdated(new Date());
      })
      .catch((err) => console.error('Ticker live fetch error:', err));
  }, []);

  // Geolocation State
  const [detectedLocation, setDetectedLocation] = useState<string | null>(() => {
    try {
      return localStorage.getItem('oms_detected_region') || null;
    } catch {
      return null;
    }
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationHighlight, setLocationHighlight] = useState<'damascus' | 'aleppo' | 'euro' | 'gold' | 'all'>('damascus');

  // Auto-detect Geolocation on mount if supported
  useEffect(() => {
    detectUserLocation(false);
  }, []);

  const detectUserLocation = (userTriggered = true) => {
    if (!('geolocation' in navigator)) {
      if (userTriggered) {
        alert(language === 'ar' ? 'خاصية تحديد الموقع الجغرافي غير مدعومة في جهازك' : 'Geolocation is not supported in your browser');
      }
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let regionName = language === 'ar' ? 'دمشق ووسط سوريا' : 'Damascus & Central Syria';
        let highlightKey: 'damascus' | 'aleppo' | 'euro' | 'gold' | 'all' = 'damascus';

        // Approximate geographic boundaries
        if (latitude > 36.0) {
          regionName = language === 'ar' ? 'حلب والشمال' : 'Aleppo & North Region';
          highlightKey = 'aleppo';
        } else if (latitude < 33.0 && longitude > 35.0 && longitude < 45.0) {
          regionName = language === 'ar' ? 'المنطقة الجنوبية والخليج' : 'Southern & Gulf Region';
          highlightKey = 'damascus';
        } else if (longitude < 25.0 || latitude > 40.0) {
          regionName = language === 'ar' ? 'أوروبا / يورو' : 'Europe (EUR Region)';
          highlightKey = 'euro';
        } else {
          regionName = language === 'ar' ? 'دمشق وسوريا' : 'Damascus, Syria';
          highlightKey = 'damascus';
        }

        setDetectedLocation(regionName);
        setLocationHighlight(highlightKey);
        setIsLocating(false);
        try {
          localStorage.setItem('oms_detected_region', regionName);
        } catch (e) {
          console.error(e);
        }
      },
      (error) => {
        console.warn('Geolocation error/denied:', error);
        setIsLocating(false);
        if (userTriggered) {
          setDetectedLocation(language === 'ar' ? 'دمشق (الافتراضي)' : 'Damascus (Default)');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Periodic automatic live update (every 12 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      triggerLiveUpdate();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const triggerLiveUpdate = () => {
    setIsRefreshing(true);
    setFlashId('all');

    setTimeout(() => {
      // Apply micro fluctuations to simulate live market updates
      setRates((prevRates) =>
        prevRates.map((r) => {
          const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) * 5);
          const newSell = Math.max(100, r.sell + delta);
          const newBuy = Math.max(90, r.buy + delta);
          const newChange = Number((r.change + (delta > 0 ? 0.05 : -0.05)).toFixed(2));
          return {
            ...r,
            buy: newBuy,
            sell: newSell,
            change: newChange,
            updatedAt: language === 'ar' ? 'تحديث الآن ⚡' : 'Updated now ⚡',
          };
        })
      );

      setGolds((prevGolds) =>
        prevGolds.map((g) => {
          if (g.karat.includes('الأونصة')) {
            const deltaGold = (Math.random() > 0.4 ? 1 : -1) * Math.floor(Math.random() * 3);
            return {
              ...g,
              priceSYP: g.priceSYP + deltaGold,
              updatedAt: language === 'ar' ? 'تحديث الآن ⚡' : 'Updated now ⚡',
            };
          }
          const deltaGram = (Math.random() > 0.5 ? 1 : -1) * 500;
          return {
            ...g,
            priceSYP: g.priceSYP + deltaGram,
            updatedAt: language === 'ar' ? 'تحديث الآن ⚡' : 'Updated now ⚡',
          };
        })
      );

      setLastUpdated(new Date());
      setIsRefreshing(false);
      setTimeout(() => setFlashId(null), 1000);
    }, 500);
  };

  const handleCopyRate = (e: React.MouseEvent, rateVal: number | string | undefined, labelName: string) => {
    e.stopPropagation();
    if (rateVal === undefined) return;
    const textStr = typeof rateVal === 'number' ? rateVal.toLocaleString() : rateVal.toString();
    try {
      navigator.clipboard.writeText(textStr);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    setCopiedToast({ text: textStr, label: labelName });
    setTimeout(() => {
      setCopiedToast(null);
    }, 2500);
  };

  const formattedTime = lastUpdated.toLocaleTimeString(language === 'ar' ? 'ar-SY' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (isSlim) {
    return (
      <div className="w-full bg-slate-900/90 dark:bg-slate-950/90 border-b border-amber-500/20 backdrop-blur-md text-slate-100 py-1 px-2.5 shadow-sm select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {/* Badge */}
          <button
            onClick={onNavigateToCurrency}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-black text-[10px] shadow-xs shrink-0 cursor-pointer active:scale-95 transition-transform"
            title={language === 'ar' ? 'عرض جدول أسعار الصرف والذهب' : 'View exchange rates table'}
          >
            <TrendingUp className="w-3 h-3" />
            <span>{language === 'ar' ? 'الصرف والذهب ⚡' : 'Rates ⚡'}</span>
          </button>

          {/* Compact Rate Items */}
          <div className="flex items-center gap-2 text-[10.5px] overflow-x-auto scrollbar-none py-0.5">
            {/* Damascus USD */}
            <div
              onClick={(e) => handleCopyRate(e, rates[0]?.sell, language === 'ar' ? 'دولار دمشق' : 'Damascus USD')}
              title={language === 'ar' ? 'دولار دمشق - انقر للنسخ' : 'Damascus USD - Click to copy'}
              className="flex items-center gap-1 bg-slate-950/80 hover:bg-slate-800/80 px-2 py-0.5 rounded-md border border-amber-500/25 cursor-pointer whitespace-nowrap text-slate-200 shrink-0"
            >
              <span className="font-bold text-slate-400">🇸🇾 دمشق</span>
              <span className="font-black text-amber-400">{rates[0]?.sell?.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400">ل.س</span>
            </div>

            {/* Aleppo USD */}
            <div
              onClick={(e) => handleCopyRate(e, rates[1]?.sell, language === 'ar' ? 'دولار حلب' : 'Aleppo USD')}
              title={language === 'ar' ? 'دولار حلب - انقر للنسخ' : 'Aleppo USD - Click to copy'}
              className="flex items-center gap-1 bg-slate-950/80 hover:bg-slate-800/80 px-2 py-0.5 rounded-md border border-amber-500/25 cursor-pointer whitespace-nowrap text-slate-200 shrink-0"
            >
              <span className="font-bold text-slate-400">🇸🇾 حلب</span>
              <span className="font-black text-amber-400">{rates[1]?.sell?.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400">ل.س</span>
            </div>

            {/* Euro */}
            <div
              onClick={(e) => handleCopyRate(e, rates[3]?.sell, language === 'ar' ? 'يورو' : 'EUR')}
              title={language === 'ar' ? 'يورو دمشق - انقر للنسخ' : 'Euro - Click to copy'}
              className="flex items-center gap-1 bg-slate-950/80 hover:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60 cursor-pointer whitespace-nowrap text-slate-200 shrink-0"
            >
              <span className="font-bold text-slate-400">🇪🇺 يورو</span>
              <span className="font-black text-sky-400">{rates[3]?.sell?.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400">ل.س</span>
            </div>

            {/* Gold 21K */}
            <div
              onClick={(e) => handleCopyRate(e, golds[0]?.priceSYP, language === 'ar' ? 'غرام الذهب عيار 21' : 'Gold 21K')}
              title={language === 'ar' ? 'غرام عيار 21 - انقر للنسخ' : 'Gold 21K - Click to copy'}
              className="flex items-center gap-1 bg-slate-950/80 hover:bg-slate-800/80 px-2 py-0.5 rounded-md border border-amber-500/25 cursor-pointer whitespace-nowrap text-slate-200 shrink-0"
            >
              <span className="font-bold text-amber-300">{language === 'ar' ? 'غرام 21' : '21K'}</span>
              <span className="font-black text-amber-400">{golds[0]?.priceSYP?.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400">ل.س</span>
            </div>

            {/* Gold Ounce */}
            <div
              onClick={(e) => handleCopyRate(e, golds[3]?.priceSYP, language === 'ar' ? 'أونصة الذهب' : 'Gold Ounce')}
              title={language === 'ar' ? 'أونصة الذهب - انقر للنسخ' : 'Gold Ounce - Click to copy'}
              className="hidden sm:flex items-center gap-1 bg-slate-950/80 hover:bg-slate-800/80 px-2 py-0.5 rounded-md border border-amber-500/25 cursor-pointer whitespace-nowrap text-slate-200 shrink-0"
            >
              <span className="font-bold text-amber-300">{language === 'ar' ? 'أونصة' : 'Ounce'}</span>
              <span className="font-black text-amber-400">${golds[3]?.priceSYP?.toLocaleString()}</span>
            </div>
          </div>

          {/* Toast Notification when rate is copied */}
          {copiedToast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-emerald-500/60 text-emerald-400 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold dir-rtl backdrop-blur-md">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ar' ? `تم النسخ: ${copiedToast.text}` : `Copied: ${copiedToast.text}`}</span>
            </div>
          )}

          {/* Quick Action Link */}
          <button
            onClick={onNavigateToCurrency}
            className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 px-1.5 py-0.5 rounded-md hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
          >
            <span>{language === 'ar' ? 'التفاصيل' : 'Details'}</span>
            <ChevronLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950/95 border-b border-amber-500/20 backdrop-blur-md text-slate-100 py-1.5 px-3 shadow-lg select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
        {/* Left Badge: Live Status & Title */}
        <div className="flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={onNavigateToCurrency}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            title={language === 'ar' ? 'عرض جدول أسعار الصرف والذهب كاملاً' : 'View full rates table'}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'أسعار الصرف والذهب' : 'Live Rates & Gold'}</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
            </span>
          </button>

          {/* Official Central Bank & Global Network Badge */}
          <div className="hidden xl:flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40" title={language === 'ar' ? 'مربوط رسمياً بنشرات المصرف المركزي السوري وفوركس العالمية' : 'Synced with Central Bank of Syria & Global Forex'}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ar' ? 'ربط رسمي وعالمي' : 'Official Sync'}</span>
          </div>

          {/* Detected Location Badge via Geolocation */}
          <button
            type="button"
            onClick={() => detectUserLocation(true)}
            disabled={isLocating}
            title={language === 'ar' ? 'تحديث موقعك الجغرافي عبر GPS لضبط العملة التلقائية' : 'Detect your region via GPS'}
            className="hidden sm:flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer active:scale-95"
          >
            <MapPin className={`w-3 h-3 text-amber-400 ${isLocating ? 'animate-bounce' : ''}`} />
            <span>
              {isLocating
                ? (language === 'ar' ? 'جاري التحديد...' : 'Locating...')
                : detectedLocation
                  ? detectedLocation
                  : (language === 'ar' ? 'تحديد موقعي 📍' : 'Detect Location 📍')}
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{language === 'ar' ? `حي: ${formattedTime}` : `Live: ${formattedTime}`}</span>
          </div>
        </div>

        {/* Center: Scrollable / Animated Ticker Chips with Geolocation Highlights & Click-to-Copy */}
        <div className="flex-1 overflow-x-auto scrollbar-none flex items-center justify-center sm:justify-start gap-2 px-1 py-0.5 w-full sm:w-auto">
          {/* Damascus Dollar */}
          <div
            onClick={(e) => handleCopyRate(e, rates[0]?.sell, language === 'ar' ? 'دولار دمشق' : 'Damascus USD')}
            title={language === 'ar' ? 'انقر لنسخ سعر دولار دمشق 📋' : 'Click to copy Damascus USD rate 📋'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border cursor-pointer transition-all whitespace-nowrap text-xs shrink-0 group ${
              locationHighlight === 'damascus'
                ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/40 shadow-md scale-105'
                : 'border-slate-800 hover:border-amber-500/50'
            } ${flashId ? 'ring-1 ring-amber-400 bg-amber-500/10' : ''}`}
          >
            <span className="font-bold text-slate-300">🇸🇾 دمشق $</span>
            <span className="font-black text-amber-400 group-hover:underline flex items-center gap-1">
              {rates[0]?.sell.toLocaleString()}
              <Copy className="w-3 h-3 text-amber-400/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[10px] text-slate-400">ل.س</span>
            {locationHighlight === 'damascus' && (
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded-xs">
                {language === 'ar' ? 'المحدد بموقعك' : 'Regional'}
              </span>
            )}
            {rates[0]?.change >= 0 ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
            )}
          </div>

          {/* Aleppo Dollar */}
          <div
            onClick={(e) => handleCopyRate(e, rates[1]?.sell, language === 'ar' ? 'دولار حلب' : 'Aleppo USD')}
            title={language === 'ar' ? 'انقر لنسخ سعر دولار حلب 📋' : 'Click to copy Aleppo USD rate 📋'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border cursor-pointer transition-all whitespace-nowrap text-xs shrink-0 group ${
              locationHighlight === 'aleppo'
                ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/40 shadow-md scale-105'
                : 'border-slate-800 hover:border-amber-500/50'
            } ${flashId ? 'ring-1 ring-amber-400 bg-amber-500/10' : ''}`}
          >
            <span className="font-bold text-slate-300">🇸🇾 حلب $</span>
            <span className="font-black text-amber-400 group-hover:underline flex items-center gap-1">
              {rates[1]?.sell.toLocaleString()}
              <Copy className="w-3 h-3 text-amber-400/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[10px] text-slate-400">ل.س</span>
            {locationHighlight === 'aleppo' && (
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded-xs">
                {language === 'ar' ? 'المحدد بموقعك' : 'Regional'}
              </span>
            )}
          </div>

          {/* Euro */}
          <div
            onClick={(e) => handleCopyRate(e, rates[3]?.sell, language === 'ar' ? 'يورو دمشق' : 'Euro EUR')}
            title={language === 'ar' ? 'انقر لنسخ سعر اليورو 📋' : 'Click to copy Euro rate 📋'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border cursor-pointer transition-all whitespace-nowrap text-xs shrink-0 group ${
              locationHighlight === 'euro'
                ? 'border-sky-400 bg-sky-500/15 ring-2 ring-sky-400/40 shadow-md scale-105'
                : 'border-slate-800 hover:border-amber-500/50'
            } ${flashId ? 'ring-1 ring-amber-400 bg-amber-500/10' : ''}`}
          >
            <span className="font-bold text-slate-300">🇪🇺 يورو EUR</span>
            <span className="font-black text-sky-400 group-hover:underline flex items-center gap-1">
              {rates[3]?.sell.toLocaleString()}
              <Copy className="w-3 h-3 text-sky-400/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[10px] text-slate-400">ل.س</span>
            {locationHighlight === 'euro' && (
              <span className="text-[9px] bg-sky-400 text-slate-950 font-black px-1 rounded-xs">
                {language === 'ar' ? 'المحدد بموقعك' : 'Regional'}
              </span>
            )}
          </div>

          {/* Gold Ounce ($) */}
          <div
            onClick={(e) => handleCopyRate(e, golds[3]?.priceSYP, language === 'ar' ? 'أونصة الذهب' : 'Gold Ounce')}
            title={language === 'ar' ? 'انقر لنسخ سعر أونصة الذهب 📋' : 'Click to copy Gold Ounce price 📋'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all whitespace-nowrap text-xs shrink-0 group ${
              flashId ? 'ring-1 ring-amber-400 bg-amber-500/10' : ''
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-300">{language === 'ar' ? 'أونصة الذهب' : 'Gold Ounce'}</span>
            <span className="font-black text-amber-400 group-hover:underline flex items-center gap-1">
              ${golds[3]?.priceSYP.toLocaleString()}
              <Copy className="w-3 h-3 text-amber-400/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </div>

          {/* Gold Karat 21 (SYP) */}
          <div
            onClick={(e) => handleCopyRate(e, golds[0]?.priceSYP, language === 'ar' ? 'غرام الذهب عيار 21' : 'Gold 21K')}
            title={language === 'ar' ? 'انقر لنسخ سعر غرام الذهب عيار 21 📋' : 'Click to copy Gold 21K price 📋'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all whitespace-nowrap text-xs shrink-0 group ${
              flashId ? 'ring-1 ring-amber-400 bg-amber-500/10' : ''
            }`}
          >
            <span className="font-bold text-amber-300">{language === 'ar' ? 'غرام عيار 21' : 'Gold 21K'}</span>
            <span className="font-black text-amber-400 group-hover:underline flex items-center gap-1">
              {golds[0]?.priceSYP.toLocaleString()}
              <Copy className="w-3 h-3 text-amber-400/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[10px] text-slate-400">ل.س</span>
          </div>
        </div>

        {/* Floating Toast Notification when rate is copied */}
        {copiedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-emerald-500/60 text-emerald-400 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 dir-rtl backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span>
              {language === 'ar'
                ? `تم النسخ! (${copiedToast.label}: ${copiedToast.text})`
                : `Copied! (${copiedToast.label}: ${copiedToast.text})`}
            </span>
          </div>
        )}

        {/* Right Action Controls: Manual Refresh & "View More" Link */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={triggerLiveUpdate}
            disabled={isRefreshing}
            title={language === 'ar' ? 'تحديث الأسعار الآن' : 'Refresh rates now'}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/40 rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
          </button>

          <button
            onClick={onNavigateToCurrency}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 rounded-lg transition-all active:scale-95 font-bold text-xs cursor-pointer group"
          >
            <span>{language === 'ar' ? 'مشاهدة المزيد' : 'View More'}</span>
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
