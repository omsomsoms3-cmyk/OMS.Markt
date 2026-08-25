import React from 'react';
import { Search, Bookmark, PlusCircle, MessageSquare, User } from 'lucide-react';
import { TabType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useBookmarks } from '../context/BookmarkContext';

interface BottomNavBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCreateAd: () => void;
  onOpenProfile: () => void;
  unreadMessagesCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateAd,
  onOpenProfile,
  unreadMessagesCount = 0,
}) => {
  const { language } = useLanguage();
  const { bookmarksCount } = useBookmarks();

  const navItems = [
    {
      id: 'cars' as TabType,
      labelAr: 'تصفح الإعلانات',
      labelEn: 'Suchen',
      icon: Search,
    },
    {
      id: 'saved' as TabType,
      labelAr: 'المفضلة',
      labelEn: 'Favoriten',
      icon: Bookmark,
      badge: bookmarksCount > 0 ? bookmarksCount : undefined,
    },
    {
      id: 'create_ad',
      labelAr: 'إضافة إعلان',
      labelEn: 'Inserieren',
      isAction: true,
      icon: PlusCircle,
    },
    {
      id: 'messages' as TabType,
      labelAr: 'الرسائل',
      labelEn: 'Nachrichten',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'profile',
      labelAr: 'حسابي',
      labelEn: 'Meins',
      isProfile: true,
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center items-center pointer-events-none pb-safe px-2 transition-all duration-300">
      <div className="w-full max-w-lg mx-auto pointer-events-auto bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border-t sm:border border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.15)] rounded-t-2xl sm:rounded-2xl sm:mb-2 px-2 py-1.5 flex items-center justify-between relative">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenCreateAd}
                className="flex-1 flex flex-col items-center justify-center -mt-5 group cursor-pointer min-h-[50px]"
                title={language === 'ar' ? 'إضافة إعلان جديد (Inserieren)' : 'Post Ad (Inserieren)'}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 border-2 border-white dark:border-slate-900 group-active:scale-90 transition-all duration-200">
                  <PlusCircle className="w-6 h-6 stroke-[2.4]" />
                </div>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 mt-1 tracking-tight text-center">
                  {language === 'ar' ? item.labelAr : item.labelEn}
                </span>
              </button>
            );
          }

          if (item.isProfile) {
            return (
              <button
                key={item.id}
                onClick={onOpenProfile}
                className="flex-1 flex flex-col items-center justify-center py-1 px-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer group min-h-[46px]"
              >
                <div className="relative p-1 rounded-xl flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                  <User className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-center truncate max-w-full">
                  {language === 'ar' ? item.labelAr : item.labelEn}
                </span>
              </button>
            );
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer relative min-h-[46px] ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`relative p-1 rounded-xl flex items-center justify-center transition-all ${
                isActive ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 bg-amber-500 text-slate-950 font-black text-[9px] min-w-[15px] h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-xs border border-white dark:border-slate-900 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold mt-0.5 text-center truncate max-w-full">
                {language === 'ar' ? item.labelAr : item.labelEn}
              </span>

              {/* Top Active Indicator Line */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 bg-emerald-500 rounded-full animate-fadeIn" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
