import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { TabType } from '../types';
import {
  Sparkles,
  TrendingUp,
  Car,
  Building2,
  Briefcase,
  CarFront,
  BookOpen,
  PlusCircle,
  Bookmark,
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Zap,
  HelpCircle,
  Layers,
  MapPin,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface AppTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: TabType) => void;
  onOpenCreateAd?: () => void;
}

interface TourStep {
  id: number;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  icon: React.ReactNode;
  accentColor: string;
  bgGradient: string;
  targetTab?: TabType;
  featuresAr: string[];
  featuresEn: string[];
  actionLabelAr?: string;
  actionLabelEn?: string;
}

export const AppTourModal: React.FC<AppTourModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenCreateAd,
}) => {
  const { language, isRtl } = useLanguage();
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      id: 1,
      titleAr: 'أهلاً بك في تطبيق OMS الأسواق السورية',
      titleEn: 'Welcome to OMS Syrian Markets',
      subtitleAr: 'منصتك الشاملة لأسعار الصرف والسيارات والعقارات والخدمات',
      subtitleEn: 'Your ultimate hub for currency rates, cars, real estate & services',
      descAr: 'تطبيق OMS يقدم لك تجربة متكاملة لمتابعة حركة السوق السوري لحظة بلحظة، مع أدوات ذكية ومميزات حصرية تلبي كل احتياجاتك اليومية.',
      descEn: 'OMS provides an all-in-one platform to track the Syrian market in real-time with smart tools tailored for your daily needs.',
      badgeAr: 'دليل الاستخدام السريع',
      badgeEn: 'Quick Tour Guide',
      icon: <Compass className="w-8 h-8 text-amber-400" />,
      accentColor: 'amber',
      bgGradient: 'from-amber-500/20 via-slate-900 to-slate-950',
      featuresAr: [
        'أسعار الصرف والذهب بتحديثات حية وموثوقة',
        'سوق السيارات والعقارات والوظائف بين يديك',
        'خدمة التكسي والتوصيل ودفتر الديون الشخصي',
        'دعم العمل بدون إنترنت ونظام تنبيهات فوري'
      ],
      featuresEn: [
        'Live & verified exchange and gold rates',
        'Cars, Real Estate, and Job listings',
        'Intercity taxi/delivery and personal ledger',
        'Offline mode support & instant push alerts'
      ]
    },
    {
      id: 2,
      titleAr: 'قسم أسعار الصرف والذهب',
      titleEn: 'Currency & Gold Market',
      subtitleAr: 'متابعة حية للأسعار مع حاسبة تحويل سريعة ومخططات',
      subtitleEn: 'Live price tracking with instant calculator & trend charts',
      descAr: 'تابع أسعار الدولار واليورو والذهب في دمشق وحلب وحمص وباقي المحافظات، واستخدم حاسبة الصرف السريعة لتحويل المبالغ بدقة عالية.',
      descEn: 'Track USD, EUR, and Gold prices across Damascus, Aleppo, Homs, and all governorates with instant conversion calculators.',
      badgeAr: 'القسم الأول',
      badgeEn: 'Section 1',
      icon: <TrendingUp className="w-8 h-8 text-emerald-400" />,
      accentColor: 'emerald',
      bgGradient: 'from-emerald-500/20 via-slate-900 to-slate-950',
      targetTab: 'currency',
      featuresAr: [
        'شريط متحرك علوي لأسعار السوق المباشرة',
        'حاسبة فورية للتحويل بين USD / SYP / EUR',
        'مخطط تحليلي لتقلبات أسعار الصرف والذهب',
        'تحديد أسعار المحافظات السورية بمرونة'
      ],
      featuresEn: [
        'Live ticker banner for market rates',
        'Instant multi-currency converter',
        'Interactive rate fluctuation charts',
        'Governorate-specific price filters'
      ]
    },
    {
      id: 3,
      titleAr: 'أقسام السيارات والعقارات والوظائف',
      titleEn: 'Cars, Properties & Jobs',
      subtitleAr: 'تصفح آلاف الإعلانات أو أضف إعلانك الخاص بسهولة',
      subtitleEn: 'Browse thousands of listings or post your own effortlessly',
      descAr: 'استعرض سيارات للبيع أو الإيجار، عقارات سكنية وتجارية، وفرص عمل متنوعة في كل المدن. استعمل الفلاتر المتقدمة للوصول إلى طلبك بسرعة.',
      descEn: 'Explore cars, residential/commercial properties, and job vacancies. Use advanced search filters by city, price range, and category.',
      badgeAr: 'القسم الثاني',
      badgeEn: 'Section 2',
      icon: <Car className="w-8 h-8 text-cyan-400" />,
      accentColor: 'cyan',
      bgGradient: 'from-cyan-500/20 via-slate-900 to-slate-950',
      targetTab: 'cars',
      featuresAr: [
        'فلترة متقدمة بالسعر والمدينة والحالة',
        'تصفح الصور بدقة عالية والتواصل المباشر',
        'عرض الأسعار بالدولار والليرة السورية',
        'إتاحة خيار حفظ الإعلانات للرجوع إليها'
      ],
      featuresEn: [
        'Advanced price, city, and condition filter',
        'High-resolution gallery & direct call/WhatsApp',
        'Dual price display in USD and SYP',
        'Bookmark favorite listings for offline view'
      ]
    },
    {
      id: 4,
      titleAr: 'خدمة التكسي ودفتر الديون',
      titleEn: 'Taxi Delivery & Financial Ledger',
      subtitleAr: 'طلب توصيل وتنظيم حساباتك المالية بأمان',
      subtitleEn: 'Order rides/deliveries & manage your debts securely',
      descAr: 'اطلب تكسي أو شحنة بين المدن والمحافظات بكل سهولة. واستفد من دفتر الديون لتسجيل مستحقاتك وديونك مع آسبقية الحفظ المحلي الآمن.',
      descEn: 'Request taxi rides or courier delivery between governorates, and organize your personal receivables and debts with local privacy.',
      badgeAr: 'القسم الثالث',
      badgeEn: 'Section 3',
      icon: <BookOpen className="w-8 h-8 text-indigo-400" />,
      accentColor: 'indigo',
      bgGradient: 'from-indigo-500/20 via-slate-900 to-slate-950',
      targetTab: 'taxidelivery',
      featuresAr: [
        'طلب رحلات وتكسي وتوصيل طرود فورية',
        'دفتر ديون شخصي لحساب المبالغ المستحقة والمدفوعة',
        'مشاركة تفاصيل الرحلات والإعلانات بنقرة زر',
        'حفظ البيانات على جهازك وبقواعد بيانات آمنة'
      ],
      featuresEn: [
        'Instant taxi rides and parcel delivery requests',
        'Personal ledger tracking owed and paid balances',
        'One-tap web sharing for requests & listings',
        'Secure local storage and cloud syncing'
      ]
    },
    {
      id: 5,
      titleAr: 'إضافة إعلاناتك والتنبيهات المباشرة',
      titleEn: 'Post Ads & Live Notifications',
      subtitleAr: 'انشر إعلانك الآن وكن على اطلاع دائم بأحدث العروض',
      subtitleEn: 'Publish your listings & receive instant push updates',
      descAr: 'اضغط على زر (+ أضف إعلان) في أي وقت لنشر سيارتك، عقارك، أو طلب التوصيل. وفعّل التنبيهات ليصلك كل جديد فور حدوثه!',
      descEn: 'Tap the (+ Post Ad) button anytime to list items. Enable push notifications to stay informed of price changes and new offers.',
      badgeAr: 'جاهز للبدء',
      badgeEn: 'Ready to Go',
      icon: <PlusCircle className="w-8 h-8 text-amber-400" />,
      accentColor: 'amber',
      bgGradient: 'from-amber-500/20 via-slate-900 to-slate-950',
      targetTab: 'saved',
      featuresAr: [
        'إضافة إعلان مجاني بسلاسة مع رفع الصور',
        'تأكيد الإعلانات المحفوظة وإدارة التنبيهات',
        'التنقل المريح بين الأوضاع الليلي والنهاري',
        'إمكانية إعادة تشغيل هذه الجولة من الإعدادات'
      ],
      featuresEn: [
        'Free ad publishing with multiple photo uploads',
        'Manage saved listings & notifications',
        'Seamless Dark / Light mode switching',
        'Re-run this tour anytime from Settings'
      ],
      actionLabelAr: 'ابدأ تصفح التطبيق الآن',
      actionLabelEn: 'Start Exploring App Now'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Navigate tabs as user progresses through the tour
  const handleStepChange = (index: number) => {
    setCurrentStep(index);
    const target = steps[index]?.targetTab;
    if (target && onSelectTab) {
      onSelectTab(target);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('oms_tour_completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={handleComplete}
    >
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative text-right dir-rtl my-auto overflow-hidden transition-all duration-300 bg-gradient-to-b ${step.bgGradient}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop decorative effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              {language === 'ar' ? step.badgeAr : step.badgeEn}
            </span>
            <span className="text-xs text-slate-400 font-semibold dir-ltr">
              {currentStep + 1} / {steps.length}
            </span>
          </div>

          <button
            onClick={handleComplete}
            title={language === 'ar' ? 'تخطي الجولة' : 'Skip Tour'}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-all active:scale-95 flex items-center gap-1 text-xs cursor-pointer"
          >
            <span className="hidden sm:inline">{language === 'ar' ? 'تخطي' : 'Skip'}</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Step Content */}
        <div className="py-5 space-y-4 relative z-10">
          {/* Step Icon & Title */}
          <div className="flex items-start gap-3.5">
            <div className="p-3.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-lg shrink-0">
              {step.icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                {language === 'ar' ? step.titleAr : step.titleEn}
              </h3>
              <p className="text-xs text-amber-400/90 font-medium">
                {language === 'ar' ? step.subtitleAr : step.subtitleEn}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 border border-slate-800/80 p-3.5 rounded-2xl">
            {language === 'ar' ? step.descAr : step.descEn}
          </p>

          {/* Key Features Bullet Points */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'أبرز مميزات هذا المكون:' : 'Key Highlights:'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(language === 'ar' ? step.featuresAr : step.featuresEn).map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="line-clamp-2">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 py-2 relative z-10">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleStepChange(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-7 bg-amber-400 shadow-md shadow-amber-500/50'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`${language === 'ar' ? 'الخطوة' : 'Step'} ${idx + 1}`}
            />
          ))}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 gap-3 relative z-10">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{language === 'ar' ? 'السابق' : 'Previous'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-all cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق الدليل' : 'Dismiss'}
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 && onOpenCreateAd && (
              <button
                type="button"
                onClick={() => {
                  handleComplete();
                  onOpenCreateAd();
                }}
                className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'ar' ? 'أضف إعلان' : 'Post Ad'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>
                {currentStep === steps.length - 1
                  ? step.actionLabelAr && language === 'ar'
                    ? step.actionLabelAr
                    : step.actionLabelEn && language !== 'ar'
                    ? step.actionLabelEn
                    : language === 'ar'
                    ? 'إنهاء الجولة'
                    : 'Finish Tour'
                  : language === 'ar'
                  ? 'التالي'
                  : 'Next'}
              </span>
              {currentStep < steps.length - 1 &&
                (isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
