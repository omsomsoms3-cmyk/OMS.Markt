import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRightLeft, DollarSign, RefreshCw, Copy, Check, Share2, Sparkles, TrendingUp, Award, Building2, Globe2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ExtendedCurrencyRate } from '../lib/exchangeRateService';
import { GoldRate } from '../types';

export interface CurrencyCalculatorProps {
  rates: ExtendedCurrencyRate[];
  golds: GoldRate[];
  officialCBS: { buy: number; sell: number };
  globalRatesUSD: Record<string, number>;
  onRefreshRates?: () => void;
  isSyncing?: boolean;
}

export type CurrencyCode =
  | 'USD'
  | 'SYP_DAMASCUS'
  | 'SYP_ALEPPO'
  | 'SYP_IDLIB'
  | 'SYP_CBS'
  | 'EUR'
  | 'TRY'
  | 'SAR'
  | 'AED'
  | 'GOLD_21K';

interface CurrencyOption {
  code: CurrencyCode;
  labelAr: string;
  labelEn: string;
  symbol: string;
  flag: string;
}

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', labelAr: 'دولار أمريكي', labelEn: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'SYP_DAMASCUS', labelAr: 'ليرة سورية (دمشق)', labelEn: 'Syrian Pound (Damascus)', symbol: 'ل.س', flag: '🇸🇾' },
  { code: 'SYP_ALEPPO', labelAr: 'ليرة سورية (حلب)', labelEn: 'Syrian Pound (Aleppo)', symbol: 'ل.س', flag: '🇸🇾' },
  { code: 'SYP_IDLIB', labelAr: 'ليرة سورية (إدلب)', labelEn: 'Syrian Pound (Idlib)', symbol: 'ل.س', flag: '🇸🇾' },
  { code: 'SYP_CBS', labelAr: 'ليرة سورية (المصرف المركزي)', labelEn: 'Syrian Pound (CBS Official)', symbol: 'ل.س', flag: '🏦' },
  { code: 'EUR', labelAr: 'يورو أوروبي', labelEn: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'TRY', labelAr: 'ليرة تركية', labelEn: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'SAR', labelAr: 'ريال سعودي', labelEn: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'AED', labelAr: 'درهم إماراتي', labelEn: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'GOLD_21K', labelAr: 'غرام ذهب عيار 21', labelEn: 'Gold 21K Gram', symbol: 'غرام', flag: '🪙' },
];

export const CurrencyCalculator: React.FC<CurrencyCalculatorProps> = ({
  rates,
  golds,
  officialCBS,
  globalRatesUSD,
  onRefreshRates,
  isSyncing = false,
}) => {
  const { language } = useLanguage();

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('SYP_DAMASCUS');
  const [amount, setAmount] = useState<number>(100);
  const [rateType, setRateType] = useState<'sell' | 'buy' | 'official'>('sell');
  const [copied, setCopied] = useState<boolean>(false);

  // Helper to extract USD price of a currency in SYP or USD base
  const getRateInSYP = (code: CurrencyCode): number => {
    // USD rate in Damascus
    const damascusRate = rates.find((r) => r.city.includes('دمشق')) || { buy: 14800, sell: 14950 };
    const aleppoRate = rates.find((r) => r.city.includes('حلب')) || { buy: 14850, sell: 15000 };
    const idlibRate = rates.find((r) => r.city.includes('إدلب')) || { buy: 15100, sell: 15250 };
    const eurRate = rates.find((r) => r.city.includes('اليورو')) || { buy: 16200, sell: 16400 };
    const sarRate = rates.find((r) => r.city.includes('الريال')) || { buy: 3950, sell: 4000 };
    const tryRate = rates.find((r) => r.city.includes('التركية')) || { buy: 440, sell: 455 };
    const gold21Rate = golds.find((g) => g.karat.includes('21'))?.priceSYP || 1080000;

    const useRateVal = (r: { buy: number; sell: number }) => {
      if (rateType === 'buy') return r.buy;
      if (rateType === 'official') return officialCBS.sell || 13635;
      return r.sell;
    };

    switch (code) {
      case 'USD':
        if (rateType === 'official') return officialCBS.sell || 13635;
        return useRateVal(damascusRate);
      case 'SYP_DAMASCUS':
        return 1;
      case 'SYP_ALEPPO':
        return 1;
      case 'SYP_IDLIB':
        return 1;
      case 'SYP_CBS':
        return 1;
      case 'EUR':
        return useRateVal(eurRate);
      case 'SAR':
        return useRateVal(sarRate);
      case 'TRY':
        return useRateVal(tryRate);
      case 'AED': {
        const aedRatio = globalRatesUSD['AED'] ? 1 / globalRatesUSD['AED'] : 0.272;
        return Math.round(useRateVal(damascusRate) * aedRatio);
      }
      case 'GOLD_21K':
        return gold21Rate;
      default:
        return useRateVal(damascusRate);
    }
  };

  // Convert amount from 'fromCurrency' to 'toCurrency'
  const calculateConversion = (from: CurrencyCode, to: CurrencyCode, amt: number): number => {
    if (from === to || amt <= 0) return amt;

    const fromSYPVal = getRateInSYP(from);
    const toSYPVal = getRateInSYP(to);

    // Amount in SYP = amt * fromSYPVal
    const totalSYP = amt * fromSYPVal;
    // Amount in Target = totalSYP / toSYPVal
    const result = totalSYP / toSYPVal;

    return result;
  };

  const convertedResult = calculateConversion(fromCurrency, toCurrency, amount);

  // Unit rate formula string e.g. 1 USD = 14,950 SYP
  const unitRateVal = calculateConversion(fromCurrency, toCurrency, 1);
  const fromObj = CURRENCY_OPTIONS.find((c) => c.code === fromCurrency)!;
  const toObj = CURRENCY_OPTIONS.find((c) => c.code === toCurrency)!;

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleCopyResult = () => {
    const fromLabel = language === 'ar' ? fromObj.labelAr : fromObj.labelEn;
    const toLabel = language === 'ar' ? toObj.labelAr : toObj.labelEn;
    const formattedAmt = amount.toLocaleString();
    const formattedRes =
      convertedResult < 1
        ? convertedResult.toFixed(4)
        : Math.round(convertedResult).toLocaleString();

    const text = language === 'ar'
      ? `🧮 حاسبة العملات - OMS الأسواق السورية:\n💰 ${formattedAmt} ${fromObj.symbol} (${fromLabel}) = ${formattedRes} ${toObj.symbol} (${toLabel})\n📈 أسعار الصرف الحية عبر منصة OMS`
      : `🧮 OMS Currency Converter:\n💰 ${formattedAmt} ${fromObj.symbol} (${fromLabel}) = ${formattedRes} ${toObj.symbol} (${toLabel})\n📈 Live rates via OMS Markets`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const fromLabel = language === 'ar' ? fromObj.labelAr : fromObj.labelEn;
    const toLabel = language === 'ar' ? toObj.labelAr : toObj.labelEn;
    const formattedAmt = amount.toLocaleString();
    const formattedRes =
      convertedResult < 1
        ? convertedResult.toFixed(4)
        : Math.round(convertedResult).toLocaleString();

    const text = encodeURIComponent(
      `🧮 تحويل عملات عبر منصة OMS الأسواق السورية:\n💰 ${formattedAmt} ${fromObj.symbol} (${fromLabel}) = ${formattedRes} ${toObj.symbol} (${toLabel})\n🌐 رابط المنصة الحية: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Preset amounts based on 'fromCurrency'
  const getPresets = (): number[] => {
    if (fromCurrency === 'USD' || fromCurrency === 'EUR') return [10, 50, 100, 500, 1000];
    if (fromCurrency.startsWith('SYP')) return [100000, 500000, 1000000, 5000000, 10000000];
    if (fromCurrency === 'TRY' || fromCurrency === 'SAR' || fromCurrency === 'AED') return [50, 100, 500, 1000, 5000];
    if (fromCurrency === 'GOLD_21K') return [1, 5, 8, 10, 21];
    return [10, 50, 100, 500, 1000];
  };

  return (
    <div id="currency-calculator-widget" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl space-y-6">
      {/* Title & Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl shadow-inner">
            <Calculator className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {language === 'ar' ? 'حاسبة العملات الذكية والحية' : 'Smart Live Currency Converter'}
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {language === 'ar' ? 'ربط حي' : 'Live'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'تحويل فوري ودقيق بين الليرة السورية والدولار واليورو والذهب والعملات العربية والعالمية'
                : 'Instant real-time conversion between SYP, USD, EUR, Gold & Arab currencies'}
            </p>
          </div>
        </div>

        {/* Rate Type Selector (مبيع / شراء / مركزي) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setRateType('sell')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              rateType === 'sell'
                ? 'bg-indigo-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'سعر المبيع' : 'Sell Rate'}
          </button>
          <button
            type="button"
            onClick={() => setRateType('buy')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              rateType === 'buy'
                ? 'bg-indigo-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'سعر الشراء' : 'Buy Rate'}
          </button>
          <button
            type="button"
            onClick={() => setRateType('official')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              rateType === 'official'
                ? 'bg-emerald-600 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'المركزي' : 'CBS Official'}
          </button>
        </div>
      </div>

      {/* Main Converter Inputs & Swap */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* From Currency Block */}
        <div className="md:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2 focus-within:border-indigo-500/60 transition-all">
          <label className="text-[11px] font-extrabold text-slate-400 block flex items-center justify-between">
            <span>{language === 'ar' ? 'المبلغ والعملة الأساسية (من)' : 'From Currency'}</span>
            <span className="text-indigo-400 font-mono">{fromObj.flag} {fromObj.symbol}</span>
          </label>

          <div className="flex items-center gap-2">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
              className="bg-slate-900 border border-slate-700/80 text-white font-extrabold text-xs sm:text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer shrink-0 max-w-[160px] sm:max-w-none"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.flag} {language === 'ar' ? opt.labelAr : opt.labelEn}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              step="any"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-base sm:text-lg font-black text-white text-left dir-ltr font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quick Amount Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-[10px] text-slate-500 shrink-0">{language === 'ar' ? 'اختصار:' : 'Quick:'}</span>
            {getPresets().map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition-all shrink-0 cursor-pointer ${
                  amount === preset
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {preset >= 1000000
                  ? `${preset / 1000000}M`
                  : preset >= 1000
                  ? `${preset / 1000}k`
                  : preset}
              </button>
            ))}
          </div>
        </div>

        {/* Swap Button Column */}
        <div className="md:col-span-2 flex items-center justify-center py-1">
          <button
            type="button"
            onClick={handleSwapCurrencies}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 active:scale-90 transition-all cursor-pointer flex items-center justify-center gap-1 group"
            title={language === 'ar' ? 'تبديل اتجاه التحويل 🔄' : 'Swap Currencies 🔄'}
          >
            <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* To Currency Block */}
        <div className="md:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2 focus-within:border-emerald-500/60 transition-all">
          <label className="text-[11px] font-extrabold text-slate-400 block flex items-center justify-between">
            <span>{language === 'ar' ? 'العملة المستهدفة (إلى)' : 'To Currency'}</span>
            <span className="text-emerald-400 font-mono">{toObj.flag} {toObj.symbol}</span>
          </label>

          <div className="flex items-center gap-2">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
              className="bg-slate-900 border border-slate-700/80 text-white font-extrabold text-xs sm:text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 cursor-pointer w-full"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.flag} {language === 'ar' ? opt.labelAr : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Converted Output Display */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'النتيجة المحسوبة:' : 'Result:'}</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono dir-ltr truncate">
              {convertedResult < 1
                ? convertedResult.toFixed(4)
                : Math.round(convertedResult).toLocaleString()}{' '}
              <span className="text-xs text-emerald-300/80 font-bold">{toObj.symbol}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Conversion Banner Result & Direct Actions */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-950 to-emerald-950/80 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="text-slate-400">{language === 'ar' ? 'معدل الصرف المعتمد:' : 'Exchange Rate:'}</span>
            <span className="font-bold text-indigo-300">
              1 {fromObj.code} ={' '}
              {unitRateVal < 1 ? unitRateVal.toFixed(4) : Math.round(unitRateVal).toLocaleString()}{' '}
              {toObj.symbol}
            </span>
          </div>

          <div className="text-lg sm:text-xl font-black text-white flex items-center gap-2 flex-wrap">
            <span>{amount.toLocaleString()} {fromObj.symbol}</span>
            <span className="text-indigo-400 text-sm">➔</span>
            <span className="text-emerald-400 font-mono">
              {convertedResult < 1
                ? convertedResult.toFixed(4)
                : Math.round(convertedResult).toLocaleString()}{' '}
              {toObj.symbol}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyResult}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ النتيجة 📋' : 'Copy Result')}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{language === 'ar' ? 'مشاركة 💬' : 'Share 💬'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Currency Equivalent Breakdown Grid */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-extrabold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-sky-400" />
            <span>
              {language === 'ar'
                ? `ما يعادله مبلغ (${amount.toLocaleString()} ${fromObj.symbol}) بكافة العملات الحية:`
                : `Equivalent of (${amount.toLocaleString()} ${fromObj.symbol}) across live currencies:`}
            </span>
          </span>
          <span className="text-[10px] text-slate-500">{language === 'ar' ? 'تحديث لحظي' : 'Live Sync'}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {CURRENCY_OPTIONS.filter((c) => c.code !== fromCurrency).map((opt) => {
            const val = calculateConversion(fromCurrency, opt.code, amount);
            return (
              <div
                key={opt.code}
                onClick={() => setToCurrency(opt.code)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  toCurrency === opt.code
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-1">
                  <span>{opt.flag} {opt.code.split('_')[0]}</span>
                  <span className="text-[10px] text-slate-500">{opt.symbol}</span>
                </div>

                <div className="text-sm font-black text-slate-100 font-mono dir-ltr truncate">
                  {val < 1 ? val.toFixed(3) : Math.round(val).toLocaleString()}
                </div>

                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {language === 'ar' ? opt.labelAr : opt.labelEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
