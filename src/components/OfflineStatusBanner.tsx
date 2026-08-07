import React, { useState, useEffect } from 'react';
import { WifiOff, Database, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { subscribeNetworkStatus } from '../lib/swRegister';

export const OfflineStatusBanner: React.FC = () => {
  const { language } = useLanguage();
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeNetworkStatus((status) => {
      setIsOffline(status.isOffline);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/40 text-amber-200 py-2.5 px-4 text-xs z-50 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 animate-pulse">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-300">
              {language === 'ar' ? 'وضع العمل بدون إنترنت (Offline Mode):' : 'Offline Mode Active:'}
            </span>
            <span className="text-slate-300 mr-2 ml-2">
              {language === 'ar'
                ? 'تيعمل التطبيق الآن عبر الخدمة المخزنة مؤقتاً (Service Worker Cache). البيانات والإعلانات المحفوظة متاحة للتصفح.'
                : 'App is running via Service Worker cache. Saved listings & offline data remain accessible.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-500/10 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'التخزين المؤقت نشط ✓' : 'Cache Active ✓'}</span>
          </span>
          <button
            onClick={() => window.location.reload()}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={language === 'ar' ? 'إعادة التحديث' : 'Reload'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
