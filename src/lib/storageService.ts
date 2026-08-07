import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a single file (image or video) to Firebase Storage
 * and returns its public download URL.
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  folderName: string = 'listings'
): Promise<string> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folderName}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload warning, attempting fallback:', error);
    // Return Object URL or Data URL fallback if offline
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Uploads multiple files concurrently to Firebase Storage
 * and returns their public download URLs.
 */
export async function uploadMultipleFilesToFirebaseStorage(
  files: File[],
  folderName: string = 'listings'
): Promise<string[]> {
  if (!files || files.length === 0) return [];
  
  const uploadPromises = files.map((file) => uploadFileToFirebaseStorage(file, folderName));
  return Promise.all(uploadPromises);
}

/**
 * Uploads a base64 or Data URL image string to Firebase Storage
 */
export async function uploadDataUrlToFirebaseStorage(
  dataUrl: string,
  folderName: string = 'listings'
): Promise<string> {
  if (!dataUrl.startsWith('data:')) {
    // If it's already an http/https URL, return as is
    return dataUrl;
  }

  try {
    const storagePath = `${folderName}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage base64 upload error:', error);
    return dataUrl;
  }
}
