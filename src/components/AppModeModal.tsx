import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAppMode, AppMode } from '../context/AppModeContext';
import { X, Zap, Cpu, Layers, Check, Sparkles } from 'lucide-react';

interface AppModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppModeModal: React.FC<AppModeModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { appMode, setAppMode } = useAppMode();

  if (!isOpen) return null;

  const handleSelectMode = (mode: AppMode) => {
    setAppMode(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
      {/* Small, compact, proportionate modal window */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 max-w-xs sm:max-w-sm w-full shadow-2xl relative text-right dir-rtl space-y-3 transform scale-100 transition-all">
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100">
                {language === 'ar' ? 'نمط العرض والتشغيل' : 'App View Mode'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'اختر النمط المناسب لك بحجم خفيف' : 'Select preferred interface size'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg bg-slate-800/80 cursor-pointer"
            title={language === 'ar' ? 'إغلاق النافذة' : 'Close window'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Options Cards */}
        <div className="space-y-2">
          {/* Easy / Essential Mode */}
          <button
            type="button"
            onClick={() => handleSelectMode('essential')}
            className={`w-full p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              appMode === 'essential'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'ar' ? 'النمط السهل (الأساسي)' : 'Simple Essential'}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'واجهة خفيفة، تصفح سريع وسهل بدون تشتيت' : 'Distraction-free, minimal fast interface'}
              </p>
            </div>

            {appMode === 'essential' && (
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mr-2">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>

          {/* Advanced / Pro AI Mode */}
          <button
            type="button"
            onClick={() => handleSelectMode('advanced')}
            className={`w-full p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              appMode === 'advanced'
                ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/40 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{language === 'ar' ? 'النمط المتقدم (شامل + AI)' : 'Pro Advanced + AI'}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'البورصة، إعلانات المالك، الذكاء الاصطناعي والإشعارات' : 'Full Gold ticker, AI tools, owner space & alerts'}
              </p>
            </div>

            {appMode === 'advanced' && (
              <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 mr-2">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>
        </div>

        {/* Small Bottom Note */}
        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{language === 'ar' ? 'حفظ تلقائي للخيار' : 'Auto-saved option'}</span>
          </span>
          <button
            onClick={onClose}
            className="text-amber-400 hover:underline font-bold"
          >
            {language === 'ar' ? 'تم الاختيار' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
