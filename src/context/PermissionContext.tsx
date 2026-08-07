import React, { createContext, useContext, useState } from 'react';

export type PermissionType = 'microphone' | 'studio' | 'video_download';

interface PermissionDetails {
  titleAr: string;
  titleEn: string;
  icon: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
}

export const PERMISSION_METADATA: Record<PermissionType, PermissionDetails> = {
  microphone: {
    titleAr: 'إذن استخدام الميكروفون والمسجل الصوتي 🎙️',
    titleEn: 'Microphone & Audio Recorder Permission 🎙️',
    icon: '🎙️',
    badgeAr: 'تسجيل الصوت',
    badgeEn: 'Audio Recording',
    descAr: 'يحتاج تطبيق OMS إلى إذنيك لاستخدام الميكروفون حتى تتمكن من تسجيل وإرسال الرسائل الصوتية مباشرة في المحادثات والطلبات.',
    descEn: 'OMS needs your permission to access the microphone so you can record and send audio messages in chats and requests.',
  },
  studio: {
    titleAr: 'إذن الوصول إلى الاستوديو ومعرض الصور 🖼️',
    titleEn: 'Photo Gallery & Studio Access Permission 🖼️',
    icon: '🖼️',
    badgeAr: 'الوصول للصور',
    badgeEn: 'Gallery Access',
    descAr: 'يحتاج تطبيق OMS إلى إذن الوصول إلى ألبوم الصور والاستوديو لتتمكن من اختيار ورفع صور وفيديوهات الإعلانات والمنتجات.',
    descEn: 'OMS needs permission to access your photo gallery so you can choose and upload photos and videos for your listings.',
  },
  video_download: {
    titleAr: 'إذن تنزيل وحفظ الفيديوهات والوسائط 🎥',
    titleEn: 'Video Download & Media Saving Permission 🎥',
    icon: '🎥',
    badgeAr: 'تنزيل الفيديوهات',
    badgeEn: 'Video Download',
    descAr: 'يحتاج تطبيق OMS إلى إذن تنزيل وتخزين الفيديوهات بحجم كامل في جهازك لتتمكن من مشاهدتها لاحقاً بدون إنترنت.',
    descEn: 'OMS needs permission to save and download full videos to your device storage for offline viewing.',
  },
};

interface PermissionContextType {
  permissions: Record<PermissionType, boolean>;
  requestPermission: (type: PermissionType, onGranted: () => void) => void;
  revokePermission: (type: PermissionType) => void;
  grantPermission: (type: PermissionType) => void;
  activePermissionRequest: PermissionType | null;
  closeConsentModal: () => void;
  confirmConsent: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<Record<PermissionType, boolean>>({
    microphone: false,
    studio: false,
    video_download: false,
  });

  const [activePermissionRequest, setActivePermissionRequest] = useState<PermissionType | null>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const requestPermission = (type: PermissionType, onGranted: () => void) => {
    // Check if already granted
    if (permissions[type]) {
      onGranted();
      return;
    }

    // Otherwise, show custom on-demand permission prompt dialog
    setActivePermissionRequest(type);
    setPendingCallback(() => onGranted);
  };

  const confirmConsent = () => {
    if (activePermissionRequest) {
      setPermissions((prev) => ({ ...prev, [activePermissionRequest]: true }));
      if (pendingCallback) {
        pendingCallback();
      }
    }
    setActivePermissionRequest(null);
    setPendingCallback(null);
  };

  const closeConsentModal = () => {
    setActivePermissionRequest(null);
    setPendingCallback(null);
  };

  const revokePermission = (type: PermissionType) => {
    setPermissions((prev) => ({ ...prev, [type]: false }));
  };

  const grantPermission = (type: PermissionType) => {
    setPermissions((prev) => ({ ...prev, [type]: true }));
  };

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        requestPermission,
        revokePermission,
        grantPermission,
        activePermissionRequest,
        closeConsentModal,
        confirmConsent,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
