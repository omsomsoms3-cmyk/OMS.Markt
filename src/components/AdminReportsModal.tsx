import React, { useState } from 'react';
import { ShieldCheck, Flag, Trash2, CheckCircle2, Phone, X, Filter, Trash, AlertTriangle, Zap, BellRing, Info, Sparkles, HardDrive } from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { useLanguage } from '../context/LanguageContext';
import { PostReport } from '../types';
import { AutoCleanupModal } from './AutoCleanupModal';

interface AdminReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeletePost?: (postId: string) => void;
}

export const AdminReportsModal: React.FC<AdminReportsModalProps> = ({
  isOpen,
  onClose,
  onDeletePost
}) => {
  const {
    reports,
    autoAlerts,
    updateReportStatus,
    deleteReport,
    clearAllReports,
    deletePostManually,
    isPostDeleted,
    clearAlert
  } = useReports();
  const { language } = useLanguage();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'auto_deleted'>('all');
  const [deletedSuccess, setDeletedSuccess] = useState<string | null>(null);
  const [isAutoCleanupOpen, setIsAutoCleanupOpen] = useState(false);

  if (!isOpen) return null;

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'pending') return r.status === 'pending';
    if (filterStatus === 'resolved') return r.status === 'resolved' || r.status === 'reviewed';
    if (filterStatus === 'auto_deleted') return isPostDeleted(r.postId);
    return true;
  });

  const getReasonBadge = (reason: PostReport['reason']) => {
    switch (reason) {
      case 'scam':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md font-bold">🚨 احتيال / إعلان وهمي</span>;
      case 'inappropriate':
        return <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md font-bold">🔞 محتوى غير لائق</span>;
      case 'wrong_price':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md font-bold">💰 سعر كاذب / مضلل</span>;
      case 'fake':
        return <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-md font-bold">📞 هاتف غير صحيح</span>;
      case 'spam':
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md font-bold">🔁 إعلان مكرر / Spam</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-md font-bold">📝 سبب آخر</span>;
    }
  };

  const handleDeleteListing = (report: PostReport) => {
    deletePostManually(report.postId);
    if (onDeletePost) {
      onDeletePost(report.postId);
    }
    updateReportStatus(report.id, 'resolved');
    setDeletedSuccess(report.id);
    setTimeout(() => setDeletedSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-5 space-y-4 shadow-2xl relative text-slate-100 animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 border border-red-500/40 rounded-2xl flex items-center justify-center text-red-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'لوحة تحكم الإدارة والتنبيهات الفورية' : 'Admin Reports Control Panel'}</span>
                <span className="px-2 py-0.5 bg-red-500 text-white font-black text-xs rounded-full">
                  {reports.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تنبيهات فورية عند وصول البلاغات لـ 5 وتفعيل الحذف التلقائي لحماية المستخدمين' : 'Instant notifications for reported listings & automatic deletion rules'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto Alerts Banner for Admin */}
        {autoAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 border border-red-500/60 rounded-2xl p-3 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-black text-xs">
                <BellRing className="w-4 h-4 animate-bounce" />
                <span>🚨 إشعارات الحذف التلقائي العاجلة (تجاوز 5 بلاغات):</span>
              </div>
              <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                {autoAlerts.length} تنبيه جديد
              </span>
            </div>

            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {autoAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between gap-2 bg-slate-950/80 border border-red-500/30 p-2 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      تم حذف المنشور <strong className="text-white">"{alert.postTitle}"</strong> تلقائياً بعد تلقيه{' '}
                      <strong className="text-red-400 font-mono underline">{alert.reportCount} بلاغات</strong>!
                    </span>
                  </div>
                  <button
                    onClick={() => clearAlert(alert.id)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="تجاهل التنبيه"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Auto Cleanup Tool Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-rose-950/40 to-slate-950 border border-rose-500/40 p-3 rounded-2xl shrink-0 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>برنامج حذف وتصفيّة الإعلانات الخاملة والقديمة</span>
                <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.2 rounded-md">
                  System Purge
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                تنظيف المنشورات القديمة بدون تفاعلات وتنبيه الناشرين آلياً لتخفيف الحمل وسرعة التطبيق
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAutoCleanupOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black rounded-xl shrink-0 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>تشغيل برنامج الحذف 🧹</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 border border-slate-800 rounded-2xl shrink-0 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                filterStatus === 'all'
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? `كل البلاغات (${reports.length})` : `All (${reports.length})`}
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? `قيد المراجعة (${reports.filter(r => r.status === 'pending').length})` : `Pending`}
            </button>
            <button
              onClick={() => setFilterStatus('auto_deleted')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                filterStatus === 'auto_deleted'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? `محذوفة تلقائياً (5+ بلاغات)` : `Auto Deleted`}
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                filterStatus === 'resolved'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? `معالجة ومحسومة` : `Resolved`}
            </button>
          </div>

          {reports.length > 0 && (
            <button
              onClick={clearAllReports}
              className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors shrink-0"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مسح السجل' : 'Clear Log'}</span>
            </button>
          )}
        </div>

        {/* Reports List */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {filteredReports.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/50 border border-slate-800 rounded-2xl space-y-2">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-slate-300 font-bold text-sm">
                {language === 'ar' ? 'لا توجد بلاغات مخالفة في هذا القسم حالياً' : 'No reports found'}
              </p>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'نظام الحذف التلقائي يعمل فور وصول أي إعلان لـ 5 بلاغات متتالية' : 'Auto deletion triggers automatically at 5 reports'}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const countForPost = reports.filter((r) => r.postId === report.postId).length;
              const isDeleted = isPostDeleted(report.postId);

              return (
                <div
                  key={report.id}
                  className={`bg-slate-950 border p-4 rounded-2xl space-y-3 transition-all ${
                    isDeleted
                      ? 'border-red-500/80 bg-red-950/20'
                      : report.status === 'pending'
                      ? 'border-amber-500/40 bg-slate-950'
                      : 'border-slate-800 opacity-80'
                  }`}
                >
                  {/* Item Top info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      {getReasonBadge(report.reason)}
                      <span className="text-slate-400 text-[11px] font-mono">
                        قسم: <strong className="text-slate-200">{report.postCategory}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        countForPost >= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                      }`}>
                        إجمالي البلاغات: {countForPost} / 5
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {report.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Listing Details */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-red-400 shrink-0" />
                        <span>المنشور: "{report.postTitle}"</span>
                      </span>
                      {isDeleted && (
                        <span className="text-xs text-red-400 font-black px-2.5 py-1 bg-red-950/80 border border-red-500/50 rounded-lg">
                          🚫 محذوف تماماً من التطبيق
                        </span>
                      )}
                    </h4>

                    {report.reasonText && (
                      <p className="text-xs text-amber-300 bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-xl">
                        💬 <strong>ملاحظة المُبلّغ:</strong> "{report.reasonText}"
                      </p>
                    )}

                    {(report.reporterName || report.reporterPhone) && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        {report.reporterName && <span>المُبلّغ: <strong>{report.reporterName}</strong></span>}
                        {report.reporterPhone && (
                          <a href={`tel:${report.reporterPhone}`} className="text-emerald-400 hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{report.reporterPhone}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions for Admin */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5">
                      {report.status === 'pending' ? (
                        <button
                          onClick={() => updateReportStatus(report.id, 'resolved')}
                          className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'اعتماد كإعلان سليم' : 'Mark Safe'}</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تمت المعالجة</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isDeleted && (
                        <button
                          onClick={() => handleDeleteListing(report)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1 shadow transition-all active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'حذف المنشور فوراً 🗑️' : 'Delete Reported Post'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteReport(report.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl"
                        title={language === 'ar' ? 'حذف البلاغ من القائمة' : 'Remove Report'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {deletedSuccess === report.id && (
                    <div className="p-2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl text-center font-bold">
                      ✅ تم حذف المنشور بنجاح وحسم البلاغ!
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Auto Cleanup Program Modal */}
      <AutoCleanupModal
        isOpen={isAutoCleanupOpen}
        onClose={() => setIsAutoCleanupOpen(false)}
      />
    </div>
  );
};
