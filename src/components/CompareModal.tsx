import React from 'react';
import { X, Scale, Check, Trash2, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CarListing, RealEstateListing } from '../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: (CarListing | RealEstateListing)[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 max-w-4xl w-full shadow-2xl relative overflow-hidden space-y-5 max-h-[90vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'مقارنة العروض والسلع المتشابهة' : 'Compare Selected Items'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? `تم اختيار ${items.length} عنصر للمقارنة المباشرة`
                  : `${items.length} items selected for side-by-side comparison`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'مسح الكل' : 'Clear All'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {items.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <ArrowLeftRight className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <p className="text-sm font-semibold text-slate-300">
              {language === 'ar' ? 'لم تقم بإضافة أي عنصر للمقارنة بعد.' : 'No items added for comparison yet.'}
            </p>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'اضغط على زر (مقارنة ⚖️) في بطاقة أي إعلان لإضافته هنا لمقارنة السعر والمواصفات.'
                : 'Click "Compare ⚖️" on any listing card to compare price and details here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-3 font-semibold w-28">{language === 'ar' ? 'المعيار' : 'Feature'}</th>
                  {items.map((item) => (
                    <th key={item.id} className="p-3 font-semibold min-w-[200px] text-center bg-slate-950/40 border-r border-slate-800/60">
                      <div className="relative group">
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="absolute -top-1 -right-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white p-1 rounded-full transition-all"
                          title={language === 'ar' ? 'إزالة من المقارنة' : 'Remove'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <img
                          src={'image' in item ? item.image : item.images?.[0]}
                          alt={item.title}
                          className="w-full h-24 object-cover rounded-xl mb-2 border border-slate-800"
                        />
                        <span className="font-bold text-white block truncate">{item.title}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {/* Price USD */}
                <tr>
                  <td className="p-3 font-bold text-emerald-400">{language === 'ar' ? 'السعر (USD)' : 'Price (USD)'}</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-3 text-center font-black text-emerald-400 bg-slate-950/20 border-r border-slate-800/60">
                      ${'priceUSD' in item ? item.priceUSD.toLocaleString() : 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Price SYP */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400">{language === 'ar' ? 'السعر (SYP)' : 'Price (SYP)'}</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-3 text-center font-bold text-amber-400 bg-slate-950/20 border-r border-slate-800/60">
                      {'priceSYP' in item ? item.priceSYP.toLocaleString() : 'N/A'} ل.س
                    </td>
                  ))}
                </tr>

                {/* City */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400">{language === 'ar' ? 'المدينة' : 'City'}</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-3 text-center bg-slate-950/20 border-r border-slate-800/60">
                      {item.city}
                    </td>
                  ))}
                </tr>

                {/* Condition / Category */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400">{language === 'ar' ? 'الحالة / النوع' : 'Condition/Type'}</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-3 text-center bg-slate-950/20 border-r border-slate-800/60">
                      {'condition' in item ? (item.condition === 'new' ? 'جديد' : 'مستعمل') : 'category' in item ? item.category : '-'}
                    </td>
                  ))}
                </tr>

                {/* Phone Contact */}
                <tr>
                  <td className="p-3 font-semibold text-slate-400">{language === 'ar' ? 'رقم التواصل' : 'Contact Phone'}</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-3 text-center bg-slate-950/20 border-r border-slate-800/60 font-mono text-emerald-400">
                      {item.phone}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق المقارنة' : 'Close Comparison'}
          </button>
        </div>
      </div>
    </div>
  );
};
