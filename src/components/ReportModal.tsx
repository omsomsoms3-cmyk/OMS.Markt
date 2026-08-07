import React, { useState } from 'react';
import { Flag, X, ShieldAlert, CheckCircle2, AlertTriangle, Send, Zap, ShieldCheck } from 'lucide-react';
import { ReportReason } from '../types';
import { useReports } from '../context/ReportContext';
import { useLanguage } from '../context/LanguageContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  postCategory: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  postCategory
}) => {
  const { addReport, reports, isPostDeleted } = useReports();
  const { language } = useLanguage();

  const [reason, setReason] = useState<ReportReason>('scam');
  const [reasonText, setReasonText] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoDeletedMessage, setAutoDeletedMessage] = useState(false);

  if (!isOpen) return null;

  const currentCount = reports.filter((r) => r.postId === postId).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addReport({
      postId,
      postTitle,
      postCategory,
      reason,
      reasonText: reasonText.trim() || undefined,
      reporterName: reporterName.trim() || undefined,
      reporterPhone: reporterPhone.trim() || undefined
    });

    if (currentCount + 1 >= 5) {
      setAutoDeletedMessage(true);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setAutoDeletedMessage(false);
      onClose();
    }, 3000);
  };

  const handleSimulate5Reports = () => {
    // Send 5 reports to trigger auto deletion rule
    for (let i = 1; i <= 5; i++) {
      addReport({
        postId,
        postTitle,
        postCategory,
        reason: 'scam',
        reasonText: `إبلاغ تلقائي تجريبي رقم ${i} للتأكد من نظام الحذف الفوري`,
        reporterName: `مستخدم تجريبي ${i}`,
        reporterPhone: `0999000${i}${i}${i}`
      });
    }
    setAutoDeletedMessage(true);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setAutoDeletedMessage(false);
      onClose();
    }, 3500);
  };

  const getReasonLabel = (r: ReportReason) => {
    switch (r) {
      case 'scam': return language === 'ar' ? '🚨 محتوى احتيالي أو وهمي' : 'Scam or Fake listing';
      case 'inappropriate': return language === 'ar' ? '🔞 محتوى غير لائق أو مخالف' : 'Inappropriate content';
      case 'wrong_price': return language === 'ar' ? '💰 سعر كاذب أو مضلل' : 'False or misleading price';
      case 'spam': return language === 'ar' ? '🔁 إعلان مكرر / مزعج (Spam)' : 'Spam or Duplicate';
      case 'fake': return language === 'ar' ? '📞 رقم هاتف خاطئ أو لا يجيب' : 'Invalid contact phone';
      default: return language === 'ar' ? '📝 سبب آخر' : 'Other reason';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto scrollbar-none my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto animate-bounce ${
              autoDeletedMessage ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            }`}>
              {autoDeletedMessage ? <Zap className="w-10 h-10 text-red-400" /> : <CheckCircle2 className="w-10 h-10" />}
            </div>
            
            <h3 className="text-lg font-black text-white">
              {autoDeletedMessage
                ? (language === 'ar' ? '🚨 تم حذف المنشور تلقائياً وتنبيه الإدارة!' : 'Post Auto-Deleted & Admin Alerted!')
                : (language === 'ar' ? 'تم إرسال الإبلاغ بنجاح! 📩' : 'Report Sent Successfully!')}
            </h3>

            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              {autoDeletedMessage
                ? (language === 'ar'
                    ? 'وصل عدد البلاغات إلى 5 بلاغات فأكثر! تم إخفاء وحذف المنشور مباشرةً من التطبيق وإرسال إشعار عاجل للإدارة.'
                    : 'The post received 5+ reports. It was automatically deleted and platform admin was alerted.')
                : (language === 'ar'
                    ? `وصل إبلاغك للإدارة (البلاغات الحالية: ${currentCount + 1}/5). يُحذف المنشور تلقائياً فور وصول 5 بلاغات.`
                    : 'Your report reached platform admin.')}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center text-red-400 shrink-0">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                  <span>{language === 'ar' ? 'الإبلاغ عن إعلان مخالف' : 'Report Misleading Listing'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {postTitle} ({postCategory})
                </p>
              </div>
            </div>

            {/* Rule Notice */}
            <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-2.5 flex items-start gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed text-red-200">
                <strong>سياسة الأمان والرصد:</strong> البلاغات الحالية المسجلة على هذا الإعلان (
                <span className="text-amber-400 font-bold font-mono">{currentCount} / 5</span>). عند وصول 5 بلاغات، يتم <strong>حذف المنشور تلقائياً</strong> وإرسال تنبيه عاجل للإدارة!
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'اختر سبب الإبلاغ الرئيسي:' : 'Reason for report:'}</span>
                </label>
                <div className="space-y-1">
                  {(['scam', 'wrong_price', 'inappropriate', 'fake', 'spam', 'other'] as ReportReason[]).map((r) => (
                    <label
                      key={r}
                      onClick={() => setReason(r)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                        reason === r
                          ? 'bg-red-950/40 border-red-500 text-white font-bold shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="accent-red-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs">{getReasonLabel(r)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-bold">
                  {language === 'ar' ? 'تفاصيل إضافية (اختياري)' : 'Additional Details'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ar' ? 'اكتب أي ملاحظات توضيحية للإدارة...' : 'Add notes...'}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'اسمك (اختياري)' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: أبو محمد"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-bold">
                    {language === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="0999000111"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إرسال الإبلاغ للإدارة فوراً 🚨' : 'Send Report to Admin'}</span>
                </button>

                {/* Quick Test Simulation Button */}
                <button
                  type="button"
                  onClick={handleSimulate5Reports}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ تجربة الحذف التلقائي العاجل (محاكاة 5 بلاغات)</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
