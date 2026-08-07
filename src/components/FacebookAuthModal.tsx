import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Lock, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FacebookAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string; email: string; avatar: string }) => void;
}

export const FacebookAuthModal: React.FC<FacebookAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<'default' | 'custom'>('default');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleFacebookLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const emailToUse = selectedAccount === 'custom' && customEmail.trim()
        ? customEmail
        : 'fb.user.oms@facebook.com';

      onSuccess({
        name: language === 'ar' ? 'أحمد الشامي (فيسبوك)' : 'Ahmad Al-Shami (FB)',
        email: emailToUse,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-[#1877F2]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-5 text-right dir-rtl">
        {/* Top Facebook Blue Header Bar */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#1877F2]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Facebook Branding Header */}
        <div className="flex items-center gap-3 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#1877F2] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#1877F2]/30 shrink-0">
            f
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{language === 'ar' ? 'التسجيل بواسطة فيسبوك' : 'Login with Facebook'}</span>
              <span className="bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                OAuth 2.0
              </span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ar' ? 'اتصال آمن ومشفّر مع منصة OMS' : 'Secure encrypted OAuth connection'}</span>
            </p>
          </div>
        </div>

        {/* App Authorization Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs text-slate-300 font-bold">
              {language === 'ar' ? 'التطبيق المستلم:' : 'Receiving App:'}
            </span>
            <span className="text-xs font-black text-amber-400">OMS Syrian Markets</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 block font-bold">
              {language === 'ar' ? 'الأذونات المطلوبة من حسابك:' : 'Requested Permissions:'}
            </span>
            <ul className="text-xs text-slate-300 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'ar' ? 'الاسم والصورة الشخصية (Public Profile)' : 'Public Profile (Name & Photo)'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{language === 'ar' ? 'عنوان البريد الإلكتروني (Email Address)' : 'Email Address'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* User Choice Card */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            {language === 'ar' ? 'اختر حساب فيسبوك للمتابعة:' : 'Select Facebook Account:'}
          </label>

          <div
            onClick={() => setSelectedAccount('default')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedAccount === 'default'
                ? 'bg-[#1877F2]/10 border-[#1877F2] text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 flex items-center justify-center font-bold text-[#1877F2]">
                أ
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">
                  {language === 'ar' ? 'أحمد الشامي' : 'Ahmad Al-Shami'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">fb.user.oms@facebook.com</p>
              </div>
            </div>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedAccount === 'default'
                  ? 'border-[#1877F2] bg-[#1877F2]'
                  : 'border-slate-600'
              }`}
            >
              {selectedAccount === 'default' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>

          <div
            onClick={() => setSelectedAccount('custom')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-2 ${
              selectedAccount === 'custom'
                ? 'bg-[#1877F2]/10 border-[#1877F2] text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">
                {language === 'ar' ? 'استخدام حساب فيسبوك آخر' : 'Use another Facebook account'}
              </span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedAccount === 'custom'
                    ? 'border-[#1877F2] bg-[#1877F2]'
                    : 'border-slate-600'
                }`}
              >
                {selectedAccount === 'custom' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>
            {selectedAccount === 'custom' && (
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل إيميل أو رقم فيسبوك...' : 'Enter FB email or phone...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#1877F2] dir-ltr text-left"
              />
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleFacebookLogin}
          className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#1877F2]/30 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="font-mono font-bold text-lg">f</span>
              <span>
                {language === 'ar'
                  ? 'متابعة بصفة (أحمد) وتوثيق الحساب'
                  : 'Continue as Ahmad & Verify Account'}
              </span>
            </>
          )}
        </button>

        {/* Disclaimer Notice */}
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          {language === 'ar'
            ? 'بالنقر على متابعة، أنت توافق على ربط حساب فيسبوك الخاص بك مع منصة OMS وشروط الاستخدام والخصوصية.'
            : 'By continuing, you agree to connect your Facebook profile with OMS terms & privacy policy.'}
        </p>
      </div>
    </div>
  );
};
