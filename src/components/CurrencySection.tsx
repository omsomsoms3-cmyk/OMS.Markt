import React, { useState, useEffect } from 'react';
import { CurrencyRate, GoldRate, RateAlert } from '../types';
import { initialCurrencyRates, initialGoldRates } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { 
  TrendingUp, 
  RefreshCw, 
  Calculator, 
  DollarSign, 
  Award, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Bell, 
  Volume2, 
  Sparkles, 
  X, 
  Check, 
  ShieldAlert, 
  Building2, 
  Globe2, 
  ShieldCheck, 
  CheckCircle2,
  ShoppingBag,
  Coins,
  Scale,
  BadgePercent,
  Smartphone
} from 'lucide-react';
import { RateAlertsModal } from './RateAlertsModal';
import { CurrencyCalculator } from './CurrencyCalculator';
import { SyrianGoodsSection } from './SyrianGoodsSection';
import { MobilePhonesSection } from './MobilePhonesSection';
import { fetchLiveExchangeData, ExtendedCurrencyRate } from '../lib/exchangeRateService';

const DEFAULT_ALERTS: RateAlert[] = [
  {
    id: 'alert-1',
    city: 'دمشق',
    targetRate: 14900,
    rateType: 'sell',
    condition: 'above',
    isActive: true,
    createdAt: new Date().toLocaleDateString('ar-SY'),
    note: 'تنبيه وصول سعر دولار دمشق فوق 14,900 ل.س',
  },
  {
    id: 'alert-2',
    city: 'حلب',
    targetRate: 14900,
    rateType: 'sell',
    condition: 'above',
    isActive: true,
    createdAt: new Date().toLocaleDateString('ar-SY'),
    note: 'تنبيه وصول سعر دولار حلب فوق 14,900 ل.س',
  },
];

export const CurrencySection: React.FC = () => {
  const { t, language } = useLanguage();
  const [rates, setRates] = useState<ExtendedCurrencyRate[]>(initialCurrencyRates);
  const [golds, setGolds] = useState<GoldRate[]>(initialGoldRates);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('مباشر الآن');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'currencies' | 'gold' | 'goods' | 'phones'>('all');
  const [officialCBSData, setOfficialCBSData] = useState({ buy: 13500, sell: 13635 });
  const [globalRatesUSD, setGlobalRatesUSD] = useState<Record<string, number>>({
    EUR: 0.92,
    SAR: 3.75,
    TRY: 33.20,
    AED: 3.67,
  });

  // Rate Alerts State
  const [alerts, setAlerts] = useState<RateAlert[]>(() => {
    const saved = localStorage.getItem('oms_currency_rate_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ALERTS;
      }
    }
    return DEFAULT_ALERTS;
  });

  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [activeTriggerBanner, setActiveTriggerBanner] = useState<{
    id: string;
    title: string;
    message: string;
    cityName: string;
    currentRate: number;
    targetRate: number;
    timestamp: string;
  } | null>(null);

  // Fetch Live Rates on Mount
  useEffect(() => {
    loadLiveRates();
  }, []);

  const loadLiveRates = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchLiveExchangeData();
      setRates(data.currencies);
      setGolds(data.golds);
      setLastSyncText(data.lastUpdatedText);
      setOfficialCBSData(data.officialCBSRate);
      if (data.globalRatesUSD) {
        setGlobalRatesUSD(data.globalRatesUSD);
      }
    } catch (err) {
      console.error('Failed to sync live exchange rates:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('oms_currency_rate_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Check alerts against current rates
  useEffect(() => {
    checkRateAlerts(rates, alerts);
  }, [rates, alerts]);

  const checkRateAlerts = (currentRates: CurrencyRate[], currentAlerts: RateAlert[]) => {
    for (const al of currentAlerts) {
      if (!al.isActive) continue;

      const matching = al.city === 'جميع المدن'
        ? currentRates
        : currentRates.filter((r) => r.city.includes(al.city) || al.city.includes(r.city));

      for (const r of matching) {
        const actualVal = al.rateType === 'sell' ? r.sell : r.buy;
        const conditionMet = al.condition === 'above' ? actualVal >= al.targetRate : actualVal <= al.targetRate;

        if (conditionMet) {
          const bannerMsg = language === 'ar'
            ? `وصل سعر ${al.rateType === 'sell' ? 'مبيع' : 'شراء'} الدولار في ${r.city} إلى ${actualVal.toLocaleString()} ل.س وهو ${al.condition === 'above' ? 'أعلى من' : 'أقل من'} السعر المستهدف (${al.targetRate.toLocaleString()} ل.س)`
            : `USD ${al.rateType} rate in ${r.city} reached ${actualVal.toLocaleString()} SYP (${al.condition} target of ${al.targetRate.toLocaleString()} SYP)`;

          setActiveTriggerBanner({
            id: `trig-${al.id}-${Date.now()}`,
            title: language === 'ar' ? '🔔 تنبيه تحقق سعر الصرف!' : '🔔 Rate Alert Triggered!',
            message: bannerMsg,
            cityName: r.city,
            currentRate: actualVal,
            targetRate: al.targetRate,
            timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
          });

          // Trigger Web Push Notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(language === 'ar' ? 'تنبيه سعر الصرف - OMS 🔔' : 'OMS Exchange Rate Alert 🔔', {
                body: bannerMsg,
                icon: '/favicon.ico',
              });
            } catch (e) {
              console.log('Notification trigger error', e);
            }
          }
          break;
        }
      }
    }
  };

  const handleAddAlert = (newAlertData: Omit<RateAlert, 'id' | 'createdAt'>) => {
    const created: RateAlert = {
      ...newAlertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('ar-SY'),
    };
    setAlerts((prev) => [created, ...prev]);
  };

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSimulateTestAlert = () => {
    const mockRate = 14980;
    const bannerMsg = language === 'ar'
      ? `[تجربة التنبيه] وصل سعر مبيع الدولار في دمشق إلى ${mockRate.toLocaleString()} ل.س وهو أعلى من التنبيه المحدد 14,900 ل.س!`
      : `[Test Alert] USD sell rate in Damascus reached ${mockRate.toLocaleString()} SYP!`;

    setActiveTriggerBanner({
      id: `test-${Date.now()}`,
      title: language === 'ar' ? '🔔 تجربة نظام تنبيهات أسعار الصرف!' : '🔔 Test Rate Alert Active!',
      message: bannerMsg,
      cityName: 'دمشق',
      currentRate: mockRate,
      targetRate: 14900,
      timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(language === 'ar' ? 'تجربة تنبيه OMS 🔔' : 'OMS Test Notification 🔔', {
          body: bannerMsg,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.log('Notification error', e);
      }
    }
  };

  const handleRefreshRates = () => {
    loadLiveRates();
  };

  const activeAlertsCount = alerts.filter((a) => a.isActive).length;

  return (
    <div className="p-4 max-w-7xl w-full mx-auto space-y-6">
      {/* Official Network Transparency & Credibility Banner */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg text-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">
                  {language === 'ar' ? 'مصداقية الأسعار والربط الشبكي المباشر' : 'Official Rate Credibility & Live Sync'}
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {language === 'ar' ? 'تحديث يومي حي' : 'Daily Live Updates'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {language === 'ar'
                  ? 'يتم جلب البيانات وتدقيقها عبر شبكة نشرات المصرف المركزي السوري، جمعية الصاغة بدمشق، وبورصة السلع والمنتجات السورية.'
                  : 'Data synced via Syrian Central Bank, Damascus Goldsmith Association, and Syrian Commodities exchange.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] text-slate-400 font-mono">
              {language === 'ar' ? `آخر مزامنة: ${lastSyncText}` : `Synced: ${lastSyncText}`}
            </span>
          </div>
        </div>

        {/* Network Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Badge 1: Central Bank of Syria */}
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-slate-200 block text-[11px] truncate">
                {language === 'ar' ? 'المصرف المركزي السوري (الحوالات)' : 'Central Bank of Syria (Official)'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                USD = {officialCBSData.buy.toLocaleString()} / {officialCBSData.sell.toLocaleString()} ل.س
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />
          </div>

          {/* Badge 2: Damascus Goldsmiths Association */}
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-slate-200 block text-[11px] truncate">
                {language === 'ar' ? 'جمعية الصاغة بدمشق وسوق الذهب' : 'Syrian Gold Market & Association'}
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                {language === 'ar' ? 'عيار 21 و18 وليرات الذهب' : '21K, 18K & Gold Coins'}
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-auto" />
          </div>

          {/* Badge 3: Syrian Goods & Commodity Market */}
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-slate-200 block text-[11px] truncate">
                {language === 'ar' ? 'بورصة السلع والمنتجات السورية' : 'Syrian Goods & Products Exchange'}
              </span>
              <span className="text-[10px] text-sky-400 font-mono font-bold">
                {language === 'ar' ? 'أسعار السلع التموينية الحية' : 'Real-time Consumer Goods'}
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 ml-auto" />
          </div>
        </div>
      </div>

      {/* Triggered Alert Floating Banner */}
      {activeTriggerBanner && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 p-4 rounded-2xl shadow-2xl border-2 border-amber-300 animate-fadeIn relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950/20 rounded-2xl shrink-0 text-slate-950">
              <Bell className="w-6 h-6 animate-bounce fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-950 text-sm sm:text-base">
                  {activeTriggerBanner.title}
                </span>
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  {activeTriggerBanner.timestamp}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 leading-relaxed">
                {activeTriggerBanner.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsAlertsModalOpen(true)}
              className="py-1.5 px-3 bg-slate-950 text-amber-300 hover:bg-slate-900 rounded-xl text-xs font-bold transition-all"
            >
              {language === 'ar' ? 'إدارة التنبيهات' : 'Manage Alerts'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTriggerBanner(null)}
              className="p-1.5 bg-slate-950/20 hover:bg-slate-950/40 rounded-xl transition-all text-slate-950"
              title={language === 'ar' ? 'إغلاق التنبيه' : 'Dismiss'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner with Sub-Navigation Buttons */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse text-emerald-400 font-bold text-sm mb-1">
            <TrendingUp className="w-5 h-5" />
            <span>OMS — {language === 'ar' ? 'بورصة أسعار العملات والذهب والسلع السورية' : 'Rates, Gold & Syrian Goods Exchange'}</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {language === 'ar' ? 'أسعار العملات والذهب والسلع والمنتجات السورية' : 'Syrian Currency, Gold & Product Prices'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'ar' 
              ? 'تحديثات يومية مستمرة لأسعار صرف الليرة السورية، غرامات وسبائك الذهب، وقائمة السلع والمنتجات السورية الفعلية'
              : 'Daily continuous updates for Syrian Pound exchange rates, gold karats & bars, and real market prices for Syrian goods.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Rate Alerts Button */}
          <button
            onClick={() => setIsAlertsModalOpen(true)}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Bell className="w-4 h-4 fill-slate-950" />
            <span>{language === 'ar' ? 'تفعيل تنبيهات الأسعار 🔔' : 'Rate Alerts 🔔'}</span>
            {activeAlertsCount > 0 && (
              <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {activeAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={handleRefreshRates}
            disabled={isSyncing}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? (language === 'ar' ? 'جاري المزامنة اليومية...' : 'Syncing Daily...')
                : (language === 'ar' ? 'تحديث الأسعار الآن' : 'Refresh Rates Now')}
            </span>
          </button>
        </div>
      </div>

      {/* Main Feature Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveSubTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
            activeSubTab === 'all'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md'
              : 'text-slate-300 hover:bg-slate-800/80 border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{language === 'ar' ? 'عرض شامل (الكل)' : 'Overview (All)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('goods')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
            activeSubTab === 'goods'
              ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-400 shadow-md'
              : 'text-slate-300 hover:bg-slate-800/80 border-transparent'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-sky-300" />
          <span>{language === 'ar' ? 'أسعار السلع والمنتجات السورية 🛒' : 'Syrian Goods & Commodities 🛒'}</span>
          <span className="bg-sky-400/20 text-sky-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
            16 سلعة
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('gold')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
            activeSubTab === 'gold'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md'
              : 'text-slate-300 hover:bg-slate-800/80 border-transparent'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'أسعار الذهب اليومية (عيار 21، 18، الليرات) 🪙' : 'Daily Gold & Coins 🪙'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('currencies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
            activeSubTab === 'currencies'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-md'
              : 'text-slate-300 hover:bg-slate-800/80 border-transparent'
          }`}
        >
          <DollarSign className="w-4 h-4 text-indigo-300" />
          <span>{language === 'ar' ? 'أسعار صرف العملات الأجنبية' : 'Foreign Currencies'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('phones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
            activeSubTab === 'phones'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-md'
              : 'text-slate-300 hover:bg-slate-800/80 border-transparent'
          }`}
        >
          <Smartphone className="w-4 h-4 text-purple-300" />
          <span>{language === 'ar' ? 'أسعار الهواتف والمنتجات (دقيقة بدقيقة) 📱' : 'Phones & Tech (Live) 📱'}</span>
          <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
            LIVE 🔴
          </span>
        </button>
      </div>

      {/* Live Interactive Currency & Gold Calculator Widget */}
      {(activeSubTab === 'all' || activeSubTab === 'currencies' || activeSubTab === 'gold') && (
        <CurrencyCalculator
          rates={rates}
          golds={golds}
          officialCBS={officialCBSData}
          globalRatesUSD={globalRatesUSD}
          onRefreshRates={handleRefreshRates}
          isSyncing={isSyncing}
        />
      )}

      {/* Section 1: Currencies Grid */}
      {(activeSubTab === 'all' || activeSubTab === 'currencies') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>{t('currencyTitle')}</span>
            </h3>
            <span className="text-xs text-slate-400">{t('lastUpdate')}: {language === 'ar' ? 'مباشر الآن' : 'Live'}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates.map((rate, idx) => (
              <div
                key={idx}
                className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md hover:border-emerald-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <span className="font-bold text-white text-base">{rate.city}</span>
                  <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                    rate.change >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {rate.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 ml-0.5" />}
                    {rate.change > 0 ? `+${rate.change}%` : `${rate.change}%`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center dir-ltr">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{t('buy')}</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {rate.buy.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 mr-1">{t('syp')}</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{t('sell')}</span>
                    <span className="text-lg font-black text-indigo-400 font-mono">
                      {rate.sell.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 mr-1">{t('syp')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {rate.updatedAt}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAlertsModalOpen(true)}
                    className="text-amber-400 hover:text-amber-300 font-medium text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Bell className="w-3 h-3" />
                    <span>{language === 'ar' ? 'تنبيه لهذا السعر' : 'Alert for rate'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Comprehensive Daily Gold Rates */}
      {(activeSubTab === 'all' || activeSubTab === 'gold') && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{language === 'ar' ? 'نشرة أسعار الذهب اليومية (جمعية الصاغة وسوق دمشق)' : 'Daily Gold Rates (Goldsmith Association & Market)'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'محدثة يومياً على مدار الساعة حسب تسعيرة جمعية الصاغة وأسعار أونصة الذهب في البورصة العالمية'
                  : 'Updated daily according to the Goldsmiths Association and London/NY Spot Gold benchmarks.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                {language === 'ar' ? 'تحديث يومي حي 🟢' : 'Daily Live Gold 🟢'}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {golds.map((g, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-4 shadow-lg transition-all space-y-3 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
                
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                      {g.karat}
                    </h4>
                    {g.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {g.description}
                      </p>
                    )}
                  </div>
                  {g.badge && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-extrabold shrink-0">
                      {g.badge}
                    </span>
                  )}
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-bold">{language === 'ar' ? 'السعر بالليرة:' : 'Price (SYP):'}</span>
                    <div className="text-left">
                      <span className="text-xl font-black text-amber-400 font-mono">
                        {g.priceSYP.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 mr-1 font-bold">ل.س</span>
                    </div>
                  </div>

                  {g.priceUSD && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-1">
                      <span>{language === 'ar' ? 'المعادل بالدولار ($):' : 'USD Value ($):'}</span>
                      <span className="text-sky-300 font-mono font-bold">${g.priceUSD.toLocaleString()} USD</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{g.updatedAt}</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {language === 'ar' ? 'نشرة موثقة ✓' : 'Verified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Real Syrian Goods & Commodity Prices */}
      {(activeSubTab === 'all' || activeSubTab === 'goods') && (
        <div className="pt-2">
          <SyrianGoodsSection
            onRefresh={handleRefreshRates}
            isSyncing={isSyncing}
          />
        </div>
      )}

      {/* Section 4: Live Syrian Mobile Phones & Tech Prices (Minute by Minute) */}
      {(activeSubTab === 'all' || activeSubTab === 'phones') && (
        <div className="pt-4">
          <MobilePhonesSection externalUsdRate={rates[0]?.sell || 14900} />
        </div>
      )}

      {/* Rate Alerts Modal */}
      <RateAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onToggleAlert={handleToggleAlert}
        onDeleteAlert={handleDeleteAlert}
        onSimulateTestAlert={handleSimulateTestAlert}
        rates={rates}
      />
    </div>
  );
};



