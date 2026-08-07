import React, { createContext, useContext, useState, useEffect } from 'react';
import { PostReport, ReportReason, AutoAlert } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logUserActivity } from '../lib/activityLogs';

interface ReportContextType {
  reports: PostReport[];
  autoAlerts: AutoAlert[];
  deletedPostIds: string[];
  addReport: (data: Omit<PostReport, 'id' | 'createdAt' | 'status'>) => void;
  updateReportStatus: (id: string, status: PostReport['status']) => void;
  deleteReport: (id: string) => void;
  clearAllReports: () => void;
  deletePostManually: (postId: string) => void;
  purgePostsBatch: (postIds: string[]) => void;
  isPostDeleted: (postId: string) => boolean;
  clearAlert: (alertId: string) => void;
  unreadCount: number;
  alertCount: number;
}

const STORAGE_KEY_REPORTS = 'oms_platform_reports_v2';
const STORAGE_KEY_DELETED = 'oms_platform_deleted_posts_v2';
const STORAGE_KEY_ALERTS = 'oms_platform_auto_alerts_v2';

const initialReports: PostReport[] = [
  {
    id: 'rep-1',
    postId: 'car-2',
    postTitle: 'مرسيدس E200 موديل 2018 خالية العلام',
    postCategory: 'سيارات وسوق',
    reason: 'wrong_price',
    reasonText: 'السعر المذكور غير دقيق في السوق المحلي برجاء التدقيق',
    reporterName: 'سامر طه',
    reporterPhone: '0933112233',
    createdAt: 'منذ ساعتين',
    status: 'pending'
  },
  {
    id: 'rep-2',
    postId: 'estate-3',
    postTitle: 'شقة مفروشة للايجار في الشعلان',
    postCategory: 'عقارات',
    reason: 'scam',
    reasonText: 'رقم التلفون لا يقبل الاتصال والإعلان يبدو غير حقيقي',
    reporterName: 'أحمد علي',
    reporterPhone: '0944556677',
    createdAt: 'منذ 5 ساعات',
    status: 'pending'
  }
];

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<PostReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      return saved ? JSON.parse(saved) : initialReports;
    } catch {
      return initialReports;
    }
  });

  const [deletedPostIds, setDeletedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DELETED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [autoAlerts, setAutoAlerts] = useState<AutoAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALERTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports', e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deletedPostIds));
    } catch (e) {
      console.error('Failed to save deleted post IDs', e);
    }
  }, [deletedPostIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(autoAlerts));
    } catch (e) {
      console.error('Failed to save auto alerts', e);
    }
  }, [autoAlerts]);

  const addReport = (data: Omit<PostReport, 'id' | 'createdAt' | 'status'>) => {
    const newReport: PostReport = {
      ...data,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: 'الآن',
      status: 'pending'
    };

    // Calculate total reports for this specific postId (existing + 1)
    const currentPostReports = reports.filter((r) => r.postId === data.postId);
    const totalCount = currentPostReports.length + 1;

    setReports((prev) => [newReport, ...prev]);

    // Save to Firestore & Activity Log
    logUserActivity('إبلاغ عن إعلان', `تم البلاغ عن إعلان "${data.postTitle}" بسبب: ${data.reasonText || data.reason}`);
    try {
      addDoc(collection(db, 'reports'), {
        targetTitle: data.postTitle || 'إعلان',
        reason: data.reasonText || data.reason,
        reporterPhone: data.reporterPhone || '0944000000',
        createdAt: new Date().toISOString(),
      }).catch((err) => console.warn('Firestore report save warning:', err));
    } catch {}

    // Check if total reports reached 5 or more
    if (totalCount >= 5) {
      // Auto-delete post if not already in deleted list
      setDeletedPostIds((prev) => {
        if (!prev.includes(data.postId)) {
          return [...prev, data.postId];
        }
        return prev;
      });

      // Trigger instant Admin Alert Notification
      setAutoAlerts((prev) => [
        {
          id: `alert-${Date.now()}`,
          postId: data.postId,
          postTitle: data.postTitle,
          postCategory: data.postCategory,
          reportCount: totalCount,
          timestamp: 'الآن',
          read: false
        },
        ...prev
      ]);
    }
  };

  const updateReportStatus = (id: string, status: PostReport['status']) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAllReports = () => {
    setReports([]);
  };

  const deletePostManually = (postId: string) => {
    setDeletedPostIds((prev) => (prev.includes(postId) ? prev : [...prev, postId]));
  };

  const purgePostsBatch = (postIdsToPurge: string[]) => {
    setDeletedPostIds((prev) => {
      const newSet = new Set([...prev, ...postIdsToPurge]);
      return Array.from(newSet);
    });
  };

  const isPostDeleted = (postId: string) => {
    return deletedPostIds.includes(postId);
  };

  const clearAlert = (alertId: string) => {
    setAutoAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const unreadCount = reports.filter((r) => r.status === 'pending').length;
  const alertCount = autoAlerts.filter((a) => !a.read).length;

  return (
    <ReportContext.Provider
      value={{
        reports,
        autoAlerts,
        deletedPostIds,
        addReport,
        updateReportStatus,
        deleteReport,
        clearAllReports,
        deletePostManually,
        purgePostsBatch,
        isPostDeleted,
        clearAlert,
        unreadCount,
        alertCount
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};
