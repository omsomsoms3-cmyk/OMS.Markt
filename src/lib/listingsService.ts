import { collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { CarListing, RealEstateListing, JobListing } from '../types';
import { initialCarListings, initialRealEstateListings, initialJobListings } from '../data/mockData';
import { logUserActivity } from './activityLogs';
import { OwnerAdData } from '../components/OwnerSpotlightBanner';

const LOCAL_ADS_KEY = 'oms_user_posted_ads';
const LOCAL_REAL_ESTATE_KEY = 'oms_user_posted_real_estate';
const LOCAL_JOBS_KEY = 'oms_user_posted_jobs';
const LOCAL_OWNER_AD_KEY = 'oms_owner_exclusive_ad';

// ==================== CARS LISTINGS ====================

export async function saveListingToFirestore(listing: CarListing): Promise<void> {
  const docId = listing.id || `car-${Date.now()}`;
  const cleanListing = {
    ...JSON.parse(JSON.stringify(listing)),
    id: docId,
    createdAt: listing.createdAt || new Date().toISOString(),
    timestamp: Date.now(),
  };

  try {
    const existing = localStorage.getItem(LOCAL_ADS_KEY);
    const ads: CarListing[] = existing ? JSON.parse(existing) : [];
    const filtered = ads.filter(a => a.id !== docId);
    filtered.unshift(cleanListing);
    localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to save car listing to localStorage:', err);
  }

  logUserActivity(
    'نشر إعلان جديد',
    `تم نشر إعلان "${listing.title}" في قسم ${listing.category || 'عام'} بسعر $${listing.priceUSD}`,
    'omsomsoms3@gmail.com'
  );

  try {
    const docRef = doc(db, 'cars', docId);
    await setDoc(docRef, cleanListing);
  } catch (error) {
    console.error('Error saving car listing to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, `cars/${docId}`);
  }
}

export function subscribeToListings(
  onUpdate: (listings: CarListing[]) => void
) {
  try {
    const colRef = collection(db, 'cars');
    const q = query(colRef, limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreListings: CarListing[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CarListing, 'id'>),
        }));

        let localAds: CarListing[] = [];
        try {
          const stored = localStorage.getItem(LOCAL_ADS_KEY);
          if (stored) localAds = JSON.parse(stored);
        } catch {}

        const combinedMap = new Map<string, CarListing>();

        firestoreListings.forEach((item) => combinedMap.set(item.id || item.title, item));

        localAds.forEach((item) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            combinedMap.set(key, item);
          }
        });

        initialCarListings.forEach((item, index) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            const simulatedDate = new Date();
            simulatedDate.setHours(simulatedDate.getHours() - index * 3);
            combinedMap.set(key, {
              ...item,
              createdAt: item.createdAt || simulatedDate.toISOString(),
            });
          }
        });

        const result = Array.from(combinedMap.values());
        onUpdate(result);
      },
      (error) => {
        console.warn('Firestore cars listener warning, using fallback:', error);
        let localAds: CarListing[] = [];
        try {
          const stored = localStorage.getItem(LOCAL_ADS_KEY);
          if (stored) localAds = JSON.parse(stored);
        } catch {}

        const combinedMap = new Map<string, CarListing>();
        localAds.forEach(item => combinedMap.set(item.id || item.title, item));
        initialCarListings.forEach((item, index) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            const simulatedDate = new Date();
            simulatedDate.setHours(simulatedDate.getHours() - index * 3);
            combinedMap.set(key, { ...item, createdAt: item.createdAt || simulatedDate.toISOString() });
          }
        });

        onUpdate(Array.from(combinedMap.values()));
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to cars collection:', e);
    return () => {};
  }
}

// ==================== REAL ESTATE LISTINGS ====================

export async function saveRealEstateToFirestore(listing: RealEstateListing): Promise<void> {
  const docId = listing.id || `estate-${Date.now()}`;
  const cleanListing = {
    ...JSON.parse(JSON.stringify(listing)),
    id: docId,
    createdAt: listing.createdAt || new Date().toISOString(),
    timestamp: Date.now(),
  };

  try {
    const existing = localStorage.getItem(LOCAL_REAL_ESTATE_KEY);
    const ads: RealEstateListing[] = existing ? JSON.parse(existing) : [];
    const filtered = ads.filter(a => a.id !== docId);
    filtered.unshift(cleanListing);
    localStorage.setItem(LOCAL_REAL_ESTATE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to save real estate listing to localStorage:', err);
  }

  logUserActivity(
    'نشر عقار جديد',
    `تم نشر عقار "${listing.title}" في ${listing.city} (${listing.area}) بسعر $${listing.priceUSD}`,
    'omsomsoms3@gmail.com'
  );

  try {
    const docRef = doc(db, 'real_estate', docId);
    await setDoc(docRef, cleanListing);
  } catch (error) {
    console.error('Error saving real estate listing to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, `real_estate/${docId}`);
  }
}

export function subscribeToRealEstateListings(
  onUpdate: (listings: RealEstateListing[]) => void
) {
  try {
    const colRef = collection(db, 'real_estate');
    const q = query(colRef, limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreListings: RealEstateListing[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<RealEstateListing, 'id'>),
        }));

        let localAds: RealEstateListing[] = [];
        try {
          const stored = localStorage.getItem(LOCAL_REAL_ESTATE_KEY);
          if (stored) localAds = JSON.parse(stored);
        } catch {}

        const combinedMap = new Map<string, RealEstateListing>();

        firestoreListings.forEach((item) => combinedMap.set(item.id || item.title, item));

        localAds.forEach((item) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            combinedMap.set(key, item);
          }
        });

        initialRealEstateListings.forEach((item, index) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            const simulatedDate = new Date();
            simulatedDate.setHours(simulatedDate.getHours() - index * 4);
            combinedMap.set(key, {
              ...item,
              createdAt: item.createdAt || simulatedDate.toISOString(),
            });
          }
        });

        const result = Array.from(combinedMap.values());
        onUpdate(result);
      },
      (error) => {
        console.warn('Firestore real_estate listener warning:', error);
        let localAds: RealEstateListing[] = [];
        try {
          const stored = localStorage.getItem(LOCAL_REAL_ESTATE_KEY);
          if (stored) localAds = JSON.parse(stored);
        } catch {}

        const combinedMap = new Map<string, RealEstateListing>();
        localAds.forEach(item => combinedMap.set(item.id || item.title, item));
        initialRealEstateListings.forEach((item, index) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            const simulatedDate = new Date();
            simulatedDate.setHours(simulatedDate.getHours() - index * 4);
            combinedMap.set(key, { ...item, createdAt: item.createdAt || simulatedDate.toISOString() });
          }
        });

        onUpdate(Array.from(combinedMap.values()));
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to real_estate collection:', e);
    return () => {};
  }
}

// ==================== JOBS LISTINGS ====================

export async function saveJobToFirestore(job: JobListing): Promise<void> {
  const docId = job.id || `job-${Date.now()}`;
  const cleanJob = {
    ...JSON.parse(JSON.stringify(job)),
    id: docId,
    createdAt: job.createdAt || new Date().toISOString(),
    timestamp: Date.now(),
  };

  try {
    const existing = localStorage.getItem(LOCAL_JOBS_KEY);
    const jobs: JobListing[] = existing ? JSON.parse(existing) : [];
    const filtered = jobs.filter(j => j.id !== docId);
    filtered.unshift(cleanJob);
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to save job to localStorage:', err);
  }

  logUserActivity(
    'نشر فرصة عمل',
    `تم نشر فرصة عمل "${job.title}" لدى ${job.company} في ${job.city}`,
    'omsomsoms3@gmail.com'
  );

  try {
    const docRef = doc(db, 'jobs', docId);
    await setDoc(docRef, cleanJob);
  } catch (error) {
    console.error('Error saving job to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, `jobs/${docId}`);
  }
}

export function subscribeToJobListings(
  onUpdate: (jobs: JobListing[]) => void
) {
  try {
    const colRef = collection(db, 'jobs');
    const q = query(colRef, limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const firestoreJobs: JobListing[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<JobListing, 'id'>),
        }));

        let localJobs: JobListing[] = [];
        try {
          const stored = localStorage.getItem(LOCAL_JOBS_KEY);
          if (stored) localJobs = JSON.parse(stored);
        } catch {}

        const combinedMap = new Map<string, JobListing>();

        firestoreJobs.forEach((item) => combinedMap.set(item.id || item.title, item));

        localJobs.forEach((item) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            combinedMap.set(key, item);
          }
        });

        initialJobListings.forEach((item, index) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            const simulatedDate = new Date();
            simulatedDate.setHours(simulatedDate.getHours() - index * 5);
            combinedMap.set(key, {
              ...item,
              createdAt: item.createdAt || simulatedDate.toISOString(),
            });
          }
        });

        onUpdate(Array.from(combinedMap.values()));
      },
      (error) => {
        console.warn('Firestore jobs listener warning:', error);
        let localJobs: JobListing[] = [];
        try {
          const stored = localStorage.getItem(LOCAL_JOBS_KEY);
          if (stored) localJobs = JSON.parse(stored);
        } catch {}

        const combinedMap = new Map<string, JobListing>();
        localJobs.forEach(item => combinedMap.set(item.id || item.title, item));
        initialJobListings.forEach((item, index) => {
          const key = item.id || item.title;
          if (!combinedMap.has(key)) {
            combinedMap.set(key, item);
          }
        });

        onUpdate(Array.from(combinedMap.values()));
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to jobs collection:', e);
    return () => {};
  }
}

// ==================== OWNER SPOTLIGHT AD ====================

export async function saveOwnerAdToFirestore(ad: OwnerAdData): Promise<void> {
  const cleanAd = {
    ...JSON.parse(JSON.stringify(ad)),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCAL_OWNER_AD_KEY, JSON.stringify(cleanAd));
  } catch (err) {
    console.error('Failed to save owner ad to localStorage:', err);
  }

  logUserActivity(
    'تحديث مساحة المالك',
    `تم تحديث إعلان المالك الذهبي: "${ad.title}"`,
    'omsomsoms3@gmail.com'
  );

  try {
    const docRef = doc(db, 'owner_spotlight', 'main');
    await setDoc(docRef, cleanAd);
  } catch (error) {
    console.error('Error saving owner ad to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, 'owner_spotlight/main');
  }
}

export function subscribeToOwnerAd(
  onUpdate: (ad: OwnerAdData) => void
) {
  try {
    const docRef = doc(db, 'owner_spotlight', 'main');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as OwnerAdData;
          onUpdate(data);
          try {
            localStorage.setItem(LOCAL_OWNER_AD_KEY, JSON.stringify(data));
          } catch {}
        }
      },
      (error) => {
        console.warn('Firestore owner_spotlight listener warning:', error);
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to owner_spotlight:', e);
    return () => {};
  }
}

// ==================== DELETE LISTING ====================

export async function deleteListingFromFirestore(id: string, collectionName: 'cars' | 'real_estate' | 'jobs'): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Could not delete doc ${id} from ${collectionName}:`, err);
  }
}


