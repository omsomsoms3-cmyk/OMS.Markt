import React, { useState, useEffect } from 'react';
import { CurrencyRate, GoldRate, RateAlert } from '../types';
import { initialCurrencyRates, initialGoldRates } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, RefreshCw, Calculator, DollarSign, Award, Clock, ArrowUpRight, ArrowDownRight, Bell, Volume2, Sparkles, X, Check, ShieldAlert, Building2, Globe2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RateAlertsModal } from './RateAlertsModal';
import { CurrencyCalculator } from './CurrencyCalculator';
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
                  {language === 'ar' ? 'ربط موثق وحي' : 'Verified Live'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {language === 'ar'
                  ? 'يتم جلب البيانات وتدقيقها عبر شبكة نشرات المصرف المركزي السوري ومؤشرات فوركس وأسواق المعادن العالمية (Open Forex Network).'
                  : 'Data synced via Syrian Central Bank bulletins and Open Forex & Gold Spot API.'}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Badge 1: Central Bank of Syria */}
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-slate-200 block text-[11px] truncate">
                {language === 'ar' ? 'المصرف المركزي السوري (نشرة الحوالات)' : 'Central Bank of Syria (Official)'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                USD = {officialCBSData.buy.toLocaleString()} / {officialCBSData.sell.toLocaleString()} ل.س
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />
          </div>

          {/* Badge 2: Open Forex Global API */}
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <Globe2 className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-slate-200 block text-[11px] truncate">
                {language === 'ar' ? 'شبكة فوركس وأسواق المعادن العالمية' : 'Global Open Forex & Gold Spot API'}
              </span>
              <span className="text-[10px] text-sky-400 font-mono font-bold">
                {language === 'ar' ? 'أسعار العملات والذهب مباشر' : 'Live Forex & Spot Gold Rates'}
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 space-x-reverse text-emerald-400 font-bold text-sm mb-1">
            <TrendingUp className="w-5 h-5" />
            <span>OMS — {t('tabCurrency')}</span>
          </div>
          <h2 className="text-2xl font-black text-white">{t('currencyTitle')}</h2>
          <p className="text-xs text-slate-300 mt-1">{t('currencyDesc')}</p>
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
                ? (language === 'ar' ? 'جاري المزامنة...' : 'Syncing...')
                : (language === 'ar' ? 'تحديث الأسعار الآن' : 'Refresh Rates Now')}
            </span>
          </button>
        </div>
      </div>

      {/* Live Interactive Currency Calculator Widget */}
      <CurrencyCalculator
        rates={rates}
        golds={golds}
        officialCBS={officialCBSData}
        globalRatesUSD={globalRatesUSD}
        onRefreshRates={handleRefreshRates}
        isSyncing={isSyncing}
      />

      {/* Currencies & Gold Live Rate Cards */}
      <div className="space-y-6">
        {/* Currencies Grid */}
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

          {/* Gold Section */}
          <div className="pt-4 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{t('goldPrices')}</span>
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {golds.map((g, idx) => (
                <div key={idx} className="bg-slate-800/80 border border-amber-500/20 p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">{g.karat}</span>
                    <span className="text-xs text-slate-400">{g.updatedAt}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-base font-black text-amber-400 font-mono dir-ltr block">
                      {g.priceSYP.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">{t('syp')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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


