import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useReports } from '../context/ReportContext';
import {
  X,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Zap,
  Bell,
  HardDrive,
  Filter,
  CheckSquare,
  Square,
  Activity,
  Server
} from 'lucide-react';
import {
  initialCarListings,
  initialRealEstateListings,
  initialJobListings,
  initialTaxiOrders
} from '../data/mockData';
import { broadcastNotification } from '../lib/messaging';

interface AutoCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface InactivePostItem {
  id: string;
  title: string;
  category: string;
  categoryNameAr: string;
  daysInactive: number;
  interactionsCount: number; // shares, bookmarks, updates
  phone: string;
  sellerName: string;
  type: 'car' | 'real_estate' | 'job' | 'taxi';
}

export const AutoCleanupModal: React.FC<AutoCleanupModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const { isPostDeleted, purgePostsBatch } = useReports();

  // Inactivity Threshold (Days)
  const [inactivityDays, setInactivityDays] = useState<number>(30);
  const [notifyPublishers, setNotifyPublishers] = useState<boolean>(true);
  const [autoScheduled, setAutoScheduled] = useState<boolean>(true);

  // Status states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [purgeSuccess, setPurgeSuccess] = useState<boolean>(false);
  const [deletedCount, setDeletedCount] = useState<number>(0);
  const [freedMemoryMB, setFreedMemoryMB] = useState<string>('0');

  // Selected IDs to purge
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Gather all items from app state
  const getAllActivePosts = (): InactivePostItem[] => {
    const list: InactivePostItem[] = [];

    // 1. Cars & Marketplace
    initialCarListings.forEach((item, index) => {
      if (!isPostDeleted(item.id)) {
        // Calculate mock inactive age
        const days = 15 + ((index * 7) % 45);
        const interactions = item.featured ? 12 : 0; // Unfeatured older posts have 0 interactions
        list.push({
          id: item.id,
          title: item.title,
          category: 'cars',
          categoryNameAr: 'سيارات وسوق',
          daysInactive: days,
          interactionsCount: interactions,
          phone: item.phone,
          sellerName: 'تاجر / ناشر',
          type: 'car'
        });
      }
    });

    // 2. Real Estate
    initialRealEstateListings.forEach((item, index) => {
      if (!isPostDeleted(item.id)) {
        const days = 20 + ((index * 9) % 50);
        const interactions = item.featured ? 8 : 0;
        list.push({
          id: item.id,
          title: item.title,
          category: 'real_estate',
          categoryNameAr: 'عقارات',
          daysInactive: days,
          interactionsCount: interactions,
          phone: item.phone,
          sellerName: item.sellerName || 'مكتب عقاري',
          type: 'real_estate'
        });
      }
    });

    // 3. Jobs
    initialJobListings.forEach((item, index) => {
      if (!isPostDeleted(item.id)) {
        const days = 10 + ((index * 11) % 60);
        const interactions = item.featured ? 15 : 0;
        list.push({
          id: item.id,
          title: item.title,
          category: 'jobs',
          categoryNameAr: 'فرص عمل',
          daysInactive: days,
          interactionsCount: interactions,
          phone: item.phone,
          sellerName: item.company || 'صاحب العمل',
          type: 'job'
        });
      }
    });

    // 4. Taxi
    initialTaxiOrders.forEach((item, index) => {
      if (!isPostDeleted(item.id)) {
        const days = 5 + ((index * 13) % 40);
        const interactions = item.status === 'completed' ? 5 : 0;
        list.push({
          id: item.id,
          title: `طلب توصيل: ${item.fromCity} - ${item.toArea}`,
          category: 'taxi',
          categoryNameAr: 'تكسي وتوصيل',
          daysInactive: days,
          interactionsCount: interactions,
          phone: item.phone,
          sellerName: item.customerName,
          type: 'taxi'
        });
      }
    });

    return list;
  };

  const allPosts = getAllActivePosts();

  // Flagged zero-interaction stale posts
  const flaggedPosts = allPosts.filter(
    (item) => item.daysInactive >= inactivityDays && item.interactionsCount === 0
  );

  // Initialize selected IDs if not set
  const toggleSelectAll = () => {
    if (selectedIds.length === flaggedPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(flaggedPosts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleExecutePurge = () => {
    const idsToPurge = selectedIds.length > 0 ? selectedIds : flaggedPosts.map((p) => p.id);
    if (idsToPurge.length === 0) return;

    setIsPurging(true);

    setTimeout(() => {
      // Complete deletion from app state
      purgePostsBatch(idsToPurge);

      // Send Publisher Notifications if enabled
      if (notifyPublishers) {
        broadcastNotification({
          title: language === 'ar' ? 'تنبيه تنظيف الإعلانات الخاملة 🗑️' : 'Inactive Listing Cleaned 🗑️',
          body: language === 'ar'
            ? `تم حذف ${idsToPurge.length} إعلان قديم وخامل لعدم وجود تفاعلات أو تحديثات عليه، وذلك لتخفيف الضغط والحفاظ على سرعة وكفاءة منصة OMS.`
            : `${idsToPurge.length} inactive posts were purged due to zero engagement to maintain platform performance.`,
          category: 'system',
          type: 'system'
        });
      }

      const calculatedMB = (idsToPurge.length * 0.35).toFixed(1);
      setFreedMemoryMB(calculatedMB);
      setDeletedCount(idsToPurge.length);
      setIsPurging(false);
      setPurgeSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setPurgeSuccess(false);
    setSelectedIds([]);
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Top Metallic Orange/Emerald Bar */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2.5 bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-400 rounded-2xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'برنامج حذف الإعلانات الخاملة والأداء' : 'Inactive Ads Auto-Purge Tool'}</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                  OMS System Optimizer
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'حذف المنشورات القديمة الخالية من التفاعلات والمشاركات وتنظيف التطبيق لتخفيف الضغط'
                  : 'Purge old zero-engagement posts, send publisher alerts, and free platform memory'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {purgeSuccess ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-4 animate-scaleUp my-auto">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-white">
                {language === 'ar' ? 'تمت عملية تنظيف وحذف الإعلانات بنجاح! 🧹' : 'Cleanup Completed Successfully! 🧹'}
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {language === 'ar'
                  ? 'تم حذف المنشورات الخاملة تماماً من التطبيق وتخفيف الضغط على ذاكرة البرنامج وقواعد البيانات.'
                  : 'Inactive posts purged completely. Platform performance optimized.'}
              </p>
            </div>

            {/* Metrics Box */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl max-w-md mx-auto text-center">
              <div className="space-y-1">
                <div className="text-xs text-slate-400">{language === 'ar' ? 'المنشورات المحذوفة' : 'Posts Purged'}</div>
                <div className="text-lg font-black text-rose-400 font-mono">{deletedCount}</div>
              </div>
              <div className="space-y-1 border-r border-l border-slate-800">
                <div className="text-xs text-slate-400">{language === 'ar' ? 'الذاكرة المحررة' : 'Memory Freed'}</div>
                <div className="text-lg font-black text-emerald-400 font-mono">~{freedMemoryMB} MB</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400">{language === 'ar' ? 'تنبيهات الناشرين' : 'Publisher Alerts'}</div>
                <div className="text-lg font-black text-amber-400 font-mono">{notifyPublishers ? 'مُنَفَّذة 🔔' : 'مُعَطَّلَة'}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                {language === 'ar' ? 'فحص آخر' : 'New Scan'}
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق والعودة للتطبيق' : 'Done & Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Scanner & Execution Form */
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 scrollbar-none">
            
            {/* System Performance Status */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {language === 'ar' ? 'حالة قاعدة بيانات ومنشورات المنصة:' : 'Platform Database & Memory Status:'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar'
                      ? `إجمالي المنشورات: ${allPosts.length} منشور | المنشورات المرشحة للحذف: ${flaggedPosts.length}`
                      : `Total active posts: ${allPosts.length} | Flagged inactive: ${flaggedPosts.length}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'استجابة ممتازة' : 'Optimal Speed'}</span>
                </span>
              </div>
            </div>

            {/* Threshold & Notification Settings Controls */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-3 text-xs">
              <div className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'معايير فحص المنشورات الخاملة (بدون تفاعل):' : 'Inactivity Filter Criteria:'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Inactivity Threshold Select */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">
                    {language === 'ar' ? 'مدة الخمول وعدم التحديث:' : 'Inactivity Period Threshold:'}
                  </label>
                  <select
                    value={inactivityDays}
                    onChange={(e) => {
                      setInactivityDays(Number(e.target.value));
                      setSelectedIds([]);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={15}>{language === 'ar' ? 'أكثر من 15 يوماً بدون تفاعل' : '15+ days inactive'}</option>
                    <option value={30}>{language === 'ar' ? 'أكثر من 30 يوماً بدون تفاعل (موصى به)' : '30+ days inactive (Recommended)'}</option>
                    <option value={60}>{language === 'ar' ? 'أكثر من 60 يوماً بدون تفاعل' : '60+ days inactive'}</option>
                  </select>
                </div>

                {/* Publisher Alert Toggle */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">
                    {language === 'ar' ? 'تنبيه الناشرين آلياً:' : 'Auto Notify Publishers:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setNotifyPublishers(!notifyPublishers)}
                    className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${
                      notifyPublishers
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'إرسال إشعار تنبيه للناشر' : 'Send Alert Notification'}</span>
                    </span>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-md font-mono">
                      {notifyPublishers ? 'مفعّل ✅' : 'معطّل'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of Flagged Inactive Posts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>
                    {language === 'ar'
                      ? `الإعلانات المرشحة للحذف النهائي (${flaggedPosts.length}):`
                      : `Inactive Posts Flagged (${flaggedPosts.length}):`}
                  </span>
                </span>

                {flaggedPosts.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {selectedIds.length === flaggedPosts.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All'}</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تحديد الكل' : 'Select All'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {flaggedPosts.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 border border-slate-800 rounded-2xl space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-white font-bold text-xs">
                    {language === 'ar' ? 'لا توجد إعلانات خاملة تطابق المعايير حالياً!' : 'No inactive posts matching criteria!'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'جميع الإعلانات النشطة تمتلك تفاعلات أو تحديثات حديثة.' : 'All active posts have recent user interactions.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {flaggedPosts.map((post) => {
                    const isSelected = selectedIds.includes(post.id) || selectedIds.length === 0;

                    return (
                      <div
                        key={post.id}
                        onClick={() => toggleSelectOne(post.id)}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-slate-950 border-rose-500/60 shadow-md shadow-rose-950/20'
                            : 'bg-slate-950/50 border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            className="text-rose-400 shrink-0"
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                          </button>

                          <div className="min-w-0 space-y-0.5">
                            <div className="font-bold text-white truncate max-w-xs sm:max-w-md">
                              {post.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="px-1.5 py-0.2 bg-slate-800 rounded font-bold text-slate-300">
                                {post.categoryNameAr}
                              </span>
                              <span>الناشر: <strong className="text-slate-200">{post.sellerName}</strong></span>
                              <span className="text-rose-400 font-mono font-bold">
                                خامل منذ {post.daysInactive} يوماً | 0 تفاعل
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-left dir-ltr">
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                            مرشح للحذف
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notification Preview Box */}
            {notifyPublishers && flaggedPosts.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-2xl space-y-1 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'معاينة إشعار الناشر المزمع إرساله:' : 'Publisher Alert Preview:'}</span>
                </div>
                <p className="text-[11px] text-slate-300 italic bg-slate-950/80 p-2 rounded-xl border border-amber-500/20">
                  "{language === 'ar'
                    ? 'تنبيه منصة OMS 🗑️: عزيزي الناشر، تم حذف منشورك الخامل لعدم تسجيل أي تفاعلات أو مشاركات عليه، لضمان استقرار وسرعة أداء البرنامج.'
                    : 'OMS Alert 🗑️: Dear publisher, your inactive post was purged due to zero interaction to optimize platform speed.'}"
                </p>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleExecutePurge}
              disabled={isPurging || flaggedPosts.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-black rounded-2xl text-sm shadow-xl shadow-rose-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPurging ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'ar' ? 'جاري الحذف النهائي وتنظيف ذاكرة النظام...' : 'Purging & Optimizing...'}</span>
                </div>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {language === 'ar'
                      ? `إتمام الحذف النهائي لـ (${selectedIds.length || flaggedPosts.length}) إعلانات خاملة 🗑️`
                      : `Execute Purge (${selectedIds.length || flaggedPosts.length} Posts) 🗑️`}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {language === 'ar'
                  ? 'يتم الحذف تماماً لمنع استهلاك مساحة التخزين وحفظ سرعة الاستجابة'
                  : 'Purged entirely to save memory and boost responsiveness'}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
