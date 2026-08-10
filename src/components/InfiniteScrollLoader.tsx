import React from 'react';
import { Loader2, ArrowDown, CheckCircle2 } from 'lucide-react';

interface InfiniteScrollLoaderProps {
  observerTargetRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  isLoadingMore: boolean;
  visibleCount: number;
  totalCount: number;
  onLoadMore: () => void;
  language?: 'ar' | 'en';
}

export const InfiniteScrollLoader: React.FC<InfiniteScrollLoaderProps> = ({
  observerTargetRef,
  hasMore,
  isLoadingMore,
  visibleCount,
  totalCount,
  onLoadMore,
  language = 'ar',
}) => {
  if (totalCount === 0) return null;

  return (
    <div ref={observerTargetRef} className="w-full py-6 flex flex-col items-center justify-center gap-3 border-t border-slate-800/40 mt-6">
      {hasMore ? (
        <div className="flex flex-col items-center gap-3">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border border-amber-500/40 rounded-xl shadow-lg text-amber-300 font-bold text-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>{language === 'ar' ? 'جاري تحميل المزيد من الإعلانات...' : 'Loading more listings...'}</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer group"
            >
              <ArrowDown className="w-4 h-4 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
              <span>
                {language === 'ar'
                  ? `عرض المزيد من الإعلانات (${Math.min(12, totalCount - visibleCount)} إضافي)`
                  : `Load more (${Math.min(12, totalCount - visibleCount)} remaining)`}
              </span>
            </button>
          )}

          <div className="text-[11px] font-medium text-slate-400">
            {language === 'ar'
              ? `تم عرض ${visibleCount} من أصل ${totalCount} إعلان`
              : `Showing ${visibleCount} of ${totalCount} listings`}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 font-medium text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {language === 'ar'
              ? `تم عرض كافة الإعلانات (${totalCount} إعلان)`
              : `All ${totalCount} listings loaded`}
          </span>
        </div>
      )}
    </div>
  );
};
