import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Phone, MessageCircle, Edit3, X, Check, Image as ImageIcon, Video as VideoIcon, Download, Film } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToOwnerAd, saveOwnerAdToFirestore } from '../lib/listingsService';

export interface OwnerAdData {
  title: string;
  subtitle: string;
  priceSYP: string;
  priceUSD: string;
  phone: string;
  whatsapp: string;
  imageUrl: string;
  galleryImages: string[];
  videoUrl?: string;
  videoUrls?: string[];
  badgeText: string;
  themeColor: 'gold' | 'emerald' | 'sapphire' | 'purple' | 'coral' | 'lime';
  isPublished: boolean;
  city: string;
}

const DEFAULT_OWNER_AD: OwnerAdData = {
  title: '👑 العرض الذهبي الحصري من مالك المنصة',
  subtitle: 'فرصة استثمارية استثنائية مع عرض خاص مفتوح ومكشوف خصيصاً لعملاء وزوار منصة OMS. تواصل مباشرة مع المالك أو قم بتنزيل جميع الفيديوهات والصور المكشوفة بسهولة وبشكل غير محدود.',
  priceSYP: '50,000,000',
  priceUSD: '3,500',
  phone: '0944000000',
  whatsapp: '963944000000',
  imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  galleryImages: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  ],
  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-house-interior-41584-large.mp4',
  videoUrls: [
    'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-house-interior-41584-large.mp4'
  ],
  badgeText: 'مساحة المالك الحصرية 👑',
  themeColor: 'gold',
  isPublished: true,
  city: 'دمشق - المزة',
};

export const OwnerSpotlightBanner: React.FC = () => {
  const { language } = useLanguage();
  const [adData, setAdData] = useState<OwnerAdData>(() => {
    const saved = localStorage.getItem('oms_owner_exclusive_ad');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_OWNER_AD,
          ...parsed,
          galleryImages: parsed.galleryImages || DEFAULT_OWNER_AD.galleryImages,
        };
      } catch (e) {
        return DEFAULT_OWNER_AD;
      }
    }
    return DEFAULT_OWNER_AD;
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<OwnerAdData>(adData);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(adData.imageUrl);
  const [galleryInput, setGalleryInput] = useState<string>((adData.galleryImages || []).join('\n'));
  const [videoUrlsInput, setVideoUrlsInput] = useState<string>(
    (adData.videoUrls && adData.videoUrls.length > 0)
      ? adData.videoUrls.join('\n')
      : (adData.videoUrl ? adData.videoUrl : '')
  );

  useEffect(() => {
    const unsubscribe = subscribeToOwnerAd((remoteAd) => {
      if (remoteAd) {
        setAdData((prev) => ({
          ...prev,
          ...remoteAd,
          galleryImages: remoteAd.galleryImages || prev.galleryImages,
          videoUrls: remoteAd.videoUrls || prev.videoUrls,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('oms_owner_exclusive_ad', JSON.stringify(adData));
  }, [adData]);

  useEffect(() => {
    if (adData.imageUrl) {
      setSelectedPhoto(adData.imageUrl);
    }
  }, [adData.imageUrl]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedGallery = galleryInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedVideos = videoUrlsInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updated: OwnerAdData = {
      ...formData,
      galleryImages: parsedGallery,
      videoUrls: parsedVideos,
      videoUrl: parsedVideos[0] || formData.videoUrl,
    };

    setAdData(updated);
    saveOwnerAdToFirestore(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditModalOpen(false);
    }, 1200);
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!adData.isPublished && !isEditModalOpen) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 mb-4">
        <button
          onClick={() => {
            setFormData({ ...adData, isPublished: true });
            setGalleryInput((adData.galleryImages || []).join('\n'));
            setIsEditModalOpen(true);
          }}
          className="w-full py-2.5 px-4 bg-slate-900/80 border border-dashed border-amber-500/40 hover:border-amber-400 rounded-2xl text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-800/80 cursor-pointer"
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'تفعيل وإعادة إظهار المساحة الخاصة بالمالك 👑' : 'Enable Owner Exclusive Spotlight Area'}</span>
        </button>
      </div>
    );
  }

  // Theme Styles mapping
  const themeStyles = {
    gold: {
      cardBg: 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-400/80 shadow-amber-500/20',
      badgeBg: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black',
      titleColor: 'text-amber-200',
      priceBg: 'bg-amber-400 text-slate-950',
      buttonBg: 'bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black',
      accentGlow: 'from-amber-500/20 via-transparent to-amber-500/20',
    },
    emerald: {
      cardBg: 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-400/80 shadow-emerald-500/20',
      badgeBg: 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-950 font-black',
      titleColor: 'text-emerald-200',
      priceBg: 'bg-emerald-400 text-slate-950',
      buttonBg: 'bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 font-black',
      accentGlow: 'from-emerald-500/20 via-transparent to-emerald-500/20',
    },
    sapphire: {
      cardBg: 'bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border-2 border-cyan-400/80 shadow-cyan-500/20',
      badgeBg: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white font-black',
      titleColor: 'text-cyan-200',
      priceBg: 'bg-cyan-400 text-slate-950',
      buttonBg: 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black',
      accentGlow: 'from-cyan-500/20 via-transparent to-blue-500/20',
    },
    purple: {
      cardBg: 'bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-2 border-purple-400/80 shadow-purple-500/20',
      badgeBg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 text-white font-black',
      titleColor: 'text-purple-200',
      priceBg: 'bg-purple-400 text-slate-950',
      buttonBg: 'bg-gradient-to-r from-purple-400 to-pink-600 hover:from-purple-300 hover:to-pink-500 text-white font-black',
      accentGlow: 'from-purple-500/20 via-transparent to-purple-500/20',
    },
    coral: {
      cardBg: 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-pink-950/90 border-2 border-rose-400/80 shadow-rose-500/20',
      badgeBg: 'bg-gradient-to-r from-rose-400 via-pink-500 to-rose-600 text-white font-black',
      titleColor: 'text-rose-200',
      priceBg: 'bg-rose-400 text-slate-950',
      buttonBg: 'bg-gradient-to-r from-rose-400 to-pink-600 hover:from-rose-300 hover:to-pink-500 text-white font-black',
      accentGlow: 'from-rose-500/20 via-transparent to-rose-500/20',
    },
    lime: {
      cardBg: 'bg-gradient-to-r from-lime-950/90 via-slate-900 to-emerald-950/90 border-2 border-lime-400/80 shadow-lime-500/20',
      badgeBg: 'bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500 text-slate-950 font-black',
      titleColor: 'text-lime-200',
      priceBg: 'bg-lime-400 text-slate-950',
      buttonBg: 'bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-slate-950 font-black',
      accentGlow: 'from-lime-500/20 via-transparent to-lime-500/20',
    },
  };

  const currentTheme = themeStyles[adData.themeColor] || themeStyles.gold;
  const allPhotos = [adData.imageUrl, ...(adData.galleryImages || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 my-4 animate-fadeIn">
      {/* Exclusive Container */}
      <div className={`relative rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden ${currentTheme.cardBg}`}>
        {/* Subtle Ambient Background Lighting */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.accentGlow} pointer-events-none opacity-60`} />

        {/* Top Header Row with Owner Exclusive Label and Edit Control */}
        <div className="flex items-center justify-between gap-2 mb-4 relative z-10 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1.5 shadow-md ${currentTheme.badgeBg}`}>
              <Crown className="w-4 h-4 text-slate-950 fill-slate-950 animate-pulse" />
              <span>{adData.badgeText}</span>
            </span>
            <span className="text-[10px] sm:text-xs bg-slate-950/80 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{language === 'ar' ? 'مساحة المالك الخاصة - صور معروضة ومكشوفة + تنزيل مباشر' : 'Owner Area: Open Photos & Direct Download'}</span>
            </span>
          </div>

          <button
            onClick={() => {
              setFormData(adData);
              setGalleryInput((adData.galleryImages || []).join('\n'));
              setIsEditModalOpen(true);
            }}
            className="py-1.5 px-3 bg-slate-950/90 hover:bg-slate-900 border border-amber-400/50 hover:border-amber-300 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title={language === 'ar' ? 'تعديل وتحديث المساحة الخاصة' : 'Edit owner space'}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'ar' ? 'تعديل المساحة والمحتوى' : 'Edit Content'}</span>
          </button>
        </div>

        {/* Content Body: Media + Exposed Photo Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start relative z-10">
          {/* Main Display Photo / Video Column */}
          <div className="lg:col-span-6 space-y-3">
            {/* Main Openly Displayed Image Frame */}
            <div className="relative group rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-slate-950 aspect-video md:aspect-[16/10] flex items-center justify-center">
              {selectedPhoto ? (
                <img
                  src={selectedPhoto}
                  alt={adData.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                  <ImageIcon className="w-10 h-10 text-slate-600" />
                  <span className="text-xs">{language === 'ar' ? 'لا توجد صورة معروضة' : 'No Image'}</span>
                </div>
              )}

              {/* City Tag */}
              <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/40">
                {adData.city}
              </div>

              {/* Direct Photo Download Button overlay */}
              {selectedPhoto && (
                <button
                  onClick={() => downloadFile(selectedPhoto, `owner_photo_${Date.now()}.jpg`)}
                  className="absolute bottom-2 left-2 bg-slate-950/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-400/50 transition-all shadow-lg active:scale-95 cursor-pointer"
                  title={language === 'ar' ? 'تنزيل هذه الصورة المعروضة مباشرة' : 'Download Photo'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تنزيل الصورة 🖼️' : 'Download Photo'}</span>
                </button>
              )}
            </div>

            {/* Exposed Photos Strip (Openly Displayed for Owner) */}
            {allPhotos.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 px-1">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? 'معرض الصور المعروضة والمكشوفة للمالك:' : 'Owner Exposed Photo Gallery:'}</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">({allPhotos.length} {language === 'ar' ? 'صور' : 'photos'})</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/40">
                  {allPhotos.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhoto(url)}
                      className={`relative shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedPhoto === url ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Exposed ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Video Download & Player Section for Owner (Unlimited Videos) */}
            {((adData.videoUrls && adData.videoUrls.length > 0) || adData.videoUrl) && (
              <div className="bg-slate-950/90 border border-amber-400/40 p-3 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <VideoIcon className="w-4 h-4 text-amber-400" />
                    <span>
                      {language === 'ar'
                        ? `فيديوهات المعاينة للمالك (${(adData.videoUrls || [adData.videoUrl]).length} فيديو - تنزيل مباشر):`
                        : `Owner Direct Videos (${(adData.videoUrls || [adData.videoUrl]).length}):`}
                    </span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    {language === 'ar' ? 'تنزيل مباشر MP4 🎥' : 'Direct MP4 Download'}
                  </span>
                </div>

                {/* Render Each Video */}
                {(adData.videoUrls && adData.videoUrls.length > 0 ? adData.videoUrls : [adData.videoUrl!]).map((vidUrl, vidIdx) => (
                  <div key={vidIdx} className="space-y-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold">
                        {language === 'ar' ? `فيديو #${vidIdx + 1}` : `Video #${vidIdx + 1}`}
                      </span>
                      <button
                        onClick={() => downloadFile(vidUrl, `owner_video_${vidIdx + 1}_${Date.now()}.mp4`)}
                        className="py-1 px-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-lg text-[10px] flex items-center gap-1 transition-all shadow active:scale-95 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>{language === 'ar' ? 'تنزيل هذا الفيديو 🎥' : 'Download MP4'}</span>
                      </button>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video max-h-48">
                      <video
                        src={vidUrl}
                        controls
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details & Direct Owner Contact Column */}
          <div className="lg:col-span-6 space-y-4 text-right">
            <div>
              <h3 className={`text-lg sm:text-xl md:text-2xl font-black ${currentTheme.titleColor} leading-tight mb-2`}>
                {adData.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-sans whitespace-pre-line bg-slate-950/60 p-3.5 rounded-2xl border border-white/10 shadow-inner">
                {adData.subtitle}
              </p>
            </div>

            {/* Pricing Details */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-950/80 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${currentTheme.priceBg}`}>
                  {adData.priceUSD} $
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                  {adData.priceSYP} <span className="text-xs font-normal">{language === 'ar' ? 'ل.س' : 'SYP'}</span>
                </span>
              </div>
            </div>

            {/* Direct Quick Download Action Bar */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                {language === 'ar' ? 'تحميل مباشر وسريع للوسائط المكشوفة للمالك:' : 'Direct Owner Media Downloads:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedPhoto && (
                  <button
                    onClick={() => downloadFile(selectedPhoto, `owner_image_${Date.now()}.jpg`)}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>{language === 'ar' ? 'تنزيل الصورة الحالية 🖼️' : 'Download Current Photo'}</span>
                  </button>
                )}

                {(adData.videoUrls && adData.videoUrls.length > 0 ? adData.videoUrls : [adData.videoUrl]).filter(Boolean).map((vUrl, i) => (
                  <button
                    key={i}
                    onClick={() => downloadFile(vUrl!, `owner_video_${i + 1}_${Date.now()}.mp4`)}
                    className="flex-1 min-w-[130px] py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? `تنزيل فيديو #${i + 1} 🎥` : `Download Video #${i + 1}`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Owner Direct Contact Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {adData.whatsapp && (
                <a
                  href={`https://wa.me/${adData.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً بمالك منصة OMS، أود الاستفسار عن الإعلان المباشر: ' + adData.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{language === 'ar' ? 'واتساب المالك' : 'WhatsApp Owner'}</span>
                </a>
              )}

              {adData.phone && (
                <a
                  href={`tel:${adData.phone}`}
                  className={`flex-1 min-w-[140px] py-2.5 px-4 ${currentTheme.buttonBg} rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95`}
                >
                  <Phone className="w-4 h-4" />
                  <span>{language === 'ar' ? 'اتصال مباشر بالمالك' : 'Call Owner Direct'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Owner Exclusive Ad Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-400/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-right dir-rtl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-4 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-200 text-sm sm:text-base">
                  {language === 'ar' ? 'إدارة وإبراز مساحة المالك والوسائط 👑' : 'Manage Owner Area & Media'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 text-xs">
              {/* Toggle Enable/Disable */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">{language === 'ar' ? 'حالة إظهار المساحة الخاصة' : 'Display Status'}</span>
                  <span className="text-[11px] text-slate-400">{language === 'ar' ? 'يمكنك إخفاء أو إظهار هذا العرض المباشر في أي وقت' : 'Show or hide this exclusive banner'}</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Theme Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">{language === 'ar' ? 'لون وتنسيق الإعلان الخاص 🎨' : 'Select Theme Styling'}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'gold', name: 'ذهبي ملكي ⭐️', color: 'bg-amber-400 text-slate-950' },
                    { id: 'emerald', name: 'زمردي فخم 💚', color: 'bg-emerald-400 text-slate-950' },
                    { id: 'sapphire', name: 'ماسي أزرق 💎', color: 'bg-cyan-400 text-slate-950' },
                    { id: 'purple', name: 'بنفسجي VIP 👑', color: 'bg-purple-400 text-slate-950' },
                    { id: 'coral', name: 'مرجاني ورودي 🌺', color: 'bg-rose-400 text-slate-950' },
                    { id: 'lime', name: 'ليموني مضيء ⚡️', color: 'bg-lime-400 text-slate-950' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, themeColor: theme.id as any })}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        formData.themeColor === theme.id
                          ? 'border-white ring-2 ring-amber-400 scale-105 ' + theme.color
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'عنوان الإعلان الخاص' : 'Ad Title'}</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'نص شارة المالك' : 'Badge Text'}</label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 block">{language === 'ar' ? 'وصف وتفاصيل العرض المباشر' : 'Description'}</label>
                <textarea
                  rows={3}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'السعر (بالدولار $)' : 'Price USD'}</label>
                  <input
                    type="text"
                    value={formData.priceUSD}
                    onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'السعر (بالليرة السورية)' : 'Price SYP'}</label>
                  <input
                    type="text"
                    value={formData.priceSYP}
                    onChange={(e) => setFormData({ ...formData, priceSYP: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'المدينة / الموقع' : 'City / Location'}</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Media inputs: Main image, Gallery images, and Video link */}
              <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30">
                <span className="font-black text-amber-300 block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ar' ? 'وسائط وصور وفيديو المالك (للتنزيل المباشر والعرص المفتوح)' : 'Owner Media URLs'}</span>
                </span>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'رابط الصورة الرئيسية (المكشوفة والمعروضة)' : 'Main Photo URL'}</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'روابط صور المعرض المكشوفة (ضع كل رابط في سطر)' : 'Exposed Gallery Photos (1 URL per line)'}</label>
                  <textarea
                    rows={3}
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <VideoIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'ar' ? 'روابط الفيديوهات للمعاينة والتنزيل المباشر (غير محدود - ضع كل رابط في سطر)' : 'Direct Video Download URLs (Unlimited - 1 URL per line)'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {language === 'ar' ? 'غير محدود ♾️' : 'Unlimited'}
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={videoUrlsInput}
                    onChange={(e) => setVideoUrlsInput(e.target.value)}
                    placeholder="https://assets.mixkit.co/videos/preview/sample.mp4"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'رقم الهاتف للاتصال' : 'Phone Number'}</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">{language === 'ar' ? 'رقم الواتساب' : 'WhatsApp Number'}</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="963944000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{savedSuccess ? (language === 'ar' ? 'تم الحفظ بنجاح! ✨' : 'Saved!') : (language === 'ar' ? 'حفظ وتحديث مساحة المالك' : 'Save & Publish')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
