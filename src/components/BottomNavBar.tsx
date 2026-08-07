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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-1 transition-colors duration-300">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenCreateAd}
                className="flex flex-col items-center justify-center -mt-4.5 group cursor-pointer"
                title={language === 'ar' ? 'إضافة إعلان جديد (Inserieren)' : 'Post Ad (Inserieren)'}
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-600 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 border-2 border-white dark:border-slate-900 group-active:scale-90 transition-all">
                  <PlusCircle className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[9.5px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5 tracking-tight">
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
                className="flex flex-col items-center justify-center py-0.5 px-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer group"
              >
                <div className="relative p-1 rounded-xl group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                  <User className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <span className="text-[9.5px] font-bold mt-0.5">
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
              className={`flex flex-col items-center justify-center py-0.5 px-2 transition-colors cursor-pointer relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${
                isActive ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''
              }`}>
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[8.5px] min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-slate-900 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] font-bold mt-0.5">
                {language === 'ar' ? item.labelAr : item.labelEn}
              </span>

              {/* Top Active Indicator Line */}
              {isActive && (
                <span className="absolute -top-1 w-5 h-0.5 bg-emerald-500 rounded-full animate-fadeIn" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
