import React from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';
import { formatPublicationDate } from '../lib/dateUtils';
import { useLanguage } from '../context/LanguageContext';

interface PostDateBadgeProps {
  createdAt?: string;
  fallbackIndex?: number;
  className?: string;
}

export const PostDateBadge: React.FC<PostDateBadgeProps> = ({
  createdAt,
  fallbackIndex = 0,
  className = '',
}) => {
  const { language } = useLanguage();
  const dateInfo = formatPublicationDate(createdAt, language, fallbackIndex);

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border backdrop-blur transition-all ${
        dateInfo.isToday
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-900/30 font-bold'
          : 'bg-slate-950/80 text-amber-300 border-slate-800 font-medium'
      } ${className}`}
      title={language === 'ar' ? `تاريخ ونشر المنشور: ${dateInfo.dateStr}` : `Publication Date: ${dateInfo.dateStr}`}
    >
      {dateInfo.isToday ? (
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      )}
      <span>{dateInfo.badgeLabel}</span>
    </div>
  );
};
