import React, { createContext, useContext, useState, useEffect } from 'react';
import { SavedListingItem } from '../types';
import { logUserActivity } from '../lib/activityLogs';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface BookmarkContextType {
  bookmarks: SavedListingItem[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (item: SavedListingItem) => void;
  removeBookmark: (id: string) => void;
  confirmBookmark: (id: string, notes?: string) => void;
  unconfirmBookmark: (id: string) => void;
  clearAllBookmarks: () => void;
  bookmarksCount: number;
  confirmedCount: number;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<SavedListingItem[]>(() => {
    try {
      const saved = localStorage.getItem('oms_saved_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse saved bookmarks from localStorage:', e);
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oms_saved_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage:', e);
    }
  }, [bookmarks]);

  // Firestore Real-time listener for Bookmarks
  useEffect(() => {
    try {
      const colRef = collection(db, 'bookmarks');
      const q = query(colRef, limit(100));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const remoteBookmarks: SavedListingItem[] = [];
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.itemData) {
              remoteBookmarks.push(data.itemData as SavedListingItem);
            } else if (data.title) {
              remoteBookmarks.push({
                id: docSnap.id,
                title: data.title,
                subtitle: data.subtitle || '',
                itemType: data.category || 'general',
                city: data.city || 'دمشق',
                phone: data.phone || '0944000000',
                priceUSD: data.priceUSD,
                priceSYP: data.priceSYP,
                image: data.image || '',
                confirmed: data.confirmed || false,
                savedAt: data.createdAt || new Date().toISOString(),
                originalData: data.originalData || {},
              });
            }
          });

          if (remoteBookmarks.length > 0) {
            setBookmarks((prev) => {
              const combinedMap = new Map<string, SavedListingItem>();
              // First add local items so local additions remain intact
              prev.forEach((item) => combinedMap.set(item.id, item));
              // Merge remote items, preferring remote if confirmed state changed remotely
              remoteBookmarks.forEach((item) => {
                const existing = combinedMap.get(item.id);
                if (existing) {
                  combinedMap.set(item.id, { ...existing, ...item });
                } else {
                  combinedMap.set(item.id, item);
                }
              });
              const updatedList = Array.from(combinedMap.values());
              try {
                localStorage.setItem('oms_saved_bookmarks', JSON.stringify(updatedList));
              } catch (e) {
                console.error('Error saving merged bookmarks to localStorage:', e);
              }
              return updatedList;
            });
          }
        },
        (err) => {
          console.warn('Firestore bookmarks listener warning:', err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error('Error setting up bookmarks subscription:', e);
    }
  }, []);

  const isBookmarked = (id: string) => {
    return bookmarks.some((b) => b.id === id);
  };

  const toggleBookmark = (item: SavedListingItem) => {
    const docId = item.id || `bm-${Date.now()}`;
    const cleanItem = { ...item, id: docId };

    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === docId);
      let updated: SavedListingItem[];
      if (exists) {
        logUserActivity('إزالة من المحفوظات', `تم إزالة "${item.title}" من قائمة الإعلانات المحفوظة`);
        try {
          deleteDoc(doc(db, 'bookmarks', docId)).catch((e) =>
            console.warn('Could not delete bookmark from Firestore:', e)
          );
        } catch {}
        updated = prev.filter((b) => b.id !== docId);
      } else {
        logUserActivity('حفظ إعلان', `تم إضافة "${item.title}" إلى المحفوظات (${item.itemType || 'إعلان'})`);
        try {
          setDoc(doc(db, 'bookmarks', docId), {
            title: item.title,
            subtitle: item.subtitle || '',
            category: item.itemType || 'general',
            priceUSD: item.priceUSD || null,
            priceSYP: item.priceSYP || null,
            confirmed: item.confirmed || false,
            userEmail: 'omsomsoms3@gmail.com',
            createdAt: new Date().toISOString(),
            itemData: cleanItem,
          }).catch((err) => {
            console.warn('Firestore bookmark save warning:', err);
            handleFirestoreError(err, OperationType.WRITE, `bookmarks/${docId}`);
          });
        } catch {}
        updated = [cleanItem, ...prev];
      }
      try {
        localStorage.setItem('oms_saved_bookmarks', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => {
      const found = prev.find((b) => b.id === id);
      if (found) {
        logUserActivity('إزالة من المحفوظات', `تم حذف "${found.title}" من القائمة`);
      }
      try {
        deleteDoc(doc(db, 'bookmarks', id)).catch((e) =>
          console.warn('Could not delete bookmark from Firestore:', e)
        );
      } catch {}
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem('oms_saved_bookmarks', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const confirmBookmark = (id: string, notes?: string) => {
    setBookmarks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          logUserActivity('تأكيد الإعلان', `تم تأكيد الإعلان المحفوظ "${item.title}"📌 ${notes ? `ملاحظة: ${notes}` : ''}`);
          const updated = {
            ...item,
            confirmed: true,
            confirmedAt: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
            confirmationNotes: notes || item.confirmationNotes || ''
          };
          try {
            setDoc(doc(db, 'bookmarks', id), {
              itemData: updated,
              confirmed: true,
              confirmedAt: updated.confirmedAt,
              confirmationNotes: updated.confirmationNotes,
            }, { merge: true }).catch(() => {});
          } catch {}
          return updated;
        }
        return item;
      })
    );
  };

  const unconfirmBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          logUserActivity('إلغاء تأكيد الإعلان', `تم إلغاء تأكيد الإعلان "${item.title}"`);
          const updated = {
            ...item,
            confirmed: false,
            confirmedAt: undefined,
            confirmationNotes: undefined
          };
          try {
            setDoc(doc(db, 'bookmarks', id), {
              itemData: updated,
              confirmed: false,
            }, { merge: true }).catch(() => {});
          } catch {}
          return updated;
        }
        return item;
      })
    );
  };

  const clearAllBookmarks = () => {
    logUserActivity('مسح جميع المحفوظات', 'تم إخلاء جميع الإعلانات المحفوظة');
    bookmarks.forEach((b) => {
      try {
        deleteDoc(doc(db, 'bookmarks', b.id)).catch(() => {});
      } catch {}
    });
    try {
      localStorage.removeItem('oms_saved_bookmarks');
    } catch (e) {}
    setBookmarks([]);
  };

  const confirmedCount = bookmarks.filter((b) => b.confirmed).length;

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        confirmBookmark,
        unconfirmBookmark,
        clearAllBookmarks,
        bookmarksCount: bookmarks.length,
        confirmedCount,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
