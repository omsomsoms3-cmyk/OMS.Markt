import React, { useState, useEffect } from 'react';
import { TabType, CarListing } from './types';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ReportProvider } from './context/ReportContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { PermissionProvider } from './context/PermissionContext';
import { AppModeProvider, useAppMode } from './context/AppModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionConsentModal } from './components/PermissionConsentModal';
import { Navbar } from './components/Navbar';
import { CurrencyGoldTicker } from './components/CurrencyGoldTicker';
import { NetlifyEmbed } from './components/NetlifyEmbed';
import { CurrencySection } from './components/CurrencySection';
import { RealEstateSection } from './components/RealEstateSection';
import { CarsSection } from './components/CarsSection';
import { TaxiDeliverySection } from './components/TaxiDeliverySection';
import { LedgerSection } from './components/LedgerSection';
import { MessagesSection } from './components/MessagesSection';
import { JobsSection } from './components/JobsSection';
import { SavedListingsSection } from './components/SavedListingsSection';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CreateAdModal } from './components/CreateAdModal';
import { ShareAppModal } from './components/ShareAppModal';
import { AutoCleanupModal } from './components/AutoCleanupModal';
import { IntegrationsHubModal } from './components/IntegrationsHubModal';
import { GoogleAdSenseSlot } from './components/GoogleAdSenseSlot';
import { OwnerSpotlightBanner } from './components/OwnerSpotlightBanner';
import { PlayStoreBanner } from './components/PlayStoreBanner';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { FCMNotificationModal } from './components/FCMNotificationModal';
import { NotificationToast } from './components/NotificationToast';
import { AppModeModal } from './components/AppModeModal';
import { AppTourModal } from './components/AppTourModal';
import { BottomNavBar } from './components/BottomNavBar';
import { initFirebaseMessaging, setupFCMForegroundListener, subscribeToNotificationAlerts, FCMNotification } from './lib/messaging';
import { PlusCircle, Sparkles, Home, Zap } from 'lucide-react';
import { initialCarListings } from './data/mockData';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('cars');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateAdOpen, setIsCreateAdOpen] = useState(false);
  const [isShareAppOpen, setIsShareAppOpen] = useState(false);
  const [isAutoCleanupOpen, setIsAutoCleanupOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isFCMNotificationsOpen, setIsFCMNotificationsOpen] = useState(false);
  const [isAppModeModalOpen, setIsAppModeModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [notifications, setNotifications] = useState<FCMNotification[]>([]);
  const [activeToast, setActiveToast] = useState<FCMNotification | null>(null);
  const { isLoggedIn: isAuthLoggedIn, userEmail: authEmail, logout } = useAuth();
  const [isLoggedInLocal, setIsLoggedInLocal] = useState(true);
  const [currentUserEmailLocal, setCurrentUserEmailLocal] = useState('omsomsoms3@gmail.com');

  const isLoggedIn = isAuthLoggedIn || isLoggedInLocal;
  const currentUserEmail = isAuthLoggedIn ? authEmail : currentUserEmailLocal;
  const { isRtl, language, t } = useLanguage();
  const { isDark } = useTheme();
  const { appMode, toggleAppMode } = useAppMode();

  useEffect(() => {
    initFirebaseMessaging();
    setupFCMForegroundListener();

    const unsubscribe = subscribeToNotificationAlerts((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setActiveToast(newNotif);
    });

    // Automatically trigger onboarding Tour for first time visitors
    const tourCompleted = localStorage.getItem('oms_tour_completed');
    if (!tourCompleted) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1000);
      return () => {
        clearTimeout(timer);
        unsubscribe();
      };
    }

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleAddListing = (newAd: CarListing) => {
    initialCarListings.unshift(newAd);
    setActiveTab('cars');
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 flex flex-col font-sans selection:bg-emerald-600 selection:text-white pb-20 ${
        appMode === 'essential'
          ? isDark
            ? 'bg-gradient-to-b from-slate-950 via-sky-950/30 to-slate-950 text-sky-100'
            : 'bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 text-slate-900'
          : isDark
            ? 'bg-gradient-to-b from-[#022c22] via-[#091512] to-[#020617] text-slate-100'
            : 'bg-gradient-to-b from-emerald-50/60 via-slate-50 to-emerald-100/40 text-slate-900'
      } ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Offline Cache Status Banner */}
      <OfflineStatusBanner />

      {/* Top Google Play App Banner (Pro Tech Mode) */}
      {appMode === 'advanced' && <PlayStoreBanner />}

      {/* Real-time Notification Toast Alert */}
      <NotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
        onClick={() => {
          setActiveToast(null);
          setIsFCMNotificationsOpen(true);
        }}
      />

      {/* Shared Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={currentUserEmail}
        isLoggedIn={isLoggedIn}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCreateAd={() => setIsCreateAdOpen(true)}
        onOpenShare={() => setIsShareAppOpen(true)}
        onOpenNotifications={() => setIsFCMNotificationsOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        onOpenAppModeModal={() => setIsAppModeModalOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        unreadNotificationsCount={unreadCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Prominent Live Exchange & Gold Rates Ticker Bar (Slim in Easy Mode, Full in Pro Mode) */}
      {appMode === 'essential' ? (
        <CurrencyGoldTicker isSlim onNavigateToCurrency={() => setActiveTab('currency')} />
      ) : (
        (appMode === 'advanced' || activeTab === 'currency') && (
          <CurrencyGoldTicker onNavigateToCurrency={() => setActiveTab('currency')} />
        )
      )}

      {/* Easy Mode Compact & Proportionate Indicator Header */}
      {appMode === 'essential' && activeTab === 'cars' && (
        <div className="bg-slate-950/80 border-b border-sky-500/20 py-1.5 px-3 sm:px-4 backdrop-blur-xs text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0">
                {language === 'ar' ? 'نمط بسيط ⚡️' : 'Simple Mode ⚡️'}
              </span>
              <p className="text-[11px] text-slate-400 truncate">
                {language === 'ar'
                  ? 'سوق إعلانات خفيف ومباشر'
                  : 'Streamlined distraction-free marketplace'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAppModeModalOpen(true)}
                className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline font-bold cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span>{language === 'ar' ? 'تغيير النمط' : 'Change Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col pb-24 sm:pb-28">
        {/* Dedicated Non-Intrusive Google AdSense Placement */}
        {appMode === 'advanced' && activeTab !== 'embed' && (
          <div className="max-w-7xl mx-auto w-full px-4 pt-3">
            <GoogleAdSenseSlot slotId="ca-pub-9988776655443322" />
          </div>
        )}

        {/* Exclusive Owner Spotlight Banner Space (Available in both Easy & Advanced modes) */}
        {(activeTab === 'cars' || activeTab === 'realestate' || activeTab === 'jobs') && (
          <OwnerSpotlightBanner />
        )}

        {activeTab === 'embed' && <NetlifyEmbed />}
        {activeTab === 'currency' && <CurrencySection />}
        {activeTab === 'realestate' && <RealEstateSection searchQuery={searchQuery} />}
        {activeTab === 'cars' && <CarsSection searchQuery={searchQuery} />}
        {activeTab === 'jobs' && <JobsSection searchQuery={searchQuery} />}
        {activeTab === 'saved' && <SavedListingsSection />}
        {activeTab === 'taxidelivery' && <TaxiDeliverySection searchQuery={searchQuery} />}
        {activeTab === 'ledger' && <LedgerSection />}
        {activeTab === 'messages' && <MessagesSection />}
      </main>

      {/* Kleinanzeigen Style Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateAd={() => setIsCreateAdOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Create Ad Modal */}
      <CreateAdModal
        isOpen={isCreateAdOpen}
        onClose={() => setIsCreateAdOpen(false)}
        isLoggedIn={isLoggedIn}
        onOpenProfile={() => setIsProfileOpen(true)}
        onAddListing={handleAddListing}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAutoCleanup={() => setIsAutoCleanupOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Interactive Onboarding App Tour Modal */}
      <AppTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenCreateAd={() => setIsCreateAdOpen(true)}
      />

      {/* Auto Cleanup Program Modal */}
      <AutoCleanupModal
        isOpen={isAutoCleanupOpen}
        onClose={() => setIsAutoCleanupOpen(false)}
      />

      {/* Integrations & Connected Programs Hub Modal */}
      <IntegrationsHubModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
      />

      {/* User Profile & Logout Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userEmail={currentUserEmail}
        isLoggedIn={isLoggedIn}
        onLogout={async () => {
          await logout();
          setIsLoggedInLocal(false);
        }}
        onLogin={(customEmail) => {
          setIsLoggedInLocal(true);
          if (customEmail) {
            setCurrentUserEmailLocal(customEmail);
          }
        }}
      />

      {/* App Level Share Modal */}
      <ShareAppModal
        isOpen={isShareAppOpen}
        onClose={() => setIsShareAppOpen(false)}
      />

      {/* FCM Push Notification Modal */}
      <FCMNotificationModal
        isOpen={isFCMNotificationsOpen}
        onClose={() => setIsFCMNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onClearNotifications={() => setNotifications([])}
      />

      {/* Small & Proportionate App Mode Selection Window */}
      <AppModeModal
        isOpen={isAppModeModalOpen}
        onClose={() => setIsAppModeModalOpen(false)}
      />

      {/* On-Demand Permission Consent Dialog */}
      <PermissionConsentModal />

      {/* Shared Footer */}
      <footer className={`${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-md'} border-t py-3.5 px-4 text-center text-xs transition-colors`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('copyright', { year: new Date().getFullYear() })}</span>
          <div className="flex items-center space-x-4 space-x-reverse">
            <span>{t('footerSubtitle')}</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">{currentUserEmail}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ReportProvider>
              <BookmarkProvider>
                <AppModeProvider>
                  <MainAppContent />
                </AppModeProvider>
              </BookmarkProvider>
            </ReportProvider>
          </LanguageProvider>
        </ThemeProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}

