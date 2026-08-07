// Service Worker Registration and Offline Status Monitor

export interface SWRegistrationStatus {
  isRegistered: boolean;
  isOffline: boolean;
}

type SWStatusListener = (status: { isOffline: boolean }) => void;
const listeners: SWStatusListener[] = [];

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });

    // Network status listeners
    window.addEventListener('online', () => {
      listeners.forEach((cb) => cb({ isOffline: false }));
    });

    window.addEventListener('offline', () => {
      listeners.forEach((cb) => cb({ isOffline: true }));
    });
  }
}

export function subscribeNetworkStatus(callback: SWStatusListener) {
  listeners.push(callback);
  // Trigger initial state
  callback({ isOffline: typeof navigator !== 'undefined' && !navigator.onLine });
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}
