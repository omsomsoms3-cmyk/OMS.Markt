import React, { useEffect, useState } from 'react';
import { subscribeToActivityLogs, UserActivityLog } from '../lib/activityLogs';
import { useLanguage } from '../context/LanguageContext';
import { History, Activity, Database, Sparkles, CheckCircle, Clock, FileSpreadsheet } from 'lucide-react';
import { exportActivityLogsToCSV } from '../lib/exportCSV';

export const UserActivityLogSection: React.FC = () => {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<UserActivityLog[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToActivityLogs((data) => {
      setLogs(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2 text-amber-400">
          <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h4 className="text-xs font-bold text-white">
            {language === 'ar' ? 'سجل النشاطات المحفوظة (Firebase Firestore)' : 'Firestore Activity Logs'}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={() => exportActivityLogsToCSV(logs)}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/40 rounded-lg transition-all cursor-pointer"
              title={language === 'ar' ? 'تصدير سجل النشاطات لملف CSV / Excel' : 'Export activity logs to CSV'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تصدير CSV' : 'CSV Export'}</span>
            </button>
          )}

          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
            {logs.length} {language === 'ar' ? 'نشاط' : 'entries'}
          </span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500 flex flex-col items-center gap-1">
          <Clock className="w-5 h-5 text-slate-600 mb-1" />
          <span>{language === 'ar' ? 'لا توجد نشاطات مسجلة بعد' : 'No activity logged yet'}</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.slice(0, 15).map((log, idx) => (
            <div
              key={log.id || idx}
              className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2.5 text-xs transition-all hover:border-slate-700"
            >
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-amber-300 truncate">{log.action}</span>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">{log.createdAt}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-snug">
                  {log.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
