import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../context/PermissionContext';
import { useAppMode } from '../context/AppModeContext';
import { Settings, Globe, X, Check, ShieldCheck, Moon, Sun, Laptop, Trash2, Sparkles, Lock, Mic, Image, Download, Shield, Cpu, Layers } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAutoCleanup?: () => void;
  onOpenIntegrations?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenAutoCleanup, onOpenIntegrations }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setThemeMode, isDark } = useTheme();
  const { permissions, grantPermission, revokePermission } = usePermissions();
  const { appMode, setAppMode } = useAppMode();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-5 relative text-right dir-rtl my-auto max-h-[90vh] overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-800 pb-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t('settingsTitle')}</h3>
            <p className="text-xs text-slate-400">OMS Syrian Markets Preferences</p>
          </div>
        </div>

        {/* Theme Mode Switcher Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>{language === 'ar' ? 'مظهر التطبيق (الوضع الليلي / النهاري)' : 'App Theme Mode'}</span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
                theme === 'dark'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              <span className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'الوضع الليلي (مظلم)' : 'Dark Mode'}</span>
              </span>
              {theme === 'dark' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
                theme === 'light'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'الوضع النهاري (مضيء)' : 'Light Mode'}</span>
              </span>
              {theme === 'light' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Feature Mode Switcher: Essential (Simple) vs Advanced (Tech & AI) */}
        <div className="space-y-3 bg-slate-950/90 border border-amber-500/30 p-3.5 rounded-2xl">
          <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'نمط الميزات والإمكانيات' : 'App Features Mode'}</span>
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">
              {appMode === 'essential' ? (language === 'ar' ? 'بسيط وسريع' : 'Simple') : (language === 'ar' ? 'شامل وتقني + AI' : 'Pro Tech & AI')}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setAppMode('essential')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                appMode === 'essential'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'المود البسيط (الأساسي)' : 'Simple Essential'}</span>
                </span>
                {appMode === 'essential' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {language === 'ar' ? 'يتضمن العناصر والعروض الأساسية فقط بخفة وسرعة.' : 'Essential features only for fast and simple browsing.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setAppMode('advanced')}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                appMode === 'advanced'
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>{language === 'ar' ? 'المود المتقدم والشامل' : 'Pro Tech & AI'}</span>
                </span>
                {appMode === 'advanced' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {language === 'ar' ? 'تسهيلات الذكاء الاصطناعي، شريط البورصة، الربط البرمجي والإشعارات.' : 'Includes AI tools, Gold/FX ticker, APIs & integrations.'}
              </p>
            </button>
          </div>
        </div>

        {/* Language Selection Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t('selectLanguage')}</span>
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
                language === 'ar'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="text-base">🇸🇾</span>
                <span className="truncate">العربية</span>
              </span>
              {language === 'ar' && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
                language === 'en'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="text-base">🇬🇧</span>
                <span className="truncate">English</span>
              </span>
              {language === 'en' && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setLanguage('de')}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
                language === 'de'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="text-base">🇩🇪</span>
                <span className="truncate">Deutsch</span>
              </span>
              {language === 'de' && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
            </button>
          </div>
        </div>

        {/* On-Demand Permissions Control Section */}
        <div className="space-y-2.5 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'أذونات وسماح الوصول (عند الطلب فقط 🛡️)' : 'On-Demand App Permissions 🛡️'}</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              {language === 'ar' ? 'بدون طلب عند بدء التشغيل' : 'No boot prompts'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Microphone */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold text-slate-200">{language === 'ar' ? 'المسجل الصوتي والميكروفون' : 'Microphone & Audio'}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'لتسجيل المحادثات الصوتية' : 'For live voice messages'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => permissions.microphone ? revokePermission('microphone') : grantPermission('microphone')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                  permissions.microphone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {permissions.microphone ? (language === 'ar' ? 'مسموح ✓' : 'Allowed ✓') : (language === 'ar' ? 'يتطلب موافقة' : 'Needs Prompt')}
              </button>
            </div>

            {/* Studio / Gallery */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-slate-200">{language === 'ar' ? 'الدخول للاستوديو والمعرض' : 'Studio / Photo Gallery'}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'لاختيار صور وفيديوهات الإعلانات' : 'For listing media uploads'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => permissions.studio ? revokePermission('studio') : grantPermission('studio')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                  permissions.studio
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {permissions.studio ? (language === 'ar' ? 'مسموح ✓' : 'Allowed ✓') : (language === 'ar' ? 'يتطلب موافقة' : 'Needs Prompt')}
              </button>
            </div>

            {/* Video Download */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-bold text-slate-200">{language === 'ar' ? 'تنزيل وتخزين الفيديوهات' : 'Video Download & Storage'}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'لحفظ وسائط الفيديوهات بالجهاز' : 'For offline video saving'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => permissions.video_download ? revokePermission('video_download') : grantPermission('video_download')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                  permissions.video_download
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {permissions.video_download ? (language === 'ar' ? 'مسموح ✓' : 'Allowed ✓') : (language === 'ar' ? 'يتطلب موافقة' : 'Needs Prompt')}
              </button>
            </div>
          </div>
        </div>

        {/* Connected Programs & Integrations Suite */}
        {onOpenIntegrations && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-sky-950/30 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{language === 'ar' ? 'مركز الربط والبرامج الموصولة (8/8)' : 'Connected Programs & APIs (8/8)'}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ar' ? 'فحص ومزامنة الاتصال مع قواعد البيانات، واتساب، تلغرام، خرائط، وبوات الإشعارات' : 'Inspect and sync Firebase, FCM, WhatsApp, Telegram, Maps, AdSense, & PWA'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenIntegrations();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shadow shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'ar' ? 'مركز الربط ⚡️' : 'Bridges ⚡️'}</span>
            </button>
          </div>
        )}

        {/* Auto Cleanup Tool Section */}
        {onOpenAutoCleanup && (
          <div className="bg-gradient-to-r from-rose-950/40 via-slate-950 to-amber-950/30 border border-rose-500/40 p-3 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>برنامج حذف الإعلانات الخاملة والقديمة</span>
              </div>
              <p className="text-[10px] text-slate-400">
                تنظيف المنشورات بدون تفاعلات وتنبيه الناشرين آلياً
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAutoCleanup();
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-all shadow shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تشغيل الحذف 🧹</span>
            </button>
          </div>
        )}

        {/* System & Layout Info */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>إعلانات جوجل أدسنس (Google AdSense)</span>
            <span className="font-mono text-amber-400 font-bold">
              {language === 'ar' ? 'مساحة مخصصة غير مزعجة ✓' : 'Non-intrusive slot ✓'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>اتجاه النصوص (Layout Direction)</span>
            <span className="font-mono text-emerald-400 font-bold uppercase">
              {language === 'ar' ? 'RTL (يمين إلى يسار)' : 'LTR (Left to Right)'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>إصدار المنصة (Platform Version)</span>
            <span className="font-mono text-slate-300">v2.4 OMS</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-indigo-600/30"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};
