import React, { useState } from 'react';
import { X, Send, DollarSign, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  originalPriceUSD: number;
  originalPriceSYP: number;
  sellerPhone: string;
  onOfferSent?: (offerUSD: number, offerSYP: number, note: string) => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  originalPriceUSD,
  originalPriceSYP,
  sellerPhone,
  onOfferSent,
}) => {
  const { language } = useLanguage();
  const [offerUSD, setOfferUSD] = useState<string>(Math.round(originalPriceUSD * 0.9).toString());
  const [note, setNote] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const calculatedOfferSYP = offerUSD ? Math.round(parseFloat(offerUSD) * (originalPriceSYP / (originalPriceUSD || 1))) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (onOfferSent) {
      onOfferSent(parseFloat(offerUSD) || 0, calculatedOfferSYP, note);
    }
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'تقديم عرض سعر (تفاوض مباشر)' : 'Make Price Offer'}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">{itemTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">
              {language === 'ar' ? 'تم إرسال عرضك بنجاح! 🎉' : 'Offer Sent Successfully! 🎉'}
            </h4>
            <p className="text-xs text-slate-300">
              {language === 'ar'
                ? `تم تحويل العرض إلى البائع (${sellerPhone}). سنتواصل معك فور موافقة البائع.`
                : `Your offer was forwarded to seller (${sellerPhone}). We will notify you once accepted.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Original Price Reference */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs">
              <span className="text-slate-400">{language === 'ar' ? 'السعر الأصلي المطلوب:' : 'Original Price:'}</span>
              <div className="text-right">
                <span className="text-emerald-400 font-bold text-sm">${originalPriceUSD.toLocaleString()} USD</span>
                <span className="text-slate-500 text-[10px] block">({originalPriceSYP.toLocaleString()} ل.س)</span>
              </div>
            </div>

            {/* Offer Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'ar' ? 'عرضك المقترح (بالدولار USD):' : 'Your Proposed Offer (USD):'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-400 font-bold">
                  $
                </div>
                <input
                  type="number"
                  value={offerUSD}
                  onChange={(e) => setOfferUSD(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pr-8 pl-3 text-white font-bold text-sm focus:outline-none transition-colors"
                  placeholder="أدخل السعر المقترح..."
                />
              </div>
              {calculatedOfferSYP > 0 && (
                <span className="text-[11px] text-amber-400/90 mt-1 block">
                  {language === 'ar'
                    ? `يعادل حوالي: ${calculatedOfferSYP.toLocaleString()} ليرة سورية`
                    : `Approx: ${calculatedOfferSYP.toLocaleString()} SYP`}
                </span>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'ar' ? 'ملاحظة أو رسالة للبائع (اختياري):' : 'Message to Seller (Optional):'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none transition-colors"
                placeholder={language === 'ar' ? 'مثال: جاهز للشراء الفوري كاش اليوم...' : 'e.g., Ready to pay cash today...'}
              />
            </div>

            {/* Guarantee Tag */}
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'تفاوض آمن ومباشر. لن يتم خصم أي مبلغ حتى توافق على الاستلام والمعاينة.'
                  : 'Safe negotiation. No payment deducted until you verify item condition.'}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إرسال العرض الآن' : 'Send Offer Now'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
