import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface UserActivityLog {
  id?: string;
  action: string;
  details: string;
  userEmail: string;
  createdAt: string;
  timestamp?: number;
}

const LOCAL_LOGS_KEY = 'oms_user_activity_logs';

export async function logUserActivity(
  action: string,
  details: string,
  userEmail: string = 'omsomsoms3@gmail.com'
): Promise<void> {
  const logEntry: UserActivityLog = {
    action,
    details,
    userEmail,
    createdAt: new Date().toLocaleString('ar-SY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    timestamp: Date.now(),
  };

  // Save to localStorage
  try {
    const existing = localStorage.getItem(LOCAL_LOGS_KEY);
    const logsArr: UserActivityLog[] = existing ? JSON.parse(existing) : [];
    logsArr.unshift(logEntry);
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logsArr.slice(0, 100)));
  } catch (err) {
    console.error('Failed to save activity log to localStorage:', err);
  }

  // Save to Firebase Firestore
  try {
    const colRef = collection(db, 'activity_logs');
    await addDoc(colRef, logEntry);
  } catch (error) {
    console.warn('Firestore activity log save warning:', error);
  }
}

export function subscribeToActivityLogs(
  onUpdate: (logs: UserActivityLog[]) => void
) {
  const path = 'activity_logs';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));

    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreLogs: UserActivityLog[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<UserActivityLog, 'id'>),
        }));

        // Merge with localStorage logs for offline resiliency
        try {
          const stored = localStorage.getItem(LOCAL_LOGS_KEY);
          const localLogs: UserActivityLog[] = stored ? JSON.parse(stored) : [];
          const combined = [...firestoreLogs];
          
          localLogs.forEach((local) => {
            if (!combined.some((f) => f.action === local.action && f.createdAt === local.createdAt)) {
              combined.push(local);
            }
          });

          combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          onUpdate(combined);
        } catch {
          onUpdate(firestoreLogs);
        }
      },
      (error) => {
        console.error('Activity logs subscription error:', error);
        // Fallback to local storage if Firestore error
        try {
          const stored = localStorage.getItem(LOCAL_LOGS_KEY);
          if (stored) {
            onUpdate(JSON.parse(stored));
          }
        } catch {}
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to activity logs:', e);
    return () => {};
  }
}
