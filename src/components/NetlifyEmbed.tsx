import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Globe, Maximize2, AlertCircle, Sparkles, CheckCircle2, ShieldAlert, MonitorPlay } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { OmsLogo } from './OmsLogo';

export const NetlifyEmbed: React.FC = () => {
  const { language } = useLanguage();
  const [currentUrl, setCurrentUrl] = useState<string>('https://stellar-sawine-ae83b5.netlify.app/');
  const [viewMode, setViewMode] = useState<'card' | 'iframe'>('card');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const presets = [
    { label: language === 'ar' ? 'تطبيق Netlify المباشر' : 'Netlify Live App', url: 'https://stellar-sawine-ae83b5.netlify.app/' },
  ];

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col flex-1 p-4 max-w-7xl w-full mx-auto space-y-5">
      {/* Control Toolbar & Mode Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{language === 'ar' ? 'مركز ربط موقع Netlify المباشر' : 'Netlify Live App Portal'}</span>
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ONLINE</span>
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'ar'
                ? 'ربط مباشر وسريع مع منصة Netlify السورية'
                : 'Direct connection to Netlify live deployment'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-xl">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'card'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بوابة التوجيه والتطبيقات' : 'Portal Hub'}</span>
          </button>
          <button
            onClick={() => setViewMode('iframe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'iframe'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إطار المعاينة المباشرة (Iframe)' : 'Live Iframe Preview'}</span>
          </button>
        </div>
      </div>

      {viewMode === 'card' ? (
        /* Card Hub View (100% Guaranteed Non-Broken Layout) */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500"></div>

          <div className="max-w-2xl mx-auto text-center space-y-4 py-4">
            <div className="mx-auto flex justify-center py-2">
              <OmsLogo size="xl" showSubtitle={true} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {language === 'ar' ? 'OMS Syrian Markets على Netlify' : 'OMS Syrian Markets on Netlify'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-mono bg-slate-950 border border-slate-800 py-2 px-4 rounded-xl inline-block">
                https://stellar-sawine-ae83b5.netlify.app/
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              {language === 'ar'
                ? 'تم تجهيز المنصة بالكامل! للتمتع بالسرعة القصوى وبدون قيود الأمان لمتصفحات الهواتف (X-Frame-Options)، اضغط على الزر أدناه لفتح التطبيق المباشر، أو تصفح الأقسام التفاعلية المحلية المتاحة في القائمة بالفي أعلى.'
                : 'App deployed & ready! For optimal mobile performance without iframe restriction, click below to launch the Netlify app directly.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/30 active:scale-95"
              >
                <span>{language === 'ar' ? 'فتح موقع Netlify المباشر ↗' : 'Open Live Netlify App ↗'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setViewMode('iframe')}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MonitorPlay className="w-4 h-4 text-indigo-400" />
                <span>{language === 'ar' ? 'تجربة إطار Iframe المضمن' : 'Try Embedded Iframe'}</span>
              </button>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid sm:grid-cols-3 gap-3 border-t border-slate-800/80 pt-6">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {language === 'ar' ? 'اتصال آمن SSL' : 'Secure SSL'}
                </span>
                <span className="text-[10px] text-slate-400">Netlify HTTPS Verified</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {language === 'ar' ? 'تحديث لحظي' : 'Real-time Sync'}
                </span>
                <span className="text-[10px] text-slate-400">OMS Production CDN</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {language === 'ar' ? 'متوافق مع الهواتف' : 'Mobile Ready'}
                </span>
                <span className="text-[10px] text-slate-400">Responsive iOS & Android</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Iframe View Option */
        <div className="space-y-3">
          {/* Top Bar for Iframe */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-2 space-x-reverse flex-1 max-w-xl">
              <div className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 font-mono w-full focus:outline-none"
                />
              </div>

              <button
                onClick={handleRefresh}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors"
                title="إعادة تحميل المعاينة"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors"
                title="فتح في نافذة جديدة"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2 rounded-lg transition-colors ${
                  isFullscreen ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title="ملء الشاشة"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'في حال ظهور رمز الورقة الرمادية المكسورة، فهذا بسبب قيود المتصفح (X-Frame-Options).'
                  : 'If a broken grey file icon appears, it is due to browser X-Frame-Options policies.'}
              </span>
            </div>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 rounded-lg shrink-0"
            >
              {language === 'ar' ? 'فتح المباشر ↗' : 'Open Direct ↗'}
            </a>
          </div>

          <div
            className={`bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative transition-all flex flex-col ${
              isFullscreen
                ? 'fixed inset-2 z-50 rounded-lg border-2 border-indigo-500'
                : 'min-h-[580px] flex-1'
            }`}
          >
            <iframe
              key={iframeKey}
              src={currentUrl}
              title="OMS Syrian Market App Embed"
              className="w-full h-full min-h-[580px] border-0 bg-white"
              allow="camera; microphone; geolocation; clipboard-write; autoplay; encrypted-media;"
            />
          </div>
        </div>
      )}
    </div>
  );
};


