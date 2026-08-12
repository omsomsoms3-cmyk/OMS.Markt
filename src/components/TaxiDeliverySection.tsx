import React, { useState } from 'react';
import { TaxiDeliveryOrder } from '../types';
import { initialTaxiOrders } from '../data/mockData';
import { Truck, Car, MapPin, Phone, User, Clock, CheckCircle, Plus, AlertCircle, Flag, Trash2, Share2, Bookmark, BookmarkCheck, Globe, QrCode } from 'lucide-react';
import { ReportModal } from './ReportModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ShareAppModal } from './ShareAppModal';
import { useReports } from '../context/ReportContext';
import { shareListingItem, shareToWhatsApp, shareToTelegram } from '../lib/share';
import { useBookmarks } from '../context/BookmarkContext';
import { INTERNATIONAL_COUNTRIES } from '../lib/locations';
import { QuickShareButtons } from './QuickShareButtons';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { InfiniteScrollLoader } from './InfiniteScrollLoader';

interface TaxiDeliverySectionProps {
  searchQuery?: string;
}

export const TaxiDeliverySection: React.FC<TaxiDeliverySectionProps> = ({ searchQuery = '' }) => {
  const { isPostDeleted } = useReports();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [orders, setOrders] = useState<TaxiDeliveryOrder[]>(initialTaxiOrders);
  const [orderType, setOrderType] = useState<'taxi' | 'delivery'>('taxi');
  const [fromCity, setFromCity] = useState('دمشق');
  const [fromArea, setFromArea] = useState('');
  const [toArea, setToArea] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [reportOrder, setReportOrder] = useState<TaxiDeliveryOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<TaxiDeliveryOrder | null>(null);
  const [shareOrder, setShareOrder] = useState<TaxiDeliveryOrder | null>(null);

  const filteredOrders = orders.filter((ord) => {
    if (isPostDeleted(ord.id)) return false;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      ord.fromCity.toLowerCase().includes(query) ||
      ord.fromArea.toLowerCase().includes(query) ||
      ord.toArea.toLowerCase().includes(query) ||
      ord.customerName.toLowerCase().includes(query) ||
      ord.phone.includes(query) ||
      (ord.notes && ord.notes.toLowerCase().includes(query))
    );
  });

  const {
    displayedItems,
    visibleCount,
    hasMore,
    isLoadingMore,
    loadMore,
    observerTargetRef,
    totalCount,
  } = useInfiniteScroll<TaxiDeliveryOrder>(filteredOrders, {
    initialCount: 10,
    step: 10,
    dependencies: [searchQuery],
  });

  const handleShareTaxiOrder = async (ord: TaxiDeliveryOrder) => {
    const typeTitle = ord.type === 'taxi' ? 'طلب تكسي خاص' : 'طلب توصيل طرد';
    const res = await shareListingItem({
      title: `${typeTitle} - ${ord.fromCity} إلى ${ord.toArea}`,
      text: `طلب توصيل OMS: من ${ord.fromCity} (${ord.fromArea}) إلى ${ord.toArea} | التكلفة: ${ord.estimatedCostSYP.toLocaleString()} ل.س | العميل: ${ord.customerName}`,
      url: `${window.location.origin}${window.location.pathname}?tab=taxi&id=${ord.id}`,
    });
    if (res.success && res.method === 'clipboard') {
      alert('تم نسخ معلومات ورابط الطلب بنجاح (Web Share) 📋');
    }
  };

  const handleToggleTaxiBookmark = (ord: TaxiDeliveryOrder) => {
    const typeTitle = ord.type === 'taxi' ? 'طلب تكسي خاص' : 'طلب توصيل طرد';
    toggleBookmark({
      id: ord.id,
      itemType: 'taxi',
      title: `${typeTitle} (${ord.fromCity})`,
      subtitle: `من ${ord.fromArea} إلى ${ord.toArea} • العميل: ${ord.customerName}`,
      city: ord.fromCity,
      priceSYP: ord.estimatedCostSYP,
      phone: ord.phone,
      savedAt: new Date().toISOString(),
      originalData: ord,
    });
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromArea || !toArea || !customerName || !phone) return;

    const newOrder: TaxiDeliveryOrder = {
      id: `ord-${Date.now()}`,
      type: orderType,
      fromCity,
      fromArea,
      toArea,
      customerName,
      phone,
      status: 'pending',
      estimatedCostSYP: orderType === 'taxi' ? 30000 : 20000,
      notes,
      createdAt: 'الآن'
    };

    setOrders([newOrder, ...orders]);
    setFromArea('');
    setToArea('');
    setNotes('');
  };

  return (
    <div className="p-4 max-w-7xl w-full mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            توصيل التكسي والطلبات داخل السورية OMS
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            طلب سيارة تكسي خاصة أو توصيل طرود وهدايا وطلبات تجارية بسرعة وأمان.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Submission Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-700/80 pb-2 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            إنشاء طلب توصيل جديد
          </h3>

          <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">نوع الخدمة المطلوب</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('taxi')}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'taxi'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>تكسي خاص</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'delivery'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>توصيل طرد</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>الدولة والمدينة (محلي ودولي 🌍)</span>
              </label>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium"
              >
                {INTERNATIONAL_COUNTRIES.map((c) => (
                  <optgroup key={c.code} label={`${c.flag} ${c.nameAr}`}>
                    {c.cities.map((ci) => {
                      const val = `${c.nameAr} - ${ci.nameAr}`;
                      return (
                        <option key={ci.nameAr} value={val}>
                          {c.flag} {c.nameAr} - {ci.nameAr}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 block mb-1">مكان الانطلاق</label>
                <input
                  type="text"
                  required
                  value={fromArea}
                  onChange={(e) => setFromArea(e.target.value)}
                  placeholder="مثال: البرامكة"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">مكان الوصول</label>
                <input
                  type="text"
                  required
                  value={toArea}
                  onChange={(e) => setToArea(e.target.value)}
                  placeholder="مثال: مشروع دمر"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">اسم العميل / المستلم</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="الاسم الكامل..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">رقم الهاتف للتواصل</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XXXXXXXX"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white dir-ltr text-left"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">ملاحظات إضافية</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="وصف الطرد أو أي طلب خاص للطلب..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white h-16 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg text-xs"
            >
              إرسال الطلب فوراً للكباتن
            </button>
          </form>
        </div>

        {/* Live Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>قائمة الطلبات المباشرة OMS ({filteredOrders.length})</span>
            <span className="text-xs text-emerald-400 font-normal">تحديث تلقائي</span>
          </h3>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                لا توجد طلبات تكسي أو توصيل تطابق البحث الحقيقي.
              </div>
            ) : (
              displayedItems.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-slate-800/90 border border-emerald-500/25 dark:border-slate-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-900 dark:text-white"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.type === 'taxi' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {ord.type === 'taxi' ? 'تكسي خاص' : 'توصيل طرد'}
                      </span>

                      <span className="text-xs text-slate-400 font-mono">#{ord.id}</span>
                      <span className="text-xs text-slate-500">| {ord.createdAt}</span>
                    </div>

                    {/* Quick Bookmark & Native Web Share Header Icon Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTaxiBookmark(ord);
                        }}
                        title={isBookmarked(ord.id) ? 'الطلب محفوظ في المفضلة المحلية 🔖' : 'حفظ سريع في المفضلة 🔖'}
                        className={`p-1.5 rounded-xl border transition-all active:scale-90 shadow-md cursor-pointer flex items-center gap-1 ${
                          isBookmarked(ord.id)
                            ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-500/30'
                            : 'bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border-slate-700/80'
                        }`}
                      >
                        {isBookmarked(ord.id) ? <BookmarkCheck className="w-3.5 h-3.5 fill-slate-950 text-slate-950" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareTaxiOrder(ord);
                        }}
                        title="مشاركة الطلب عبر التطبيقات (Web Share)"
                        className="p-1.5 rounded-xl border border-cyan-500/40 bg-slate-950/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 transition-all active:scale-90 shadow-md cursor-pointer flex items-center justify-center"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse font-bold text-white text-sm">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>من {ord.fromCity} ({ord.fromArea}) ➔ إلى {ord.toArea}</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    العميل: <span className="font-semibold text-white">{ord.customerName}</span> | هاتف: <span className="font-mono text-emerald-400 dir-ltr inline-block">{ord.phone}</span>
                  </p>

                  {ord.notes && (
                    <p className="text-[11px] text-slate-400 italic">ملاحظات: {ord.notes}</p>
                  )}
                </div>

                <div className="sm:text-left text-right shrink-0 border-t sm:border-t-0 sm:border-r border-slate-700 pt-2 sm:pt-0 pr-0 sm:pr-4 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400 block">التكلفة التقديرية</span>
                    <span className="text-base font-black text-emerald-400 font-mono block">
                      {ord.estimatedCostSYP.toLocaleString()} ل.س
                    </span>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      جاري التوصيل
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleTaxiBookmark(ord)}
                      title={isBookmarked(ord.id) ? 'محفوظ في المفضلة' : 'حفظ في المفضلة'}
                      className={`p-2 rounded-xl transition-all active:scale-95 text-xs flex items-center gap-1 cursor-pointer ${
                        isBookmarked(ord.id)
                          ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-md shadow-amber-500/30'
                          : 'bg-slate-900 hover:bg-amber-500/20 text-amber-400 border border-slate-700'
                      }`}
                    >
                      {isBookmarked(ord.id) ? <BookmarkCheck className="w-3.5 h-3.5 text-slate-950" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setShareOrder(ord)}
                      title="مشاركة الطلب (واتساب، تليجرام، رابط، QR)"
                      className="p-2 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/40 rounded-xl transition-all active:scale-95 text-xs flex items-center justify-center cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setReportOrder(ord)}
                      title="إبلاغ عن هذا الطلب"
                      className="p-2 bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 rounded-xl transition-all active:scale-95 text-xs flex items-center gap-1"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">إبلاغ</span>
                    </button>
                    <button
                      onClick={() => setDeleteOrder(ord)}
                      title="حذف الطلب"
                      className="p-2 bg-slate-900 hover:bg-rose-950/80 text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-xl transition-all active:scale-95 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">حذف</span>
                    </button>
                  </div>

                  {/* Quick Social Share Buttons (WhatsApp / Telegram) */}
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-400">نشر الطلب:</span>
                    <QuickShareButtons
                      title={`طلب ${ord.type === 'taxi' ? 'تكسي' : 'توصيل'} - ${ord.fromCity}`}
                      text={`من ${ord.fromCity} (${ord.fromArea}) إلى ${ord.toArea} | تكلفة: ${ord.estimatedCostSYP.toLocaleString()} ل.س`}
                      url={`${window.location.origin}${window.location.pathname}?tab=taxi&id=${ord.id}`}
                    />
                  </div>
                </div>
              </div>
            )))}

          </div>

          {/* Infinite Scroll Indicator */}
          <InfiniteScrollLoader
            observerTargetRef={observerTargetRef}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            visibleCount={visibleCount}
            totalCount={totalCount}
            onLoadMore={loadMore}
          />
        </div>
      </div>

      <ReportModal
        isOpen={!!reportOrder}
        onClose={() => setReportOrder(null)}
        postId={reportOrder?.id || ''}
        postTitle={reportOrder ? `طلب توصيل/تكسي من ${reportOrder.fromCity} (${reportOrder.fromArea}) إلى ${reportOrder.toArea}` : ''}
        postCategory="تكسي وتوصيل"
      />

      <ConfirmDeleteModal
        isOpen={!!deleteOrder}
        onClose={() => setDeleteOrder(null)}
        onConfirm={() => {
          if (deleteOrder) {
            setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
            setDeleteOrder(null);
          }
        }}
        title="تأكيد حذف طلب التوصيل/التكسي"
        message="هل أنت متأكد من رغبتك في إلغاء وحذف هذا الطلب من القائمة؟"
        itemName={deleteOrder ? `طلب من ${deleteOrder.fromCity} (${deleteOrder.fromArea}) إلى ${deleteOrder.toArea}` : ''}
        confirmText="نعم، احذف الطلب"
      />

      <ShareAppModal
        isOpen={!!shareOrder}
        onClose={() => setShareOrder(null)}
        title={shareOrder ? `طلب ${shareOrder.type === 'taxi' ? 'تكسي' : 'توصيل طرد'} - من ${shareOrder.fromCity} (${shareOrder.fromArea}) إلى ${shareOrder.toArea}` : ''}
        description={shareOrder ? `طلب مباشر على OMS: من ${shareOrder.fromCity} (${shareOrder.fromArea}) إلى ${shareOrder.toArea} بتكلفة تقريبية ${shareOrder.estimatedCostSYP.toLocaleString()} ل.س` : ''}
      />
    </div>
  );
};
