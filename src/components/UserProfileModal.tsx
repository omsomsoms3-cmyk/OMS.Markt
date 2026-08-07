import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User, X, LogOut, ShieldCheck, Mail, MapPin, Award, Calendar, CheckCircle2, LogIn, Share2, Copy, Check, CreditCard, Sparkles, Lock, Globe, Camera } from 'lucide-react';
import { OmsLogo } from './OmsLogo';
import { PaymentModal, PaymentItemDetails } from './PaymentModal';
import { FacebookAuthModal } from './FacebookAuthModal';
import { UserActivityLogSection } from './UserActivityLogSection';
import { AuthModal } from './AuthModal';
import { CameraAvatarModal } from './CameraAvatarModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogin?: (customEmail?: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const {
    currentUser,
    isLoggedIn,
    userEmail,
    displayName,
    photoURL,
    authProvider,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    updateUserPhoto,
  } = useAuth();

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFacebookAuthOpen, setIsFacebookAuthOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const vipPaymentItem: PaymentItemDetails = {
    id: 'vip-sub',
    title: language === 'ar' ? 'ترقية العضوية OMS VIP (شهري)' : 'OMS VIP Subscription (Monthly)',
    priceUSD: 15,
    priceSYP: 225000,
    type: 'vip_ad',
  };

  if (!isOpen) return null;

  const publicAppUrl = 'https://ais-pre-3s2u2366exahnrl4g3ehii-473104198394.europe-west3.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLogoutClick = () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = async () => {
    setShowConfirmLogout(false);
    await logout();
  };

  const handleFacebookAuthSuccess = async (data: { name: string; email: string; avatar: string }) => {
    await loginWithFacebook(data.email);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-5 relative overflow-hidden my-auto max-h-[92vh] overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 space-x-reverse border-b border-slate-200 dark:border-slate-800 pb-4">
          <OmsLogo size="lg" showSubtitle={false} />
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('userProfile')}</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                OMS VIP
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('userProfileTitle')}</p>
          </div>
        </div>

        {isLoggedIn ? (
          <>
            {/* User Details Grid */}
            <div className="space-y-3">
              {/* Profile Card */}
              <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
                {/* Connected Online Status Banner with Interactive Camera Avatar */}
                <div className="bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* User Profile Avatar with Camera Overlay Button */}
                    <button
                      onClick={() => setIsCameraModalOpen(true)}
                      title={language === 'ar' ? 'انقر لالتقاط صورة شخصية بالكاميرا 📷' : 'Click to take a photo with camera 📷'}
                      className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500 flex items-center justify-center font-bold text-slate-800 dark:text-white relative group cursor-pointer shrink-0 shadow-sm active:scale-95 transition-all"
                    >
                      {photoURL ? (
                        <img src={photoURL} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : authProvider === 'facebook' ? (
                        <span className="text-[#1877F2] font-black text-lg">f</span>
                      ) : authProvider === 'google' ? (
                        <span className="text-amber-500 font-black text-sm">G</span>
                      ) : (
                        <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      
                      {/* Camera Badge Icon */}
                      <span className="absolute -bottom-1 -right-1 bg-amber-400 hover:bg-amber-300 text-slate-950 p-1 rounded-full border border-white dark:border-slate-900 shadow-sm transition-transform group-hover:scale-110">
                        <Camera className="w-3 h-3" />
                      </span>
                    </button>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {displayName || (language === 'ar' ? 'أحمد الشامي' : 'Ahmad Al-Shami')}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span>
                          {authProvider === 'facebook'
                            ? (language === 'ar' ? 'مرتبط أونلاين عبر فيسبوك 📘' : 'Connected via Facebook 📘')
                            : authProvider === 'google'
                              ? (language === 'ar' ? 'مرتبط أونلاين عبر Google 🔴' : 'Connected via Google 🔴')
                              : (language === 'ar' ? 'مرتبط أونلاين بالإنترنت 🟢' : 'Online Connected 🟢')}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <button
                      onClick={() => setIsCameraModalOpen(true)}
                      className="text-[10px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Camera className="w-3 h-3 text-amber-500" />
                      <span>{language === 'ar' ? 'تغير الصورة 📷' : 'Camera 📷'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span>{t('accountEmail')}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">{userEmail}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{t('status')}</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('statusActive')}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{t('userRole')}</span>
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{t('userRoleValue')}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{t('location')}</span>
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{t('locationValue')}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{t('joinDate')}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">2024 / 01</span>
                </div>
              </div>

              {/* Firestore Real-Time User Activity Logs */}
              <UserActivityLogSection />

              {/* VIP Subscription & Payment Methods Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 dark:from-amber-950/70 dark:via-slate-900 dark:to-emerald-950/70 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{language === 'ar' ? 'اشتراك OMS VIP والدفع الإلكتروني' : 'OMS VIP & Online Payments'}</span>
                  </span>
                  <span className="text-[10px] bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    Mastercard • PayPal • Klarna
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? 'احصل على تمييز إعلاناتك، توثيق الحساب بالشارة الذهبية، وخيارات الدفع الآمنة ببطاقات ماستر كارد، بايبال، كلارنا وسيريتل كاش.'
                    : 'Upgrade for featured listings, golden badge, and secure payment options via Mastercard, PayPal, Klarna & Syriatel Cash.'}
                </p>
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{language === 'ar' ? 'دفع الاشتراك أو التجديد الإلكتروني ($15)' : 'Pay / Renew VIP Online ($15)'}</span>
                </button>
              </div>

              {/* Public App Share Box */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/60 dark:to-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-emerald-500" />
                    <span>{t('shareTitle')}</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    PUBLIC
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('publicLink')}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicAppUrl}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? t('linkCopied') : t('copyLink')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Logout Action Area */}
            {showConfirmLogout ? (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl space-y-3 animate-in fade-in duration-150">
                <p className="text-xs text-red-300 font-medium text-center">
                  {t('logoutConfirm')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={confirmLogout}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs transition-colors"
                  >
                    {t('logout')}
                  </button>
                  <button
                    onClick={() => setShowConfirmLogout(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs transition-colors"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogoutClick}
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            )}
          </>
        ) : (
          /* Logged Out View - Social & Online Auth Options */
          <div className="py-4 text-center space-y-4 dir-rtl">
            <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
              <User className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                {language === 'ar' ? 'تسجيل الدخول وربط الحساب أونلاين' : 'Online Account Sign In'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'سجل دخولك الآن عبر Google أو فيسبوك أو البريد الإلكتروني لتبقى مرتبطاً بالإنترنت دائماً'
                  : 'Sign in with Google, Facebook, or Email to stay connected online'}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Google Login Option */}
              <button
                type="button"
                onClick={() => {
                  loginWithGoogle();
                }}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>{language === 'ar' ? 'التسجيل بواسطة جوجل (Gmail)' : 'Continue with Google / Gmail'}</span>
              </button>

              {/* Facebook Login Option */}
              <button
                type="button"
                onClick={() => setIsFacebookAuthOpen(true)}
                className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#1877F2]/25 active:scale-95 cursor-pointer"
              >
                <span className="font-mono text-lg font-black leading-none">f</span>
                <span>{language === 'ar' ? 'التسجيل بواسطة فيسبوك (Facebook)' : 'Continue with Facebook'}</span>
              </button>

              {/* Email Login Option */}
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'ar' ? 'التسجيل بالبريد الإلكتروني أونلاين' : 'Sign In with Email Online'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        item={vipPaymentItem}
      />

      {/* Facebook Authentication Modal */}
      <FacebookAuthModal
        isOpen={isFacebookAuthOpen}
        onClose={() => setIsFacebookAuthOpen(false)}
        onSuccess={handleFacebookAuthSuccess}
      />

      {/* Online Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile / Device Camera Avatar Capture Modal */}
      <CameraAvatarModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onSaveAvatar={updateUserPhoto}
        currentPhotoURL={photoURL}
      />
    </div>
  );
};
