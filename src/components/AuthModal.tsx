import React, { useState } from 'react';
import { useAuth, OWNER_EMAIL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Mail, Lock, User, LogIn, AlertCircle, Sparkles, CheckCircle2, ShieldCheck, Globe, Loader2, Crown } from 'lucide-react';
import { OmsLogo } from './OmsLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const {
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    signUpWithEmail,
    loginAsGuest,
    loginAsOwner,
    authError,
    setAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setSuccessMsg(null);
    const user = await loginWithGoogle();
    setIsSubmitting(false);
    if (user) {
      setSuccessMsg(language === 'ar' ? 'تم تسجيل الدخول أونلاين بـ Google بنجاح! 🟢' : 'Logged in online with Google! 🟢');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsSubmitting(true);
    setSuccessMsg(null);
    const user = await loginWithFacebook();
    setIsSubmitting(false);
    if (user) {
      setSuccessMsg(language === 'ar' ? 'تم تسجيل الدخول أونلاين بـ Facebook بنجاح! 📘' : 'Logged in online with Facebook! 📘');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleSubmitEmailForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please fill in email and password');
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg(null);

    let user = null;
    if (mode === 'signup') {
      user = await signUpWithEmail(email.trim(), password, displayName.trim());
    } else {
      user = await loginWithEmail(email.trim(), password);
    }

    setIsSubmitting(false);

    if (user) {
      setSuccessMsg(
        mode === 'signup'
          ? (language === 'ar' ? 'تم إنشاء الحساب وربطه بالإنترنت بنجاح! 🎉' : 'Account created & connected online! 🎉')
          : (language === 'ar' ? 'تم تسجيل الدخول وتوثيق الاتصال بالإنترنت! 🟢' : 'Logged in & online auth verified! 🟢')
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    const user = await loginAsGuest();
    setIsSubmitting(false);
    if (user) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[70] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative overflow-hidden text-right dir-rtl space-y-4 max-h-[90vh] overflow-y-auto scrollbar-none my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Banner */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3.5 pt-1">
          <OmsLogo size="md" showSubtitle={false} />
          <div>
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <span>{language === 'ar' ? 'تسجيل الدخول أونلاين المباشر' : 'Live Online Login'}</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Online Auth</span>
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'ربط الحساب عبر الجيميل، فيسبوك أو البريد الإلكتروني' : 'Connect via Gmail, Facebook, or Email'}
            </p>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {authError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-tight">{authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold leading-tight">{successMsg}</span>
          </div>
        )}

        {/* Owner Quick Login & Access Area */}
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 rounded-2xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-amber-300 flex items-center gap-1.5 text-xs">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{language === 'ar' ? 'مساحة المالك الخاصة (OMS Owner)' : 'Owner Exclusive Portal'}</span>
            </span>
            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full font-mono">
              omsomsoms3@gmail.com
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {language === 'ar'
              ? 'تسجيل الدخول ببريد المالك يمنحك صلاحية فورية لتعديل مساحة المالك وإضافة الصور والفيديوهات والإعلانات مباشرة وبكل سهولة.'
              : 'Signing in with owner email grants full instant access to edit the owner spotlight, media, and ads directly.'}
          </p>
          <button
            type="button"
            onClick={async () => {
              setIsSubmitting(true);
              setSuccessMsg(null);
              const user = await loginAsOwner();
              setIsSubmitting(false);
              if (user) {
                setSuccessMsg(language === 'ar' ? 'مرحباً بمالك المنصة! تم تفعيل الصلاحيات الكاملة 👑' : 'Welcome Owner! Full permissions activated 👑');
                setTimeout(() => {
                  onClose();
                }, 1200);
              }
            }}
            disabled={isSubmitting}
            className="w-full py-2 px-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>{language === 'ar' ? 'تسجيل الدخول المباشر كمالك (omsomsoms3@gmail.com) 👑' : 'Direct Owner Sign In (omsomsoms3@gmail.com)'}</span>
          </button>
        </div>

        {/* Fast Social Login Buttons (Google / Gmail & Facebook) */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 block">
            {language === 'ar' ? 'تسجيل الدخول السريع المباشر بنقرة واحدة:' : 'One-click online sign-in:'}
          </p>

          {/* Google / Gmail Auth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-between transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{language === 'ar' ? 'التسجيل بواسطة جوجل (Gmail / Google)' : 'Continue with Google / Gmail'}</span>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
              OAuth 2.0
            </span>
          </button>

          {/* Facebook Auth Button */}
          <button
            type="button"
            onClick={handleFacebookSignIn}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl text-xs flex items-center justify-between transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-base font-black leading-none">f</span>
              <span>{language === 'ar' ? 'التسجيل بواسطة فيسبوك (Facebook)' : 'Continue with Facebook'}</span>
            </div>
            <span className="text-[10px] bg-[#1877F2]/30 text-white px-2 py-0.5 rounded-md font-mono border border-white/20">
              FB Online
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center my-2">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold">
            {language === 'ar' ? 'أو بواسطة البريد الإلكتروني' : 'or with Email'}
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmitEmailForm} className="space-y-2.5">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your name'}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 pr-9 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {language === 'ar' ? 'عنوان البريد الإلكتروني:' : 'Email Address:'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 pr-9 text-xs text-slate-100 placeholder-slate-400 focus:outline-none font-mono"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {language === 'ar' ? 'كلمة المرور:' : 'Password:'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 pr-9 text-xs text-slate-100 placeholder-slate-400 focus:outline-none font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>
              {mode === 'signup'
                ? language === 'ar'
                  ? 'إنشاء حساب جديد وربطه أونلاين'
                  : 'Create Account & Connect Online'
                : language === 'ar'
                  ? 'تسجيل الدخول بالبريد الإلكتروني'
                  : 'Sign In with Email'}
            </span>
          </button>
        </form>

        {/* Toggle Mode & Guest Access */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setAuthError(null);
            }}
            className="text-amber-400 hover:underline font-bold cursor-pointer"
          >
            {mode === 'signin'
              ? language === 'ar'
                ? 'ليس لديك حساب؟ انشئ حسابك الآن'
                : "Don't have an account? Sign Up"
              : language === 'ar'
                ? 'لديك حساب بالفعل؟ سجل دخولك'
                : 'Already registered? Sign In'}
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="text-slate-400 hover:text-slate-200 text-[11px] font-semibold cursor-pointer"
          >
            {language === 'ar' ? 'الدخول كزائر مؤقت' : 'Guest Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
