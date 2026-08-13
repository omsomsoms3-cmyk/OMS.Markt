import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Share2,
  MoreVertical,
  PlusSquare,
  Sparkles,
  Monitor,
  Apple,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  ArrowDownCircle,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  // Auto-detect browser/platform on mount
  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setActivePlatform('ios');
    } else if (/Android/i.test(ua)) {
      setActivePlatform('android');
    } else {
      setActivePlatform('desktop');
    }

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccess(true);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        language === 'ar'
          ? 'اتبع التعليمات المرئية أدناه لتثبيت التطبيق مباشرة من قائمة متصفحك 👍'
          : 'Please follow the visual steps below to install from your browser menu.'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden relative my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-5 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/30 font-black shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'تثبيت تطبيق OMS على هاتفك' : 'Install OMS App on Phone'}</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {language === 'ar' ? 'مجاني وبدون متجر' : 'No Store Required'}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'ar'
                  ? 'تعليمات مصورة للتثبيت المباشر على الشاشة الرئيسية (Add to Home Screen)'
                  : 'Step-by-step visual guide for Add to Home Screen'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Status Alert if Already Installed */}
          {isInstalled && (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-extrabold">{language === 'ar' ? 'التطبيق مثبت بالفعل على جهازك!' : 'App is already installed!'}</p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  {language === 'ar'
                    ? 'أنت تعمل الآن في الوضع الأصلي كـ App مستقل بخصائص كاملة.'
                    : 'You are currently running in standalone app mode.'}
                </p>
              </div>
            </div>
          )}

          {/* Quick One-Click PWA Install Button (If supported by browser prompt) */}
          {deferredPrompt && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-slate-950 font-bold shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 shrink-0 text-amber-300 fill-amber-300" />
                <div>
                  <h4 className="text-sm font-black text-white">
                    {language === 'ar' ? 'متصفحك يدعم التثبيت المباشر!' : 'Direct One-Click Install Supported!'}
                  </h4>
                  <p className="text-xs text-emerald-100 font-medium">
                    {language === 'ar' ? 'اضغط الزر لتثبيت التطبيق على جهازك فوراً' : 'Tap below to add to home screen immediately'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-emerald-400 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تثبيت الآن بضغطة زر 🚀' : 'Install Now 🚀'}</span>
              </button>
            </div>
          )}

          {/* Iframe Warning & Direct Launch Section */}
          {typeof window !== 'undefined' && window.self !== window.top && (
            <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-start gap-2 text-amber-300">
                <ExternalLink className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-amber-200">
                    {language === 'ar' ? 'تتصفح التطبيق من داخل نافذة معاينة مغلقة؟' : 'Browsing inside preview iframe?'}
                  </h4>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    {language === 'ar' ? 'لتفعيل زر التثبيت والتنزيل المباشر على هاتفك بدون قيود المتصفح، افتح التطبيق في نافذة خاريجية أو انسخ الرابط المباشر:' : 'To enable direct installation and file downloads on your phone, open the app in a new window or copy the link:'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{language === 'ar' ? 'افتح في نافذة جديدة مباشرة 🚀' : 'Open in New Tab 🚀'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert(language === 'ar' ? 'تم نسخ رابط التطبيق المباشر! افتحه في متصفح Chrome أو Safari للتثبيت.' : 'App link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'نسخ الرابط المباشر 📋' : 'Copy Direct Link'}</span>
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
              {language === 'ar' ? 'اختر نظام تشغيل هاتفك أو جهازك:' : 'Select your OS or Device:'}
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActivePlatform('android')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePlatform === 'android'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>{language === 'ar' ? 'أندرويد (كروم)' : 'Android'}</span>
              </button>

              <button
                onClick={() => setActivePlatform('ios')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePlatform === 'ios'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Apple className="w-4 h-4 shrink-0" />
                <span>{language === 'ar' ? 'آيفون (سفاري)' : 'iPhone / iOS'}</span>
              </button>

              <button
                onClick={() => setActivePlatform('desktop')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePlatform === 'desktop'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Monitor className="w-4 h-4 shrink-0" />
                <span>{language === 'ar' ? 'كمبيوتر / لابتوب' : 'Desktop'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Android Chrome Instructions */}
          {activePlatform === 'android' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-black text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[11px]">1</span>
                  <span>{language === 'ar' ? 'خطوات التثبيت عبر متصفح كروم (Google Chrome):' : 'Chrome Android Installation Steps:'}</span>
                </h4>

                {/* Step 1 Illustration */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                  <div className="p-2.5 bg-slate-800 text-amber-400 rounded-xl font-black shrink-0 border border-amber-500/30">
                    <MoreVertical className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white">
                      {language === 'ar' ? 'الخطوة 1: افتح قائمة المتصفح' : 'Step 1: Open Chrome Menu'}
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'ar'
                        ? 'انقر على زر النقاط الثلاث (⋮) الموجود في أعلى الزاوية لمتصفح Chrome على هاتفك.'
                        : 'Tap the three dots (⋮) in the top-right corner of your Chrome browser.'}
                    </p>
                  </div>
                </div>

                {/* Step 2 Illustration */}
                <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-3 flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl font-black shrink-0 border border-emerald-500/30">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-2">
                      <span>{language === 'ar' ? 'الخطوة 2: اختر "التثبيت" أو "إضافة للرئيسية"' : 'Step 2: Tap "Install app" or "Add to Home screen"'}</span>
                      <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                        {language === 'ar' ? 'الزر المطلوب 🎯' : 'Target Option'}
                      </span>
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'ar'
                        ? 'انزل في القائمة واضغط على خيار "تثبيت التطبيق" (Install app) أو "الإضافة إلى الشاشة الرئيسية" (Add to Home screen).'
                        : 'Look for "Install app" or "Add to Home screen" in the menu list.'}
                    </p>

                    {/* Mock Browser Item Visual */}
                    <div className="bg-slate-950 border border-emerald-500/50 rounded-xl p-2.5 flex items-center justify-between text-emerald-300 text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'ar' ? 'تثبيت التطبيق (Install App)' : 'Install app'}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                        {language === 'ar' ? 'انقر هنا' : 'Tap Here'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3 Illustration */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                  <div className="p-2.5 bg-slate-800 text-teal-400 rounded-xl font-black shrink-0 border border-teal-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white">
                      {language === 'ar' ? 'الخطوة 3: تأكيد التثبيت' : 'Step 3: Confirm Installation'}
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'ar'
                        ? 'اضغط على كلمة "تثبيت" في الرسالة المنبثقة. ستظهر أيقونة OMS فوراً على شاشة هاتفك الرئيسية كـ App أصلي.'
                        : 'Click "Install" in the pop-up window. The OMS app icon will immediately appear on your mobile home screen.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: iOS Safari Instructions */}
          {activePlatform === 'ios' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-black text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[11px]">1</span>
                  <span>{language === 'ar' ? 'خطوات التثبيت للآيفون عبر متصفح سفاري (Safari):' : 'iPhone Safari Installation Steps:'}</span>
                </h4>

                {/* Step 1 Illustration */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                  <div className="p-2.5 bg-slate-800 text-sky-400 rounded-xl font-black shrink-0 border border-sky-500/30">
                    <Share2 className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white">
                      {language === 'ar' ? 'الخطوة 1: انقر على زر المشاركة (Share)' : 'Step 1: Tap Share Button'}
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'ar'
                        ? 'في أسفل شاشة Safari بالآيفون، انقر على زر المشاركة (مربع يحتوي على سهم للأعلى 📤).'
                        : 'At the bottom of your Safari screen, tap the Share icon (square with arrow pointing up 📤).'}
                    </p>
                  </div>
                </div>

                {/* Step 2 Illustration */}
                <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-3 flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl font-black shrink-0 border border-emerald-500/30">
                    <PlusSquare className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-2">
                      <span>{language === 'ar' ? 'الخطوة 2: اختر "إضافة إلى الشاشة الرئيسية"' : 'Step 2: Select "Add to Home Screen"'}</span>
                      <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                        {language === 'ar' ? 'الزر المطلوب 🎯' : 'Target Option'}
                      </span>
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'ar'
                        ? 'انزل في القائمة المنبثقة واضغط على "إضافة إلى الشاشة الرئيسية" (Add to Home Screen ➕).'
                        : 'Scroll down the share sheet and tap "Add to Home Screen".'}
                    </p>

                    {/* Mock iOS Share Item Visual */}
                    <div className="bg-slate-950 border border-emerald-500/50 rounded-xl p-2.5 flex items-center justify-between text-emerald-300 text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <PlusSquare className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'ar' ? 'إضافة إلى الشاشة الرئيسية (Add to Home Screen)' : 'Add to Home Screen'}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                        {language === 'ar' ? 'انقر هنا' : 'Tap Here'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3 Illustration */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                  <div className="p-2.5 bg-slate-800 text-teal-400 rounded-xl font-black shrink-0 border border-teal-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white">
                      {language === 'ar' ? 'الخطوة 3: اضغط على "إضافة"' : 'Step 3: Tap "Add"'}
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'ar'
                        ? 'انقر على زر "إضافة" (Add) أعلى الزاوية. سيتم إنشاء تطبيق OMS بنجاح على الآيفون!'
                        : 'Tap "Add" in the top-right corner to save OMS App to your iPhone home screen.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Desktop Instructions */}
          {activePlatform === 'desktop' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-black text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[11px]">1</span>
                  <span>{language === 'ar' ? 'خطوات التثبيت للكمبيوتر (Chrome / Edge / Brave):' : 'Desktop Browser Installation Steps:'}</span>
                </h4>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                  <div className="p-2.5 bg-slate-800 text-amber-400 rounded-xl font-black shrink-0 border border-amber-500/30">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white">
                      {language === 'ar' ? 'الخطوة 1: انقر أيقونة الشاشة في شريط الرابط' : 'Step 1: Click Install Icon in Address Bar'}
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'ar'
                        ? 'في شريط عنوان المتصفح اعلى الشاشة، ستلاحظ أيقونة كمبيوتر صغيرة أو علامة (+) تُسمى "تثبيت OMS App".'
                        : 'In your browser address bar, look for the small monitor or (+) icon labeled "Install OMS App".'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-start gap-3">
                  <div className="p-2.5 bg-slate-800 text-emerald-400 rounded-xl font-black shrink-0 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white">
                      {language === 'ar' ? 'الخطوة 2: تأكيد التثبيت' : 'Step 2: Confirm Installation'}
                    </p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'ar'
                        ? 'اضغط على Install وسيفتح التطبيق فوراً في نافذة مستقلة وبدون شريط متصفح كأنه برنامج كمبيوتر أصلي.'
                        : 'Click Install to launch OMS App in its own dedicated, borderless window.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              {language === 'ar' ? 'لماذا تُثبت التطبيق على شاشتك؟' : 'Key App Features & Benefits:'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200 text-[11px] font-bold">
                  {language === 'ar' ? 'فتح سريع بضغطة واحدة' : 'One-Tap Instant Open'}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200 text-[11px] font-bold">
                  {language === 'ar' ? 'خفيف جداً (حجم محمي < 3MB)' : 'Ultra-Lightweight (<3MB)'}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200 text-[11px] font-bold">
                  {language === 'ar' ? 'تحديثات تلقائية لحظية' : 'Real-time Auto Updates'}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200 text-[11px] font-bold">
                  {language === 'ar' ? 'عمل بدون إنترنت (مؤقتاً)' : 'Offline Support'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 hidden sm:flex">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{language === 'ar' ? 'تطبيق OMS آمن ومحمي 100%' : 'OMS App is 100% secure'}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              {language === 'ar' ? 'فهمت، شكراً 👍' : 'Got it, Thanks 👍'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
