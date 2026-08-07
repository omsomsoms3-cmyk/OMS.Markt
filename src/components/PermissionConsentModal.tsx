import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePermissions, PERMISSION_METADATA, PermissionType } from '../context/PermissionContext';
import { ShieldCheck, ShieldAlert, X, Check, Mic, Image, Video, Lock, Sparkles, Download, Volume2 } from 'lucide-react';

export const PermissionConsentModal: React.FC = () => {
  const { language } = useLanguage();
  const { activePermissionRequest, closeConsentModal, confirmConsent } = usePermissions();

  if (!activePermissionRequest) return null;

  const metadata = PERMISSION_METADATA[activePermissionRequest];

  const getIconComponent = (type: PermissionType) => {
    switch (type) {
      case 'microphone':
        return <Mic className="w-8 h-8 text-amber-400 animate-bounce" />;
      case 'studio':
        return <Image className="w-8 h-8 text-emerald-400 animate-pulse" />;
      case 'video_download':
        return <Download className="w-8 h-8 text-sky-400 animate-bounce" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative text-right dir-rtl overflow-hidden">
        {/* Top Glow Decor */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={closeConsentModal}
          className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 pt-1">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-black rounded-full flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'طلب إذن وصول عند الاستخدام 🛡️' : 'On-Demand Permission Request 🛡️'}</span>
          </span>
        </div>

        {/* Permission Main Icon & Title */}
        <div className="flex items-start gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shadow-inner">
          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-700 shrink-0">
            {getIconComponent(activePermissionRequest)}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white leading-tight">
              {language === 'ar' ? metadata.titleAr : metadata.titleEn}
            </h3>
            <span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              {language === 'ar' ? `الفئة: ${metadata.badgeAr}` : `Category: ${metadata.badgeEn}`}
            </span>
          </div>
        </div>

        {/* Detailed Explanation text */}
        <div className="space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            {language === 'ar' ? metadata.descAr : metadata.descEn}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold px-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'ar'
                ? 'يتم استخدام الإذن فقط عند طلبك للخدمة، ولا يُفعّل تلقائياً أو في الخلفية.'
                : 'Permission is only active when you manually initiate the action.'}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={confirmConsent}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{language === 'ar' ? 'موافقة وسماح ✨' : 'Grant & Allow ✨'}</span>
          </button>

          <button
            type="button"
            onClick={closeConsentModal}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>{language === 'ar' ? 'إلغاء وتراجع' : 'Deny / Cancel'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
