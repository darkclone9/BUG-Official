/**
 * Firebase Storage Helper Functions
 * 
 * This module provides helper functions for uploading, retrieving, and managing
 * images in Firebase Storage. Images are organized by category for better management.
 * 
 * Categories:
 * - user-avatars: User profile pictures
 * - tournament-images: Tournament banners and images
 * - product-images: Shop product images
 * - event-images: Event banners and images
 * - announcement-images: Announcement images
 * - general: Miscellaneous images
 */

import { storage } from './firebase';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  UploadMetadata,
  UploadTask,
} from 'firebase/storage';

// ============================================
// TYPES
// ============================================

export type ImageCategory =
  | 'user-avatars'
  | 'tournament-images'
  | 'product-images'
  | 'event-images'
  | 'announcement-images'
  | 'general';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
}

export interface UploadOptions {
  category: ImageCategory;
  fileName?: string; // Optional custom filename (will be sanitized)
  metadata?: UploadMetadata;
  onProgress?: (progress: UploadProgress) => void;
}

export interface ImageInfo {
  url: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sanitize filename to remove special characters and spaces
 */
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};

/**
 * Generate a unique filename with timestamp
 */
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = sanitizeFileName(nameWithoutExt);
  return `${sanitizedName}_${timestamp}.${extension}`;
};

/**
 * Get the storage path for a category and filename
 */
const getStoragePath = (category: ImageCategory, fileName: string): string => {
  return `${category}/${fileName}`;
};

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload an image file to Firebase Storage
 * 
 * @param file - The image file to upload
 * @param options - Upload options including category, filename, and progress callback
 * @returns Promise with the download URL of the uploaded image
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const url = await uploadImage(file, {
 *   category: 'user-avatars',
 *   fileName: 'profile.jpg',
 *   onProgress: (progress) => console.log(`${progress.progress}%`)
 * });
 * ```
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions
): Promise<string> => {
  const { category, fileName, metadata, onProgress } = options;

  // Generate filename
  const finalFileName = fileName
    ? generateUniqueFileName(fileName)
    : generateUniqueFileName(file.name);

  // Create storage reference
  const storagePath = getStoragePath(category, finalFileName);
  const storageRef = ref(storage, storagePath);

  // Prepare metadata
  const uploadMetadata: UploadMetadata = {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      category,
      ...metadata?.customMetadata,
    },
  };

  // Upload with progress tracking if callback provided
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const uploadTask: UploadTask = uploadBytesResumable(
        storageRef,
        file,
        uploadMetadata
      );

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            ),
          };
          onProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } else {
    // Simple upload without progress tracking
    const snapshot = await uploadBytes(storageRef, file, uploadMetadata);
    return await getDownloadURL(snapshot.ref);
  }
};

/**
 * Upload multiple images at once
 * 
 * @param files - Array of image files to upload
 * @param options - Upload options (same category for all files)
 * @returns Promise with array of download URLs
 */
export const uploadMultipleImages = async (
  files: File[],
  options: Omit<UploadOptions, 'fileName'>
): Promise<string[]> => {
  const uploadPromises = files.map((file) =>
    uploadImage(file, { ...options, fileName: file.name })
  );
  return await Promise.all(uploadPromises);
};

// ============================================
// RETRIEVE FUNCTIONS
// ============================================

/**
 * Get the download URL for an image by its path
 * 
 * @param path - The storage path of the image (e.g., 'user-avatars/profile_123.jpg')
 * @returns Promise with the download URL
 */
export const getImageURL = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};

/**
 * Get detailed information about an image
 * 
 * @param path - The storage path of the image
 * @returns Promise with image information
 */
export const getImageInfo = async (path: string): Promise<ImageInfo> => {
  const storageRef = ref(storage, path);
  const metadata = await getMetadata(storageRef);
  const url = await getDownloadURL(storageRef);

  return {
    url,
    path,
    name: metadata.name,
    size: metadata.size,
    contentType: metadata.contentType || 'unknown',
    createdAt: metadata.timeCreated,
    updatedAt: metadata.updated,
  };
};

/**
 * List all images in a category
 * 
 * @param category - The image category to list
 * @returns Promise with array of image information
 */
export const listImagesInCategory = async (
  category: ImageCategory
): Promise<ImageInfo[]> => {
  const categoryRef = ref(storage, category);
  const result = await listAll(categoryRef);

  const imageInfoPromises = result.items.map(async (itemRef) => {
    const metadata = await getMetadata(itemRef);
    const url = await getDownloadURL(itemRef);

    return {
      url,
      path: itemRef.fullPath,
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType || 'unknown',
      createdAt: metadata.timeCreated,
      updatedAt: metadata.updated,
    };
  });

  return await Promise.all(imageInfoPromises);
};

// ============================================
// DELETE FUNCTIONS
// ============================================

/**
 * Delete an image from Firebase Storage
 * 
 * @param path - The storage path of the image to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteImage = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

/**
 * Delete an image by its download URL
 * 
 * @param url - The download URL of the image
 * @returns Promise that resolves when deletion is complete
 */
export const deleteImageByURL = async (url: string): Promise<void> => {
  // Extract path from URL
  // Firebase Storage URLs have format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?...
  const urlObj = new URL(url);
  const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
  
  if (!pathMatch) {
    throw new Error('Invalid Firebase Storage URL');
  }

  const path = decodeURIComponent(pathMatch[1]);
  await deleteImage(path);
};

/**
 * Delete all images in a category
 * 
 * @param category - The category to clear
 * @returns Promise that resolves when all deletions are complete
 */
export const deleteAllImagesInCategory = async (
  category: ImageCategory
): Promise<void> => {
  const categoryRef = ref(storage, category);
  const result = await listAll(categoryRef);

  const deletePromises = result.items.map((itemRef) => deleteObject(itemRef));
  await Promise.all(deletePromises);
};

// ============================================
// UPDATE FUNCTIONS
// ============================================

/**
 * Update metadata for an image
 * 
 * @param path - The storage path of the image
 * @param metadata - New metadata to set
 * @returns Promise that resolves when update is complete
 */
export const updateImageMetadata = async (
  path: string,
  metadata: UploadMetadata
): Promise<void> => {
  const storageRef = ref(storage, path);
  await updateMetadata(storageRef, metadata);
};

