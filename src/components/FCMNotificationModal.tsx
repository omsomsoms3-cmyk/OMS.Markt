import React, { useState, useEffect } from 'react';
import { X, Bell, BellRing, Check, Smartphone, Sparkles, MessageSquare, Car, Home, Briefcase, Truck, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { requestFCMToken, broadcastNotification, FCMNotification, subscribeToNotificationAlerts } from '../lib/messaging';

interface FCMNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: FCMNotification[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const FCMNotificationModal: React.FC<FCMNotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  const { language } = useLanguage();
  const [permissionGranted, setPermissionGranted] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState<boolean>(false);

  // Category alert subscriptions
  const [savedCategories, setSavedCategories] = useState<{ [key: string]: boolean }>({
    cars: true,
    realestate: true,
    jobs: true,
    taxidelivery: true,
    messages: true,
  });

  const handleEnablePush = async () => {
    setLoadingToken(true);
    const token = await requestFCMToken();
    if (token) {
      setFcmToken(token);
      setPermissionGranted(true);
      broadcastNotification({
        title: language === 'ar' ? 'تم تفعيل التنبيهات الفورية بنجاح! 🔔' : 'Push Notifications Enabled! 🔔',
        body: language === 'ar' ? 'ستصلك إشعارات فورية عند توفر إعلانات جديدة أو ردود على رسائلك.' : 'You will receive instant alerts for new listings and message replies.',
        type: 'system',
      });
    } else {
      alert(language === 'ar' ? 'يرجى السماح بالتنبيهات في إعدادات المتصفح' : 'Please allow notifications in browser settings.');
    }
    setLoadingToken(false);
  };

  const handleSendTestNotification = () => {
    broadcastNotification({
      title: language === 'ar' ? 'إعلان جديد في قسم السيارات 🚗' : 'New Listing in Cars 🚗',
      body: language === 'ar' ? 'تم إضافة سيارة هيونداي النترا 2022 بسعر $12,500 في دمشق.' : 'Hyundai Elantra 2022 added for $12,500 in Damascus.',
      category: 'cars',
      type: 'category_listing',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative overflow-hidden space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/20 font-black">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'تنبيهات الإشعارات الفورية (FCM Cloud)' : 'FCM Push Notifications'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Firebase FCM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'إشعارات لحظية عند نزول إعلانات جديدة في أقسامك المفضلة أو الرد على رسائلك'
                  : 'Real-time alerts for saved category listings & direct message replies'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {/* Push Status Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${permissionGranted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {language === 'ar' ? 'حالة التنبيهات على الجهاز:' : 'Device Alert Status:'}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${permissionGranted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                    {permissionGranted ? (language === 'ar' ? 'مفعلة ✓' : 'Enabled ✓') : (language === 'ar' ? 'غير مفعلة ⚡' : 'Disabled ⚡')}
                  </span>
                </div>
                {fcmToken && (
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px] block mt-0.5">
                    FCM Token: {fcmToken.substring(0, 20)}...
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleEnablePush}
              disabled={loadingToken}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                permissionGranted
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>
                {loadingToken
                  ? (language === 'ar' ? 'جاري الاتصال بـ FCM...' : 'Connecting FCM...')
                  : permissionGranted
                  ? (language === 'ar' ? 'إعادة جلب توكن FCM' : 'Refresh FCM Token')
                  : (language === 'ar' ? 'تفعيل الإشعارات الآن 🔔' : 'Enable Push Alerts 🔔')}
              </span>
            </button>
          </div>

          {/* Saved Categories Selection */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'الأقسام المفضلة للتنبيهات الفورية:' : 'Saved Alert Categories:'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'cars', label: language === 'ar' ? 'إعلانات السيارات 🚗' : 'Cars 🚗', icon: <Car className="w-3.5 h-3.5 text-emerald-400" /> },
                { id: 'realestate', label: language === 'ar' ? 'العقارات والبيوت 🏠' : 'Real Estate 🏠', icon: <Home className="w-3.5 h-3.5 text-indigo-400" /> },
                { id: 'jobs', label: language === 'ar' ? 'فرص العمل والوظائف 💼' : 'Jobs 💼', icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" /> },
                { id: 'taxidelivery', label: language === 'ar' ? 'التكسي والتوصيل 🚚' : 'Taxi & Delivery 🚚', icon: <Truck className="w-3.5 h-3.5 text-amber-400" /> },
                { id: 'messages', label: language === 'ar' ? 'الردود على الرسائل 💬' : 'Message Replies 💬', icon: <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSavedCategories((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-right transition-all cursor-pointer ${
                    savedCategories[cat.id]
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </div>
                  {savedCategories[cat.id] && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Test FCM Push Button */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-indigo-300 block">
                {language === 'ar' ? 'اختبار التنبيه الفوري الحقيقي (FCM Payload):' : 'Test Real-Time FCM Push:'}
              </span>
              <span className="text-slate-400 text-[11px]">
                {language === 'ar' ? 'اضغط لإرسال تنبيه تجريبي ومحاكاة وصول إعلان جديد.' : 'Click to send a test push payload & banner toast.'}
              </span>
            </div>
            <button
              onClick={handleSendTestNotification}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تجربة الآن 🚀' : 'Test Push 🚀'}</span>
            </button>
          </div>

          {/* Notification History List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">
                {language === 'ar' ? `سجل التنبيهات المستلمة (${notifications.length}):` : `Alert History (${notifications.length}):`}
              </span>
              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-amber-400 hover:underline text-[11px]"
                  >
                    {language === 'ar' ? 'تعليم الكل كتم قراءته' : 'Mark all read'}
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={onClearNotifications}
                    className="text-rose-400 hover:underline text-[11px]"
                  >
                    {language === 'ar' ? 'مسح السجل' : 'Clear all'}
                  </button>
                </div>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-400">
                  {language === 'ar' ? 'لا توجد تنبيهات سابقة بعد.' : 'No recent notifications yet.'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {language === 'ar'
                    ? 'عند إضافة أي إعلان جديد في الأقسام المحفوظة ستظهر التنبيهات هنا مباشرة.'
                    : 'Alerts will appear here in real time when new ads are posted.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-2xl border text-xs flex items-start justify-between gap-3 transition-colors ${
                      notif.read
                        ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-white font-semibold'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg mt-0.5">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-amber-300">{notif.title}</h5>
                        <p className="text-slate-300 text-[11px] mt-0.5">{notif.body}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">{notif.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'ar' ? 'متوافق مع معايير Google Firebase FCM 100%' : '100% Firebase FCM Compliant'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
