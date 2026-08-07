import React, { useState } from 'react';
import { LedgerEntry } from '../types';
import { initialLedgerEntries } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, Plus, DollarSign, CheckCircle2, AlertCircle, Trash2, Download, FileSpreadsheet } from 'lucide-react';

export const LedgerSection: React.FC = () => {
  const { language } = useLanguage();
  const [entries, setEntries] = useState<LedgerEntry[]>(initialLedgerEntries);

  // New Entry Form
  const [clientName, setClientName] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit'); // debit = عليه, credit = له
  const [amountSYP, setAmountSYP] = useState(150000);
  const [note, setNote] = useState('');

  const totalDebit = entries
    .filter((e) => e.type === 'debit' && e.status === 'pending')
    .reduce((sum, e) => sum + e.amountSYP, 0);

  const totalCredit = entries
    .filter((e) => e.type === 'credit' && e.status === 'pending')
    .reduce((sum, e) => sum + e.amountSYP, 0);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      clientName,
      type,
      amountSYP,
      amountUSD: Math.round(amountSYP / 14950),
      note,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    setEntries([newEntry, ...entries]);
    setClientName('');
    setNote('');
  };

  const toggleStatus = (id: string) => {
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === 'pending' ? 'paid' : 'pending' } : item
      )
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleExportCSV = () => {
    if (entries.length === 0) return;

    const headers = language === 'ar'
      ? ['المعرف', 'العميل', 'النوع', 'المبلغ بالليرة', 'المبلغ بالدولار', 'البيان', 'التاريخ', 'الحالة']
      : ['ID', 'Client', 'Type', 'Amount (SYP)', 'Amount (USD)', 'Note', 'Date', 'Status'];

    const rows = entries.map((e) => [
      `"${e.id}"`,
      `"${e.clientName.replace(/"/g, '""')}"`,
      `"${e.type === 'debit' ? (language === 'ar' ? 'عليه (مدين)' : 'Debit') : (language === 'ar' ? 'له (دائن)' : 'Credit')}"`,
      e.amountSYP,
      e.amountUSD || Math.round(e.amountSYP / 14950),
      `"${(e.note || '').replace(/"/g, '""')}"`,
      `"${e.date}"`,
      `"${e.status === 'paid' ? (language === 'ar' ? 'مسدد' : 'Paid') : (language === 'ar' ? 'قيد الانتظار' : 'Pending')}"`,
    ]);

    // Add UTF-8 BOM byte for Excel / CSV compatibility with Arabic characters
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OMS_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 max-w-7xl w-full mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            {language === 'ar' ? 'دفتر الحسابات والديون والطلبات (OMS Ledger)' : 'OMS Accounting Ledger & Receivables'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'ar'
              ? 'تسجيل وحفظ حسابات العملاء والديون المقبوضة والمدفوعة ومتابعة المستحقات بالليرة والدولار.'
              : 'Track client balances, debits, credits, and outstanding amounts in SYP & USD.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          title={language === 'ar' ? 'تصدير كافة الحسابات والديون كملف CSV' : 'Export all transactions as a CSV spreadsheet'}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400/30 active:scale-95 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
          <span>{language === 'ar' ? 'تصدير السجل كـ CSV (Excel) 📊' : 'Export Ledger as CSV 📊'}</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800/90 border border-rose-500/30 p-4 rounded-xl shadow-md">
          <span className="text-xs text-slate-400 block mb-1">إجمالي ديون لك (عليه / Debit)</span>
          <span className="text-2xl font-black text-rose-400 font-mono dir-ltr block">
            {totalDebit.toLocaleString()} ل.س
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ≈ ${(totalDebit / 14950).toFixed(1)} USD
          </span>
        </div>

        <div className="bg-slate-800/90 border border-emerald-500/30 p-4 rounded-xl shadow-md">
          <span className="text-xs text-slate-400 block mb-1">إجمالي ديون عليك (له / Credit)</span>
          <span className="text-2xl font-black text-emerald-400 font-mono dir-ltr block">
            {totalCredit.toLocaleString()} ل.س
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ≈ ${(totalCredit / 14950).toFixed(1)} USD
          </span>
        </div>

        <div className="bg-slate-800/90 border border-indigo-500/30 p-4 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">عدد القيود الحالية</span>
            <span className="text-2xl font-black text-indigo-400 font-mono block">
              {entries.length} سجل
            </span>
          </div>
          <div className="p-3 bg-indigo-600/20 rounded-xl text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add Entry Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-700/80 pb-2 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            إضافة قيد حساب جديد
          </h3>

          <form onSubmit={handleAddEntry} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">اسم العميل أو الجهة</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="مثال: شركة النور للتجارة..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">نوع المعاملة</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('debit')}
                  className={`py-2 rounded-lg font-bold text-xs ${
                    type === 'debit'
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  عليه (مطلوب منه)
                </button>
                <button
                  type="button"
                  onClick={() => setType('credit')}
                  className={`py-2 rounded-lg font-bold text-xs ${
                    type === 'credit'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  له (مستحق له)
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">المبلغ (بالليرة السورية)</label>
              <input
                type="number"
                required
                value={amountSYP}
                onChange={(e) => setAmountSYP(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white dir-ltr text-left font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">بيان / ملاحظات القيد</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="تفاصيل الفاتورة أو البضاعة أو الخدمة..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg text-xs"
            >
              حفظ القيد في الدفتر
            </button>
          </form>
        </div>

        {/* Entries Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              {language === 'ar' ? 'سجل القيود والتسويات' : 'Recorded Ledger Entries & Adjustments'}
            </h3>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تحميل ملف CSV 📥' : 'Download CSV 📥'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {entries.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-800/90 border rounded-xl p-4 shadow-md flex items-center justify-between gap-4 transition-all ${
                  item.status === 'paid' ? 'border-slate-700/60 opacity-60' : item.type === 'debit' ? 'border-rose-500/30' : 'border-emerald-500/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.type === 'debit' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {item.type === 'debit' ? 'عليه (دين لك)' : 'له (دين عليك)'}
                    </span>
                    <span className="text-sm font-bold text-white">{item.clientName}</span>
                  </div>

                  <p className="text-xs text-slate-300">{item.note}</p>
                  <span className="text-[10px] text-slate-500 block">{item.date}</span>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="text-left">
                    <span className="text-base font-black font-mono text-white block dir-ltr">
                      {item.amountSYP.toLocaleString()} ل.س
                    </span>
                    {item.amountUSD && (
                      <span className="text-[11px] text-indigo-400 font-mono block dir-ltr">
                        ${item.amountUSD} USD
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleStatus(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      item.status === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    {item.status === 'paid' ? 'مسدد ✓' : 'تحديد كـ مسدد'}
                  </button>

                  <button
                    onClick={() => deleteEntry(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
