import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, SignalLow, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type NetworkStatusType = 'good' | 'weak' | 'offline';

export const NetworkQualityIndicator: React.FC = () => {
  const { language } = useLanguage();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusType>('good');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkConnectionQuality = async () => {
    if (typeof navigator === 'undefined') return;

    // 1. Check if completely offline
    if (!navigator.onLine) {
      setNetworkStatus('offline');
      setConnectionDetails(language === 'ar' ? 'غير متصل بالإنترنت' : 'No internet connection');
      return;
    }

    // 2. Check Network Information API if supported
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    let isSlowConnection = false;
    let detailsStr = '';

    if (conn) {
      const effectiveType = conn.effectiveType || '';
      const rtt = conn.rtt || 0;
      const downlink = conn.downlink || 0;

      if (effectiveType === 'slow-2g' || effectiveType === '2g' || rtt > 800 || (downlink > 0 && downlink < 0.8)) {
        isSlowConnection = true;
        detailsStr = language === 'ar'
          ? `شبكة بطيئة (${effectiveType || '2G/3G'} | زمني ${rtt}ms)`
          : `Slow network (${effectiveType || '2G/3G'} | ${rtt}ms RTT)`;
      }
    }

    // 3. Perform a quick ping probe to verify latency
    setIsChecking(true);
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`/manifest.json?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - startTime);
      setPingLatency(elapsed);

      if (!res.ok) {
        setNetworkStatus('weak');
        setConnectionDetails(language === 'ar' ? 'استجابة الخادم بطيئة جداً' : 'Server response is slow');
      } else if (elapsed > 900 || isSlowConnection) {
        setNetworkStatus('weak');
        setConnectionDetails(
          detailsStr ||
            (language === 'ar'
              ? `الاتصال ضعيف (${elapsed}ms) - قد تتأخر الصور والبيانات`
              : `Weak connection (${elapsed}ms) - images may load slowly`)
        );
      } else {
        setNetworkStatus('good');
        setConnectionDetails(language === 'ar' ? `الاتصال ممتاز (${elapsed}ms)` : `Connection good (${elapsed}ms)`);
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      if (err.name === 'AbortError' || elapsed >= 3000) {
        setNetworkStatus('weak');
        setConnectionDetails(
          language === 'ar'
            ? 'الاتصال بطيء جداً (انتهت المهلة) - جاري التصفح من ذاكرة التخزين'
            : 'Very slow connection (timeout) - using cache'
        );
      } else if (!navigator.onLine) {
        setNetworkStatus('offline');
        setConnectionDetails(language === 'ar' ? 'انقطع الاتصال بالإنترنت' : 'Internet connection lost');
      } else {
        setNetworkStatus('weak');
        setConnectionDetails(language === 'ar' ? 'ضعف وقتي في التغطية' : 'Temporary network lag');
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnectionQuality();

    // Listeners for window online/offline
    const handleOnline = () => checkConnectionQuality();
    const handleOffline = () => {
      setNetworkStatus('offline');
      setConnectionDetails(language === 'ar' ? 'غير متصل بالإنترنت' : 'No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API change listener if available
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn && conn.addEventListener) {
      conn.addEventListener('change', checkConnectionQuality);
    }

    // Periodic ping check every 20 seconds
    const intervalId = setInterval(checkConnectionQuality, 20000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn && conn.removeEventListener) {
        conn.removeEventListener('change', checkConnectionQuality);
      }
      clearInterval(intervalId);
    };
  }, [language]);

  // If status is good, we show a clean subtle indicator or hide unless hovered/clicked
  return (
    <div className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={() => {
          setShowTooltip(!showTooltip);
          checkConnectionQuality();
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-extrabold transition-all border cursor-pointer active:scale-95 ${
          networkStatus === 'offline'
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse shadow-sm shadow-rose-500/20'
            : networkStatus === 'weak'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-bounce shadow-sm shadow-amber-500/20'
            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        }`}
        title={connectionDetails}
      >
        {networkStatus === 'offline' ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="hidden sm:inline font-black text-rose-300">
              {language === 'ar' ? 'بدون إنترنت' : 'Offline'}
            </span>
          </>
        ) : networkStatus === 'weak' ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-black text-amber-300">
              {language === 'ar' ? 'إنترنت بطيء ⚠️' : 'Slow Network ⚠️'}
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden lg:inline text-emerald-300 font-bold text-[10px]">
              {pingLatency ? `${pingLatency}ms` : 'متصل'}
            </span>
          </>
        )}

        {isChecking && <RefreshCw className="w-2.5 h-2.5 animate-spin text-slate-400 shrink-0" />}
      </button>

      {/* Popover / Tooltip when clicked or hovered */}
      {showTooltip && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-64 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 shadow-2xl z-50 text-right dir-rtl animate-in fade-in zoom-in-95 space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'حالة اتصال الشبكة' : 'Network Quality Status'}</span>
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                networkStatus === 'offline'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : networkStatus === 'weak'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {networkStatus === 'offline'
                ? language === 'ar' ? 'منقطع' : 'Offline'
                : networkStatus === 'weak'
                ? language === 'ar' ? 'ضعيف / بطيء' : 'Weak'
                : language === 'ar' ? 'ممتاز' : 'Good'}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {connectionDetails}
          </p>

          {networkStatus === 'weak' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2 text-[10px] text-amber-300 leading-normal space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span>💡 ملاحظة هامة:</span>
              </p>
              <p className="text-slate-300">
                {language === 'ar'
                  ? 'ضعف الاتصال قد يسبب تأخراً في تحميل صور السيارات والعقارات عالية الدقة. المنصة تقوم تلقائياً بالتصفح من ذاكرة التخزين المؤقت لتحسين السرعة.'
                  : 'Weak connection may delay HD image loading. App uses local caching to stay responsive.'}
              </p>
            </div>
          )}

          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>{pingLatency !== null ? `زمن الاستجابة: ${pingLatency}ms` : ''}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                checkConnectionQuality();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{language === 'ar' ? 'إعادة الفحص' : 'Recheck'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
