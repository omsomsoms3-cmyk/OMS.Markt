import React from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmText,
  cancelText,
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const defaultTitle = language === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirm Permanent Deletion';
  const defaultMessage =
    language === 'ar'
      ? 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لن تتمكن من استعادته بعد الحذف.'
      : 'Are you sure you want to delete this item? This action cannot be undone.';
  const defaultConfirmText = language === 'ar' ? 'نعم، احذف الإعلان' : 'Yes, Delete Item';
  const defaultCancelText = language === 'ar' ? 'إلغاء' : 'Cancel';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative text-right dir-rtl overflow-hidden">
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5 pt-1">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {title || defaultTitle}
            </h3>
            <p className="text-xs text-rose-300 font-medium flex items-center gap-1 mt-0.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تنبيه أمان لمنع الحذف بالخطأ' : 'Safety verification required'}</span>
            </p>
          </div>
        </div>

        {/* Item Box Preview if provided */}
        {itemName && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {language === 'ar' ? 'العنصر المحدد للحذف:' : 'Selected Item:'}
            </span>
            <p className="text-xs font-bold text-amber-300 truncate dir-auto">
              "{itemName}"
            </p>
          </div>
        )}

        {/* Main Message Body */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          {message || defaultMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmText || defaultConfirmText}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
          >
            {cancelText || defaultCancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
