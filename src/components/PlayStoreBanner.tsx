import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, Shield, Star, ExternalLink, Sparkles, X, Layers, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PlayStoreBannerProps {
  onOpenInstallGuide?: () => void;
}

export const PlayStoreBanner: React.FC<PlayStoreBannerProps> = ({ onOpenInstallGuide }) => {
  const { language } = useLanguage();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed) return null;

  return (
    <>
      {/* Top Play Store Ready Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-b border-emerald-500/30 text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 animate-pulse">
              <Smartphone className="w-4 h-4" />
            </span>
            <span className="font-bold text-emerald-300">
              {language === 'ar' ? 'تثبيت التطبيق على الهواتف:' : 'Install App on Mobile:'}
            </span>
            <span className="text-slate-300 hidden md:inline">
              {language === 'ar'
                ? 'تثبيت مباشر على الشاشة الرئيسية (Add to Home Screen) ليعمل كتطبيق أصلي 📲'
                : 'Direct installation to Home Screen for native app experience 📲'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenInstallGuide && (
              <button
                onClick={onOpenInstallGuide}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تعليمات التثبيت الفوري 📲' : 'Install Guide 📲'}</span>
              </button>
            )}

            <button
              onClick={() => setIsOpenModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'معلومات Google Play' : 'Google Play Status'}</span>
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal with Full Readiness & Download Instructions */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/20 font-black">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                     OMS Market Platform 1.0
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      v1.0.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? 'جاهز للتثبيت والرفع المباشر' : 'Ready for direct launch & APK bundle'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {language === 'ar' ? 'قائمة الجاهزية والمعايير المحققة:' : 'Readiness & Compliance Checklist:'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">{language === 'ar' ? 'متوافق مع Android 14+' : 'Android 14+ Ready'}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">{language === 'ar' ? 'يدعم وضع PWA و WebApp' : 'PWA & WebApp Support'}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">{language === 'ar' ? 'واجهة عربية بالكامل (RTL)' : 'Full Arabic RTL UI'}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">{language === 'ar' ? 'نظام حماية وإبلاغات آمن' : 'Secure Reports & Anti-Spam'}</span>
                </div>
              </div>
            </div>

            {/* Action options */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'طرق التشغيل والتثبيت الفوري:' : 'Instant Run & Download Options:'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'يمكنك مشاركة رابط المنصة مباشرة مع المستخدمين، أو تغليف الرابط عبر TWA (Trusted Web Activity) / Bubblewrap لرفعه كملف .aab/.apk على Google Play Console في دقائق.'
                  : 'You can share this live app URL directly or build an APK/AAB bundle using Bubblewrap / TWA for Play Store Console submission.'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'OMS Market Platform', url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert(language === 'ar' ? 'تم نسخ رابط التطبيق للحافظة!' : 'App link copied to clipboard!');
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{language === 'ar' ? 'مشاركة رابط التطبيق' : 'Share App Link'}</span>
              </button>

              <button
                onClick={() => setIsOpenModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {language === 'ar' ? 'فهمت، المنصة جاهزة 👍' : 'Got it, App is Ready 👍'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
