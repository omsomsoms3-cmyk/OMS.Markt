import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Sparkles,
  ArrowRight,
  Download,
  DollarSign,
  AlertCircle,
  Banknote,
  Calendar,
  User,
  Phone,
  MapPin,
  Building,
  Coins,
  QrCode,
  FileText
} from 'lucide-react';
import { broadcastNotification } from '../lib/messaging';

export interface PaymentItemDetails {
  id?: string;
  title: string;
  priceUSD: number;
  priceSYP: number;
  image?: string;
  type?: 'product' | 'vip_ad' | 'service' | 'car' | 'real_estate' | 'job';
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PaymentItemDetails | null;
  onSuccess?: (details: { method: string; transactionId: string; intent: 'reserve' | 'buy' }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  const { language } = useLanguage();

  // Action Intent: Reserve product or Direct Buy
  const [actionIntent, setActionIntent] = useState<'reserve' | 'buy'>('reserve');

  // Selected Payment Method
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'syriatel' | 'mastercard' | 'paypal' | 'klarna' | 'applepay' | 'crypto' | 'bank'>('cash');

  // Customer Contact & Delivery Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Form states for credit cards
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Klarna option
  const [klarnaPlan, setKlarnaPlan] = useState<'pay_later' | 'pay_in_3'>('pay_in_3');

  // Syriatel Cash state
  const [syriatelTxId, setSyriatelTxId] = useState('');

  // Crypto / Binance Pay
  const [cryptoAddress, setCryptoAddress] = useState('TRX7xOMS9988USDT2026MarketPlace');

  // Processing & Success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedTxId, setCompletedTxId] = useState('');

  if (!isOpen || !item) return null;

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedId = actionIntent === 'reserve'
        ? `OMS-RES-${Math.floor(100000 + Math.random() * 900000)}`
        : `OMS-PUR-${Math.floor(100000 + Math.random() * 900000)}`;

      setIsProcessing(false);
      setIsSuccess(true);
      setCompletedTxId(generatedId);

      // Broadcast Notification alert to app
      broadcastNotification({
        title: actionIntent === 'reserve'
          ? (language === 'ar' ? 'تم حجز المنتج بنجاح! 📌' : 'Product Reserved Successfully! 📌')
          : (language === 'ar' ? 'تم شراء المنتج وتأكيد الطلب! 🛒' : 'Product Purchased Successfully! 🛒'),
        body: language === 'ar'
          ? `رقم العملية: ${generatedId} | المبلغ: $${item.priceUSD.toLocaleString()} | طريقة الدفع: ${getMethodTitle(selectedMethod, language)}`
          : `Tx ID: ${generatedId} | Amount: $${item.priceUSD.toLocaleString()} | Payment: ${getMethodTitle(selectedMethod, language)}`,
        category: 'system',
        type: 'system',
      });

      if (onSuccess) {
        onSuccess({ method: selectedMethod, transactionId: generatedId, intent: actionIntent });
      }
    }, 1500);
  };

  const getMethodTitle = (method: string, lang: string) => {
    switch (method) {
      case 'cash':
        return lang === 'ar' ? 'الدفع نقداً عند الاستلام (Cash on Delivery)' : 'Cash on Delivery';
      case 'syriatel':
        return lang === 'ar' ? 'سيريتل كاش / شام كاش' : 'Syriatel & Sham Cash';
      case 'mastercard':
        return 'Mastercard / Visa';
      case 'paypal':
        return 'PayPal Express';
      case 'klarna':
        return 'Klarna Pay';
      case 'applepay':
        return 'Apple & Google Pay';
      case 'crypto':
        return 'USDT (TRC20) / Binance Pay';
      case 'bank':
        return lang === 'ar' ? 'تحويل بنكي / صيرفة' : 'Bank Wire Transfer';
      default:
        return method;
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      onClick={resetAndClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4 max-h-[92vh] overflow-y-auto scrollbar-none my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Metallic Gold/Green Border */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-400 rounded-2xl">
              <Banknote className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'حجز وشراء المنتج / خدمة OMS' : 'Reserve & Purchase OMS Item'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  256-bit SSL
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'اختر بين حجز السلعة أو الشراء المباشر مع خيارات دفع متعددة'
                  : 'Choose between product reservation or direct purchase with cash/online methods'}
              </p>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4 animate-scaleUp">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-white">
                {actionIntent === 'reserve'
                  ? (language === 'ar' ? 'تم حجز المنتج بنجاح! 📌' : 'Reservation Confirmed! 📌')
                  : (language === 'ar' ? 'تمت عملية الشراء بنجاح! 🛒' : 'Purchase Completed! 🛒')}
              </h4>
              <p className="text-xs text-slate-300">
                {actionIntent === 'reserve'
                  ? (language === 'ar' ? 'تم تثبيت حجزك بضمان منصة OMS، وتخصيص السلعة لك باسمك.' : 'Your reservation is secured under OMS Guarantee.')
                  : (language === 'ar' ? 'تم تأكيد طلبك وتوثيق العملية رسمياً في شبكة OMS.' : 'Your order is confirmed on OMS network.')}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs text-slate-300 max-w-sm mx-auto text-right dir-rtl">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">{language === 'ar' ? 'نوع العملية:' : 'Action Type:'}</span>
                <span className="font-bold text-amber-400">
                  {actionIntent === 'reserve'
                    ? (language === 'ar' ? 'حجز منتج 📌' : 'Product Reservation 📌')
                    : (language === 'ar' ? 'شراء مباشر 🛒' : 'Direct Purchase 🛒')}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">{language === 'ar' ? 'رقم الإشعار / المعاملة:' : 'Receipt / Tx ID:'}</span>
                <span className="font-mono font-bold text-emerald-400">{completedTxId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">{language === 'ar' ? 'المنتج / السلعة:' : 'Item:'}</span>
                <span className="font-bold text-white truncate max-w-[180px]">{item.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">{language === 'ar' ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                <span className="font-bold text-emerald-300">{getMethodTitle(selectedMethod, language)}</span>
              </div>
              {customerName && (
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">{language === 'ar' ? 'اسم المشتري:' : 'Customer:'}</span>
                  <span className="font-bold text-white">{customerName}</span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">{language === 'ar' ? 'المبلغ المستحق:' : 'Total Price:'}</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  ${item.priceUSD.toLocaleString()} / {item.priceSYP.toLocaleString()} ل.س
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetAndClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
              <button
                onClick={() => alert(language === 'ar' ? `تم تنزيل سند ${actionIntent === 'reserve' ? 'الحجز' : 'الشراء'} الإلكتروني (PDF)` : 'Receipt downloaded successfully.')}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحميل إيصال الحجز / الشراء' : 'Download Receipt Voucher'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Payment & Reservation Form */
          <div className="space-y-4">
            
            {/* Intent Switcher: Reserve vs Direct Buy */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                {language === 'ar' ? 'حدد نوع الخدمة المطلوب تنفيذها:' : 'Choose Action Intent:'}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionIntent('reserve')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    actionIntent === 'reserve'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حجز المنتج 📌' : 'Reserve Product 📌'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionIntent('buy')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    actionIntent === 'buy'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>{language === 'ar' ? 'شراء مباشر وتأكيد 🛒' : 'Direct Purchase 🛒'}</span>
                </button>
              </div>
            </div>

            {/* Item Order Summary Card */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-xl border border-slate-800 shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 text-amber-400 font-bold">
                    OMS
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                    {actionIntent === 'reserve'
                      ? (language === 'ar' ? 'طلب حجز رسمي مسبق وتثبيت السلعة' : 'Official pre-reservation')
                      : (language === 'ar' ? 'دفع وشراء مباشر بضمان المنصة' : 'Direct purchase with buyer guarantee')}
                  </p>
                </div>
              </div>
              <div className="text-left dir-ltr shrink-0">
                <div className="text-sm font-black text-emerald-400 font-mono">${item.priceUSD.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-mono">{item.priceSYP.toLocaleString()} ل.س</div>
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                {language === 'ar' ? 'اختر طريقة الدفع للمنتج / الحجز:' : 'Select Payment Method:'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('cash')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    selectedMethod === 'cash'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold">{language === 'ar' ? 'الدفع نقداً 💵' : 'Cash Payment 💵'}</span>
                  <span className="text-[9px] text-slate-400">{language === 'ar' ? 'عند الاستلام / التسليم' : 'Cash on Delivery'}</span>
                </button>

                {/* 2. Syriatel / Sham Cash */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('syriatel')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    selectedMethod === 'syriatel'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">سيريتل / شام كاش</span>
                  <span className="text-[9px] text-slate-400">{language === 'ar' ? 'محفظة إلكترونية 🇸🇾' : 'Syrian Local Wallet'}</span>
                </button>

                {/* 3. Mastercard / Visa */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('mastercard')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    selectedMethod === 'mastercard'
                      ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold">Mastercard / Visa</span>
                  <span className="text-[9px] text-slate-400">{language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}</span>
                </button>

                {/* 4. PayPal */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('paypal')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    selectedMethod === 'paypal'
                      ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-black text-blue-400 italic">PayPal</span>
                  <span className="text-xs font-bold">بايبال</span>
                  <span className="text-[9px] text-slate-400">{language === 'ar' ? 'دفع دولي' : 'Global Express'}</span>
                </button>

                {/* 5. Klarna */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('klarna')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    selectedMethod === 'klarna'
                      ? 'bg-pink-500/20 border-pink-500 text-white shadow-lg shadow-pink-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="px-1.5 py-0.5 bg-pink-500 text-slate-950 rounded text-[9px] font-black">Klarna.</span>
                  <span className="text-xs font-bold">كلارنا</span>
                  <span className="text-[9px] text-slate-400">{language === 'ar' ? 'تقسيط بدون فائدة' : 'Installments'}</span>
                </button>

                {/* 6. Apple & Google Pay */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('applepay')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    selectedMethod === 'applepay'
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white"> Pay / GPay</span>
                  <span className="text-xs font-bold">Apple Pay</span>
                  <span className="text-[9px] text-slate-400">{language === 'ar' ? 'بنقرة واحدة' : 'One Tap'}</span>
                </button>

                {/* 7. Crypto USDT */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('crypto')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    selectedMethod === 'crypto'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">USDT / Binance</span>
                  <span className="text-[9px] text-slate-400">{language === 'ar' ? 'عملات رقمية' : 'Crypto Pay'}</span>
                </button>

                {/* 8. Bank Wire */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bank')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                    selectedMethod === 'bank'
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold">{language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</span>
                  <span className="text-[9px] text-slate-400">{language === 'ar' ? 'صيرفة / بنك' : 'Wire Transfer'}</span>
                </button>
              </div>
            </div>

            {/* Form Fields Container */}
            <form onSubmit={handlePaySubmit} className="space-y-3.5">
              
              {/* Customer Info Fields (Name, Phone, Address) */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-2.5 text-xs">
                <div className="font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? 'بيانات العميل أو المشترِي:' : 'Customer & Delivery Information:'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                    {actionIntent === 'reserve' ? (language === 'ar' ? 'حجز موثق' : 'Verified Reserve') : (language === 'ar' ? 'شراء موثق' : 'Verified Buy')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'ar' ? 'مثال: محمد السوري' : 'e.g. Mohamad Al-Syri'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}</label>
                    <input
                      type="tel"
                      required
                      placeholder="0991234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'عنوان التسليم / المدينة' : 'Pickup / Delivery Address'}</label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ar' ? 'المحافظة - المنطقة - الشارع' : 'City, Neighborhood, Street'}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Method Specific Instructions */}

              {/* 1. Cash on Delivery */}
              {selectedMethod === 'cash' && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'ar' ? 'الدفع نقداً عند المعاينة والاستلام 💵' : 'Cash Upon Delivery / Inspection'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {language === 'ar'
                      ? 'يمكنك تثبيت الحجز أو الطلب فوراً، ويتم تسليم المبلغ نقداً للبائع عند استلام المنتَج أو معاينته يداً بيد.'
                      : 'Reserve or place order now. Payment will be made in cash directly upon receiving/inspecting the product.'}
                  </p>
                </div>
              )}

              {/* 2. Syriatel Cash */}
              {selectedMethod === 'syriatel' && (
                <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-2xl text-xs space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>{language === 'ar' ? 'رمز تاجر OMS لخدمة سيريتل كاش / شام كاش:' : 'OMS Syriatel Cash Merchant Code:'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-center font-mono font-black text-amber-400 text-base dir-ltr tracking-widest">
                    *707*1*998811#
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-bold">
                      {language === 'ar' ? 'رقم عملية التحويل أو رقم محفظتك:' : 'Transfer Tx ID or Phone Number:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0991223344 أو رقم الإشعار"
                      value={syriatelTxId}
                      onChange={(e) => setSyriatelTxId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* 3. Mastercard Form */}
              {selectedMethod === 'mastercard' && (
                <div className="space-y-2.5 bg-slate-950 p-3.5 border border-slate-800 rounded-2xl text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white">{language === 'ar' ? 'بيانات بطاقة ماستر كارد / فيزا' : 'Mastercard / Visa Details'}</span>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'اسم صاحب البطاقة' : 'Cardholder Name'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MOHAMAD AL-SYRI"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'رقم البطاقة (16 رقم)' : 'Card Number (16 Digits)'}</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="5412 8899 0011 4455"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry (MM/YY)'}</label>
                      <input
                        type="text"
                        required
                        placeholder="08/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-medium">{language === 'ar' ? 'رمز CVC' : 'CVC'}</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PayPal Form */}
              {selectedMethod === 'paypal' && (
                <div className="space-y-2 bg-blue-950/30 border border-blue-500/30 p-3.5 rounded-2xl text-xs text-center">
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-sm">
                      {language === 'ar' ? 'الدفع الآمن بواسطة PayPal Express' : 'Pay Safely with PayPal Express'}
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      {language === 'ar'
                        ? 'سيتم تحويلك بشكل آمن لتأكيد الحجز أو الشراء عبر بايبال مع حماية المشتريات.'
                        : 'Redirecting to PayPal securely to complete your purchase/reservation.'}
                    </p>
                  </div>
                </div>
              )}

              {/* 5. Klarna */}
              {selectedMethod === 'klarna' && (
                <div className="space-y-2 bg-pink-950/30 border border-pink-500/30 p-3.5 rounded-2xl text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{language === 'ar' ? 'خيارات التقسيط بـ Klarna' : 'Klarna Payment Plan'}</span>
                    <span className="text-[10px] text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">0% الفائدة</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setKlarnaPlan('pay_in_3')}
                      className={`p-2.5 rounded-xl border text-right dir-rtl cursor-pointer ${
                        klarnaPlan === 'pay_in_3' ? 'bg-pink-500/20 border-pink-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">{language === 'ar' ? 'على 3 دفعات' : 'Pay in 3'}</div>
                      <div className="text-[10px] text-slate-400">${(item.priceUSD / 3).toFixed(2)} / {language === 'ar' ? 'شهرياً' : 'monthly'}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setKlarnaPlan('pay_later')}
                      className={`p-2.5 rounded-xl border text-right dir-rtl cursor-pointer ${
                        klarnaPlan === 'pay_later' ? 'bg-pink-500/20 border-pink-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold">{language === 'ar' ? 'بعد 30 يوماً' : 'Pay in 30 days'}</div>
                      <div className="text-[10px] text-slate-400">{language === 'ar' ? 'استلم وافحص أولاً' : 'Try first'}</div>
                    </button>
                  </div>
                </div>
              )}

              {/* 6. Crypto USDT */}
              {selectedMethod === 'crypto' && (
                <div className="space-y-2 bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl text-xs">
                  <div className="font-bold text-amber-300 flex items-center justify-between">
                    <span>{language === 'ar' ? 'عنوان محفظة USDT TRC20:' : 'USDT (TRC20) Wallet:'}</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Binance Pay</span>
                  </div>
                  <div className="p-2 bg-slate-950 border border-amber-500/40 rounded-xl font-mono text-[11px] text-amber-400 break-all dir-ltr text-center">
                    {cryptoAddress}
                  </div>
                </div>
              )}

              {/* 7. Bank Transfer */}
              {selectedMethod === 'bank' && (
                <div className="space-y-2 bg-cyan-950/20 border border-cyan-500/30 p-3.5 rounded-2xl text-xs">
                  <div className="font-bold text-cyan-300">{language === 'ar' ? 'حساب المصرف التجاري السوري / الصيرفة:' : 'Syrian Commercial Bank Account:'}</div>
                  <div className="p-2 bg-slate-950 border border-cyan-500/40 rounded-xl font-mono text-[11px] text-cyan-400 text-center">
                    IBAN: SY88-0001-9988-7766-5544-OMS
                  </div>
                </div>
              )}

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-600 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>{language === 'ar' ? 'جاري تثبيت العملية عبر OMS Pay...' : 'Processing Request...'}</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {actionIntent === 'reserve'
                        ? (language === 'ar' ? `تأكيد حجز المنتج ($${item.priceUSD.toLocaleString()})` : `Confirm Reservation ($${item.priceUSD.toLocaleString()})`)
                        : (language === 'ar' ? `تأكيد الشراء المباشر ($${item.priceUSD.toLocaleString()})` : `Confirm Purchase ($${item.priceUSD.toLocaleString()})`)}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'معاملة محمية ومشفرة بضمان OMS التجاري' : 'Encrypted & Guaranteed by OMS Commerce'}</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
