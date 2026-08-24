import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  Sparkles,
  Phone,
  MessageCircle,
  Edit3,
  X,
  Check,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  Film,
  Upload,
  Trash2,
  Star,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Car,
  Home,
  Smartphone,
  Briefcase,
  Play,
  Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
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
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
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

// Preset Quick Templates for Owner Advertisements
const AD_TEMPLATES = [
  {
    name: 'عقار وفيلا فاخرة 🏰',
    icon: Home,
    title: '👑 فيلا سوبر ديلوكس في ريف دمشق - إطلالة بانورامية',
    subtitle: 'فيلا فخمة مجهزة بالكامل مع مسبح خاص وحديقة واسعة ومنظومة طاقة شمسية متكاملة. تسليم فوري مع طابو أخضر نظامي 2400 سهم. تواصل مباشر مع المالك.',
    priceUSD: '120,000',
    priceSYP: '1,800,000,000',
    city: 'ريف دمشق - يعفور',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'gold' as const,
  },
  {
    name: 'سيارة دفع رباعي فارهة 🚗',
    icon: Car,
    title: '👑 مرسيدس G-Class 2024 - بحالة الوكالة فول أوبشن',
    subtitle: 'كاملة المواصفات، خالية من أي صدمات أو دهان، فحص وكالة مع كفالة شاملة ولوحات دمشق جديدة. متاح المعاينة الفورية والتسليم يد بيد.',
    priceUSD: '95,000',
    priceSYP: '1,425,000,000',
    city: 'دمشق - كفرسوسة',
    imageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'sapphire' as const,
  },
  {
    name: 'أجهزة ومنظومة طاقة ⚡️',
    icon: Smartphone,
    title: '👑 صفقة استيراد مباشر: منظومات طاقة وهواتف رائدة بالجملة',
    subtitle: 'عروض حصرية للشركات والتجار من المالك مباشرة بأسعار منافسة مع كفالة رسمية وخدمة التوصيل لكافة المحافظات السورية.',
    priceUSD: '4,500',
    priceSYP: '67,500,000',
    city: 'حلب - شارع النيل',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=1200&q=80',
    themeColor: 'emerald' as const,
  },
];

export const OwnerSpotlightBanner: React.FC = () => {
  const { language } = useLanguage();
  const { isOwner, userEmail, loginAsOwner, isLoggedIn } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [adData, setAdData] = useState<OwnerAdData>(() => {
    const saved = localStorage.getItem('oms_owner_exclusive_ad');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_OWNER_AD,
          ...parsed,
          galleryImages: parsed.galleryImages || DEFAULT_OWNER_AD.galleryImages,
          videoUrls: parsed.videoUrls || DEFAULT_OWNER_AD.videoUrls,
        };
      } catch (e) {
        return DEFAULT_OWNER_AD;
      }
    }
    return DEFAULT_OWNER_AD;
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOwnerAuthPromptOpen, setIsOwnerAuthPromptOpen] = useState(false);
  const [formData, setFormData] = useState<OwnerAdData>(adData);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(adData.imageUrl);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [newVideoUrlInput, setNewVideoUrlInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'videos' | 'templates'>('info');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time updates from Firestore
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

  // Handle opening edit modal (checks owner status)
  const handleOpenEdit = () => {
    if (isOwner) {
      setFormData(adData);
      setIsEditModalOpen(true);
    } else {
      setIsOwnerAuthPromptOpen(true);
    }
  };

  // Direct login as owner from prompt
  const handleOwnerDirectSignIn = async () => {
    await loginAsOwner();
    setIsOwnerAuthPromptOpen(false);
    setFormData(adData);
    setIsEditModalOpen(true);
  };

  // Image File Compression & Upload to Data URL
  const handleImageFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);

    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          // Compress using canvas to avoid large memory footprints
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          setFormData((prev) => {
            const currentGallery = prev.galleryImages || [];
            const updatedGallery = [...currentGallery, compressedDataUrl];
            return {
              ...prev,
              imageUrl: prev.imageUrl || compressedDataUrl,
              galleryImages: updatedGallery,
            };
          });
          setIsUploadingPhoto(false);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // Video File Handler
  const handleVideoFile = (file: File) => {
    if (!file || !file.type.startsWith('video/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const vidDataUrl = e.target?.result as string;
      setFormData((prev) => {
        const currentVids = prev.videoUrls || [];
        return {
          ...prev,
          videoUrl: prev.videoUrl || vidDataUrl,
          videoUrls: [...currentVids, vidDataUrl],
        };
      });
    };
    reader.readAsDataURL(file);
  };

  // Add photo via URL
  const handleAddPhotoUrl = () => {
    if (!newPhotoUrlInput.trim()) return;
    const url = newPhotoUrlInput.trim();
    setFormData((prev) => {
      const currentGallery = prev.galleryImages || [];
      return {
        ...prev,
        imageUrl: prev.imageUrl || url,
        galleryImages: [...currentGallery, url],
      };
    });
    setNewPhotoUrlInput('');
  };

  // Add video via URL
  const handleAddVideoUrl = () => {
    if (!newVideoUrlInput.trim()) return;
    const url = newVideoUrlInput.trim();
    setFormData((prev) => {
      const currentVids = prev.videoUrls || [];
      return {
        ...prev,
        videoUrl: prev.videoUrl || url,
        videoUrls: [...currentVids, url],
      };
    });
    setNewVideoUrlInput('');
  };

  // Remove photo from gallery
  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => {
      const updatedGallery = [...(prev.galleryImages || [])];
      const removed = updatedGallery.splice(index, 1)[0];
      let newMain = prev.imageUrl;
      if (prev.imageUrl === removed) {
        newMain = updatedGallery[0] || '';
      }
      return {
        ...prev,
        imageUrl: newMain,
        galleryImages: updatedGallery,
      };
    });
  };

  // Set photo as main cover
  const handleSetMainPhoto = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }));
  };

  // Remove video
  const handleRemoveVideo = (index: number) => {
    setFormData((prev) => {
      const updatedVids = [...(prev.videoUrls || [])];
      const removed = updatedVids.splice(index, 1)[0];
      let newMainVid = prev.videoUrl;
      if (prev.videoUrl === removed) {
        newMainVid = updatedVids[0] || '';
      }
      return {
        ...prev,
        videoUrl: newMainVid,
        videoUrls: updatedVids,
      };
    });
  };

  // Apply template
  const handleApplyTemplate = (tmpl: typeof AD_TEMPLATES[0]) => {
    setFormData((prev) => ({
      ...prev,
      title: tmpl.title,
      subtitle: tmpl.subtitle,
      priceUSD: tmpl.priceUSD,
      priceSYP: tmpl.priceSYP,
      city: tmpl.city,
      imageUrl: tmpl.imageUrl,
      themeColor: tmpl.themeColor,
    }));
    setActiveTab('info');
  };

  // Save changes to Firestore
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OwnerAdData = {
      ...formData,
      galleryImages: formData.galleryImages || [],
      videoUrls: formData.videoUrls || (formData.videoUrl ? [formData.videoUrl] : []),
      videoUrl: formData.videoUrl || (formData.videoUrls && formData.videoUrls[0]) || '',
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
  const uniquePhotos = Array.from(new Set(allPhotos));

  if (!adData.isPublished && !isEditModalOpen) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 mb-4">
        <button
          onClick={handleOpenEdit}
          className="w-full py-3 px-4 bg-slate-900/90 border border-dashed border-amber-500/50 hover:border-amber-400 rounded-2xl text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-800/90 cursor-pointer shadow-lg"
        >
          <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{language === 'ar' ? 'تفعيل وإظهار مساحة المالك الحصرية وإضافة الإعلانات والوسائط 👑' : 'Enable & Edit Owner Exclusive Area'}</span>
        </button>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 my-2.5 animate-fadeIn">
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/50 rounded-2xl p-2.5 sm:p-3 px-3.5 flex items-center justify-between gap-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 truncate">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
            </span>
            <div className="truncate text-right dir-rtl">
              <p className="text-xs sm:text-sm font-black text-amber-200 truncate flex items-center gap-1.5">
                <span>{adData.badgeText}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full font-mono">
                  ${adData.priceUSD}
                </span>
                {isOwner && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                    مالك معتمد 👑
                  </span>
                )}
              </p>
              <p className="text-[10.5px] text-slate-300 truncate">
                {adData.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenEdit}
              className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-900 border border-amber-400/50 text-amber-300 rounded-xl text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'تحديث ونشر' : 'Edit'}</span>
            </button>

            <button
              onClick={() => setIsCollapsed(false)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>{language === 'ar' ? 'معاينة العرض 🏰' : 'View Banner'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 my-3.5 animate-fadeIn">
      {/* Exclusive Container */}
      <div className={`relative rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden ${currentTheme.cardBg}`}>
        {/* Subtle Ambient Background Lighting */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.accentGlow} pointer-events-none opacity-60`} />

        {/* Owner Verified Status Bar if logged in */}
        {isOwner && (
          <div className="mb-3 p-2 px-3.5 bg-amber-500/20 border border-amber-400/60 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-200">
            <div className="flex items-center gap-2 truncate">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 animate-pulse" />
              <span className="font-bold truncate">
                {language === 'ar'
                  ? `أهلاً بك مالك المنصة (${OWNER_EMAIL}) 👑 - صلاحية كاملة لتحديث الصفحة وإضافة الوسائط والإعلانات مباشرة وبسهولة`
                  : `Welcome Owner (${OWNER_EMAIL}) 👑 - Full access to add photos, videos & ads directly`}
              </span>
            </div>
            <button
              onClick={handleOpenEdit}
              className="py-1 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[11px] shrink-0 transition-all shadow cursor-pointer flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{language === 'ar' ? 'تعديل الإعلان وإضافة وسائط' : 'Manage Ad & Media'}</span>
            </button>
          </div>
        )}

        {/* Top Header Row with Owner Exclusive Label and Controls */}
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

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleOpenEdit}
              className="py-1.5 px-3 bg-slate-950/90 hover:bg-slate-900 border border-amber-400/50 hover:border-amber-300 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title={language === 'ar' ? 'تعديل وتحديث مساحة المالك وإضافة وسائط' : 'Edit owner space'}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'تعديل وإضافة وسائط' : 'Edit & Add Media'}</span>
            </button>

            <button
              onClick={() => setIsCollapsed(true)}
              className="py-1.5 px-3 bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md cursor-pointer"
              title={language === 'ar' ? 'تصغير العرض' : 'Collapse banner'}
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'تصغير' : 'Collapse'}</span>
            </button>
          </div>
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
            {uniquePhotos.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 px-1">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? 'معرض الصور المعروضة والمكشوفة للمالك:' : 'Owner Exposed Photo Gallery:'}</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">({uniquePhotos.length} {language === 'ar' ? 'صور' : 'photos'})</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/40">
                  {uniquePhotos.map((url, idx) => (
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

      {/* Owner Auth Prompt Dialog (Shown when non-owner clicks Edit) */}
      {isOwnerAuthPromptOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 text-right dir-rtl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                <h3 className="font-bold text-amber-200 text-sm sm:text-base">
                  {language === 'ar' ? 'مساحة المالك الحصرية 👑' : 'Owner Exclusive Area'}
                </h3>
              </div>
              <button
                onClick={() => setIsOwnerAuthPromptOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ar' ? 'صلاحية مالك المنصة المعتمد:' : 'Owner Verification:'}</span>
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? 'يمكن للمالك إضافة الصور والفيديوهات والإعلانات مباشرة إلى المساحة الحصرية للمالك وتحديث هذه الصفحة بسهولة فور تسجيل الدخول بالبريد الإلكتروني:'
                    : 'The owner can add photos, videos, and ads directly to the owner exclusive area and easily update this page by registering with:'}
                </p>
                <div className="p-2 bg-slate-950 rounded-xl font-mono text-amber-300 font-bold text-center border border-amber-500/40">
                  {OWNER_EMAIL}
                </div>
              </div>

              <p className="text-slate-400 text-[11px]">
                {language === 'ar'
                  ? 'انقر على الزر أدناه لتسجيل الدخول الفوري ببريد المالك وفتح لوحة إدارة الوسائط والإعلانات.'
                  : 'Click below to instantly log in with owner email and unlock the media & ad management dashboard.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleOwnerDirectSignIn}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>{language === 'ar' ? 'تسجيل الدخول كمالك (omsomsoms3@gmail.com) 👑' : 'Sign In as Owner (omsomsoms3@gmail.com)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOwnerAuthPromptOpen(false)}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Owner Exclusive Ad & Media Studio Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[85] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-400/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-6 text-right dir-rtl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-4 border-b border-amber-500/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-amber-200 text-sm sm:text-base flex items-center gap-2">
                    <span>{language === 'ar' ? 'استوديو وإدارة مساحة المالك الحصرية 👑' : 'Owner Media & Ad Studio'}</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono font-black">
                      {OWNER_EMAIL}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {language === 'ar' ? 'إضافة صور، فيديوهات، وتحديث الإعلان مباشرة وبكل سهولة' : 'Add photos, videos, and update ads directly'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 shrink-0 overflow-x-auto">
              {[
                { id: 'info', name: 'بيانات الإعلان والتنسيق ✏️' },
                { id: 'photos', name: `الصور المعروضة 📷 (${(formData.galleryImages || []).length})` },
                { id: 'videos', name: `الفيديوهات والتنزيل 🎥 (${(formData.videoUrls || []).length})` },
                { id: 'templates', name: 'نماذج إعلانية جاهزة ⚡️' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-grow">
              {/* TAB 1: Ad Info & Details */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="font-bold text-slate-200 block">{language === 'ar' ? 'حالة إظهار المساحة الخاصة للمالك' : 'Display Status'}</span>
                      <span className="text-[11px] text-slate-400">{language === 'ar' ? 'تفعيل أو إخفاء هذا العرض الحصري من الصفحة الرئيسية' : 'Show or hide this exclusive banner'}</span>
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
                    <label className="font-bold text-slate-300 block">{language === 'ar' ? 'لون وتنسيق بطاقة المالك 🎨' : 'Card Theme'}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'gold', name: 'ذهبي ملكي ⭐️', color: 'bg-amber-400 text-slate-950' },
                        { id: 'emerald', name: 'زمردي فخم 💚', color: 'bg-emerald-400 text-slate-950' },
                        { id: 'sapphire', name: 'ماسي أزرق 💎', color: 'bg-cyan-400 text-slate-950' },
                        { id: 'purple', name: 'بنفسجي VIP 👑', color: 'bg-purple-400 text-slate-950' },
                        { id: 'coral', name: 'مرجاني وردي 🌺', color: 'bg-rose-400 text-slate-950' },
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
                        placeholder="عنوان العرض الحصري..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">{language === 'ar' ? 'نص شارة المالك' : 'Badge Text'}</label>
                      <input
                        type="text"
                        value={formData.badgeText}
                        onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                        placeholder="مساحة المالك الحصرية 👑"
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
                      placeholder="اكتب تفاصيل وميزات العرض..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed"
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
                        placeholder="3,500"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">{language === 'ar' ? 'السعر (بالليرة السورية)' : 'Price SYP'}</label>
                      <input
                        type="text"
                        value={formData.priceSYP}
                        onChange={(e) => setFormData({ ...formData, priceSYP: e.target.value })}
                        placeholder="50,000,000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">{language === 'ar' ? 'المدينة / الموقع' : 'City'}</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="دمشق - المزة"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">{language === 'ar' ? 'رقم الهاتف المباشر' : 'Phone Number'}</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0944000000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300 block">{language === 'ar' ? 'رقم الواتساب' : 'WhatsApp Number'}</label>
                      <input
                        type="text"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="963944000000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Photos Studio & Upload */}
              {activeTab === 'photos' && (
                <div className="space-y-4">
                  {/* Direct Image File Upload & Dropzone */}
                  <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950/80 rounded-2xl p-4 text-center transition-all">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-200 text-sm">
                          {language === 'ar' ? 'رفع صور جديدة مباشرة من جهازك أو هاتفك 📷' : 'Upload Images From Device'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {language === 'ar' ? 'يدعم اختيار عدة صور معاً بضغط تلقائي وسريع' : 'Supports multiple image selection'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 py-2 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'اختيار صور من الهاتف / الحاسوب' : 'Browse Files'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Add by URL option */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <label className="font-bold text-slate-300 block">{language === 'ar' ? 'أو إضافة صورة عبر الرابط مباشرة:' : 'Or Add Image via URL:'}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPhotoUrlInput}
                        onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                      >
                        {language === 'ar' ? 'إضافة ➕' : 'Add'}
                      </button>
                    </div>
                  </div>

                  {/* Photos Grid & Management */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>{language === 'ar' ? 'معرض الصور الحالي للمالك:' : 'Current Photos:'}</span>
                      <span className="text-amber-400 font-mono">({(formData.galleryImages || []).length} صور)</span>
                    </div>

                    {(formData.galleryImages || []).length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <span>{language === 'ar' ? 'لم تقم بإضافة صور بعد. استخدم خيار الرفع أعلاه.' : 'No photos added yet.'}</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {(formData.galleryImages || []).map((url, idx) => {
                          const isMain = formData.imageUrl === url;
                          return (
                            <div
                              key={idx}
                              className={`relative group rounded-2xl overflow-hidden border-2 bg-slate-950 aspect-square ${
                                isMain ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-800'
                              }`}
                            >
                              <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              
                              {/* Main Badge */}
                              {isMain && (
                                <div className="absolute top-1.5 right-1.5 bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                                  <Star className="w-3 h-3 fill-slate-950" />
                                  <span>{language === 'ar' ? 'الغلاف' : 'Cover'}</span>
                                </div>
                              )}

                              {/* Action Buttons overlay on hover */}
                              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                                {!isMain && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMainPhoto(url)}
                                    className="w-full py-1 px-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Star className="w-3 h-3" />
                                    <span>{language === 'ar' ? 'تعيين كغلاف' : 'Set as Cover'}</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="w-full py-1 px-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{language === 'ar' ? 'حذف الصورة' : 'Remove'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Videos Studio & Upload */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  {/* Direct Video File Upload & URL input */}
                  <div className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950/80 rounded-2xl p-4 text-center transition-all">
                    <input
                      type="file"
                      ref={videoFileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
                      accept="video/*"
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                        <Film className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-amber-200 text-sm">
                          {language === 'ar' ? 'إضافة فيديو جديد للمعاينة والتنزيل المباشر 🎥' : 'Add Video for Preview & Download'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {language === 'ar' ? 'يدعم ملفات MP4 والروابط المباشرة بدون حد أقصى' : 'Supports MP4 and direct video links'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="mt-1 py-2 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'رفع ملف فيديو MP4 من الجهاز' : 'Upload Video File'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Video via URL */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <label className="font-bold text-slate-300 block">{language === 'ar' ? 'أو إضافة رابط فيديو مباشر (MP4 أو سحابي):' : 'Or Add Video URL:'}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newVideoUrlInput}
                        onChange={(e) => setNewVideoUrlInput(e.target.value)}
                        placeholder="https://assets.mixkit.co/videos/preview/...mp4"
                        className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddVideoUrl}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                      >
                        {language === 'ar' ? 'إضافة فيديو ➕' : 'Add Video'}
                      </button>
                    </div>
                  </div>

                  {/* Videos List & Live Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>{language === 'ar' ? 'قائمة فيديوهات المالك الحالية:' : 'Current Video List:'}</span>
                      <span className="text-amber-400 font-mono">({(formData.videoUrls || []).length} فيديوهات)</span>
                    </div>

                    {(formData.videoUrls || []).length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500">
                        <VideoIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <span>{language === 'ar' ? 'لم تقم بإضافة فيديوهات بعد.' : 'No videos added yet.'}</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(formData.videoUrls || []).map((vUrl, vIdx) => (
                          <div key={vIdx} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{language === 'ar' ? `فيديو المالك #${vIdx + 1}` : `Owner Video #${vIdx + 1}`}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => downloadFile(vUrl, `owner_video_${vIdx + 1}.mp4`)}
                                  className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>{language === 'ar' ? 'اختبار التنزيل' : 'Test Download'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVideo(vIdx)}
                                  className="py-1 px-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                                </button>
                              </div>
                            </div>

                            <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video max-h-52">
                              <video src={vUrl} controls preload="metadata" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Fast Templates */}
              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {language === 'ar'
                      ? 'اختر أحد النماذج الملكية الجاهزة لتطبيقها فوراً بنقرة واحدة، ثم يمكنك تخصيص السعر والصور:'
                      : 'Choose a preset template to apply instantly with 1-click:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {AD_TEMPLATES.map((tmpl, idx) => {
                      const IconComp = tmpl.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-slate-950 border border-slate-800 hover:border-amber-400/80 rounded-2xl p-3.5 space-y-2.5 flex flex-col justify-between transition-all group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-amber-200 text-xs">{tmpl.name}</span>
                            </div>
                            <img src={tmpl.imageUrl} alt={tmpl.title} className="w-full h-24 object-cover rounded-xl border border-slate-800" />
                            <h4 className="font-bold text-slate-100 text-xs line-clamp-2">{tmpl.title}</h4>
                            <p className="text-[10.5px] text-slate-400 line-clamp-2">{tmpl.subtitle}</p>
                            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                              <span className="text-amber-400">${tmpl.priceUSD}</span>
                              <span className="text-slate-400">{tmpl.city}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyTemplate(tmpl)}
                            className="w-full py-2 bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-amber-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تطبيق هذا النموذج' : 'Apply Template'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {savedSuccess
                      ? language === 'ar'
                        ? 'تم الحفظ والمزامنة بنجاح! ✨'
                        : 'Saved & Synced!'
                      : language === 'ar'
                        ? 'حفظ ونشر التحديثات فوراً'
                        : 'Save & Publish Live'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
