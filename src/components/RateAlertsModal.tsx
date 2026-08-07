import React, { useState } from 'react';
import { Bell, BellOff, Plus, Trash2, Check, X, ShieldAlert, Sparkles, Volume2, ArrowUpRight, ArrowDownRight, Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { RateAlert, CurrencyRate } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface RateAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: RateAlert[];
  onAddAlert: (newAlert: Omit<RateAlert, 'id' | 'createdAt'>) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onSimulateTestAlert: () => void;
  rates: CurrencyRate[];
}

export const RateAlertsModal: React.FC<RateAlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  onSimulateTestAlert,
  rates,
}) => {
  const { language } = useLanguage();

  const [city, setCity] = useState<string>('دمشق');
  const [rateType, setRateType] = useState<'buy' | 'sell'>('sell');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetRate, setTargetRate] = useState<number>(15000);
  const [note, setNote] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete Confirmation State
  const [alertToDelete, setAlertToDelete] = useState<RateAlert | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRate || targetRate <= 0) return;

    onAddAlert({
      city,
      rateType,
      condition,
      targetRate: Number(targetRate),
      note: note.trim(),
      isActive: true,
    });

    setNote('');
    setSuccessMsg(language === 'ar' ? 'تم إضافة التنبيه بنجاح! 🔔' : 'Alert added successfully! 🔔');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification(language === 'ar' ? 'تنبيهات OMS مفعّلة 🔔' : 'OMS Alerts Enabled 🔔', {
          body: language === 'ar' ? 'ستتلقى إشعاراً فورياً عند وصول سعر الصرف للسعر المحدد.' : 'You will receive instant alerts when rates hit your target.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 text-right dir-rtl animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-white text-base sm:text-lg">
                {language === 'ar' ? 'تنبيهات وإشعارات أسعار الصرف 🔔' : 'Exchange Rate Alerts 🔔'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {language === 'ar' ? 'احصل على إشعار تلقائي فور وصول سعر الصرف للرقم المطلوبة' : 'Get instant alerts when exchange rates reach your target'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Notification Permission Banner */}
          {'Notification' in window && Notification.permission !== 'granted' && (
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <Volume2 className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{language === 'ar' ? 'اسمح بإشعارات المتصفح لضمان وصول التنبيهات حتى عند إغلاق التطبيق' : 'Enable browser notifications for background alerts'}</span>
              </div>
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-[11px] shrink-0 transition-all"
              >
                {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable'}
              </button>
            </div>
          )}

          {/* Form to Create New Alert */}
          <form onSubmit={handleSubmit} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة تنبيه سعر جديد' : 'Add New Price Alert'}</span>
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                OMS Automatic Tracker
              </span>
            </div>

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* City Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {language === 'ar' ? 'المدينة' : 'City'}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="جميع المدن">{language === 'ar' ? '🌐 جميع المدن السورية' : '🌐 All Syrian Cities'}</option>
                  {rates.map((r, i) => (
                    <option key={i} value={r.city}>
                      {r.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buy or Sell */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {language === 'ar' ? 'نوع السعر' : 'Rate Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRateType('sell')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      rateType === 'sell'
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {language === 'ar' ? 'سعر البيع (مبيع)' : 'Sell Rate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateType('buy')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      rateType === 'buy'
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {language === 'ar' ? 'سعر الشراء (شراء)' : 'Buy Rate'}
                  </button>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {language === 'ar' ? 'شرط التنبيه' : 'Alert Condition'}
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="above">
                    {language === 'ar' ? '↗️ عندما يصل أو يتجاوز (أعلى من)' : '↗️ Reaches or exceeds (Above)'}
                  </option>
                  <option value="below">
                    {language === 'ar' ? '↘️ عندما ينخفض لـ أو أقل من' : '↘️ Drops to or below'}
                  </option>
                </select>
              </div>

              {/* Target Price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {language === 'ar' ? 'السعر المستهدف (للدولار بالليرة)' : 'Target Rate (USD in SYP)'}
                </label>
                <input
                  type="number"
                  step="50"
                  value={targetRate}
                  onChange={(e) => setTargetRate(Number(e.target.value))}
                  required
                  placeholder="15000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm font-mono font-bold text-emerald-400 text-left dir-ltr focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Note input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">
                {language === 'ar' ? 'ملاحظة خاصة (اختياري)' : 'Custom Note (Optional)'}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: تنبيه لشراء $500 للمحل' : 'e.g. Alert for buying $500'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Bell className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>{language === 'ar' ? 'تأكيد وإضافة التنبيه' : 'Save & Activate Alert'}</span>
            </button>
          </form>

          {/* Active Alerts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                <span>{language === 'ar' ? 'التنبيهات المضافة' : 'Saved Price Alerts'}</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {alerts.length}
                </span>
              </h4>

              <button
                type="button"
                onClick={onSimulateTestAlert}
                className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all hover:bg-amber-500/20"
              >
                <Play className="w-3 h-3 fill-amber-300" />
                <span>{language === 'ar' ? 'تجربة التنبيه الآن 🔔' : 'Test Alert Trigger'}</span>
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2">
                <BellOff className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'لا توجد تنبيهات أسعار مضافة حالياً. قم بإضافة تنبيهك الأول أعلاه.' : 'No active price alerts saved yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      alert.isActive
                        ? 'bg-slate-950 border-emerald-500/40'
                        : 'bg-slate-950/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {alert.city} — {alert.rateType === 'sell' ? (language === 'ar' ? 'سعر البيع' : 'Sell') : (language === 'ar' ? 'سعر الشراء' : 'Buy')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alert.condition === 'above' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {alert.condition === 'above' ? (language === 'ar' ? 'أعلى من ↗️' : 'Above ↗️') : (language === 'ar' ? 'أقل من ↘️' : 'Below ↘️')}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-bold text-emerald-400 dir-ltr text-right">
                        {alert.targetRate.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">{language === 'ar' ? 'ل.س' : 'SYP'}</span>
                      </div>

                      {alert.note && (
                        <p className="text-[10px] text-slate-400">{alert.note}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleAlert(alert.id)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                          alert.isActive
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {alert.isActive ? (language === 'ar' ? 'مفعّل 🟢' : 'Active') : (language === 'ar' ? 'معطل ⚪' : 'Disabled')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAlertToDelete(alert)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title={language === 'ar' ? 'حذف التنبيه' : 'Delete alert'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Deleting Rate Alert */}
      <ConfirmDeleteModal
        isOpen={!!alertToDelete}
        onClose={() => setAlertToDelete(null)}
        onConfirm={() => {
          if (alertToDelete) {
            onDeleteAlert(alertToDelete.id);
            setAlertToDelete(null);
          }
        }}
        title={language === 'ar' ? 'تأكيد حذف تنبيه السعر' : 'Confirm Alert Deletion'}
        message={
          language === 'ar'
            ? 'هل أنت متأكد من رغبتك في إزالة هذا التنبيه؟ لن يتم إشعاراتك عند وصول سعر الصرف للرقم المحدد بعد الحذف.'
            : 'Are you sure you want to remove this alert? You will no longer receive notifications for this rate.'
        }
        itemName={
          alertToDelete
            ? `${alertToDelete.city} - ${alertToDelete.rateType === 'sell' ? 'مبيع' : 'شراء'} عند ${alertToDelete.targetRate.toLocaleString()} ل.س`
            : ''
        }
        confirmText={language === 'ar' ? 'نعم، احذف التنبيه' : 'Yes, Delete Alert'}
      />
    </div>
  );
};
