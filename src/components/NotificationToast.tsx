import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { FCMNotification } from '../lib/messaging';

interface NotificationToastProps {
  notification: FCMNotification | null;
  onClose: () => void;
  onClick: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose, onClick }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-top duration-300">
      <div
        onClick={onClick}
        className="bg-slate-900/95 border border-amber-500/50 shadow-2xl rounded-2xl p-3.5 backdrop-blur-md flex items-start justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all group"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-xl shadow-md shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
              {notification.title}
            </h4>
            <p className="text-[11px] text-slate-200 mt-0.5 line-clamp-2 leading-relaxed">
              {notification.body}
            </p>
            <span className="text-[9px] text-slate-500 block mt-1 font-mono">
              تنبيه فوري • {notification.timestamp}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
