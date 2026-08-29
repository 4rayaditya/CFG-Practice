import { get, set, del, keys } from 'idb-keyval';

export interface AudioUploadMetadata {
  title?: string;
  category?: string;
  tags?: string[];
  urgency?: 'Standard' | 'Urgent';
  studentId?: string;
  fileName?: string;
  durationSeconds?: number;
  recordedAt?: string;
}

export interface QueuedAudioUpload {
  id: string;
  timestamp: number;
  fileName: string;
  mimeType: string;
  durationSeconds: number;
  audioBase64: string; // Serialized Base64 string to avoid WebM Blob corruption in IndexedDB
  metadata: AudioUploadMetadata;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  lastError?: string;
}

const QUEUE_PREFIX = 'mm_offline_audio_';

/**
 * Helper: Converts a Blob to a Base64 string for safe IndexedDB storage.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip data URL prefix to get raw base64 (e.g. data:audio/webm;base64,xxxx -> xxxx)
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper: Converts a Base64 string back into a valid Blob & File.
 */
export function base64ToBlob(base64: string, mimeType = 'audio/webm'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray.buffer as ArrayBuffer], { type: mimeType });
}

/**
 * Helper: Reconstructs a full File object ready for FormData multipart uploads.
 */
export function deserializeAudioUpload(queued: QueuedAudioUpload): {
  blob: Blob;
  file: File;
  metadata: AudioUploadMetadata;
} {
  const blob = base64ToBlob(queued.audioBase64, queued.mimeType || 'audio/webm');
  const file = new File([blob], queued.fileName || `offline_audio_${queued.id}.webm`, {
    type: queued.mimeType || 'audio/webm',
    lastModified: queued.timestamp,
  });
  return {
    blob,
    file,
    metadata: queued.metadata,
  };
}

/**
 * Saves a failed or offline audio recording into IndexedDB.
 */
export async function saveFailedAudioUpload(
  blob: Blob,
  metadata: AudioUploadMetadata = {}
): Promise<QueuedAudioUpload> {
  const id = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const audioBase64 = await blobToBase64(blob);

  const queuedItem: QueuedAudioUpload = {
    id,
    timestamp: Date.now(),
    fileName: metadata.fileName || `voice_doubt_${Date.now()}.webm`,
    mimeType: blob.type || 'audio/webm',
    durationSeconds: metadata.durationSeconds || 0,
    audioBase64,
    metadata: {
      ...metadata,
      recordedAt: metadata.recordedAt || new Date().toISOString(),
    },
    retryCount: 0,
    status: 'pending',
  };

  await set(`${QUEUE_PREFIX}${id}`, queuedItem);
  
  // Dispatch custom event for UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mm_offline_queue_updated', { detail: { countChange: 1 } }));
  }

  return queuedItem;
}

/**
 * Retrieves all pending offline audio uploads from IndexedDB, ordered by timestamp ascending.
 */
export async function getPendingUploads(): Promise<QueuedAudioUpload[]> {
  try {
    const allKeys = await keys();
    const queueKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(QUEUE_PREFIX));
    
    const items: QueuedAudioUpload[] = [];
    for (const key of queueKeys) {
      const item = await get<QueuedAudioUpload>(key);
      if (item && item.id) {
        items.push(item);
      }
    }

    return items.sort((a, b) => a.timestamp - b.timestamp);
  } catch (err) {
    console.error('[IndexedDB] Failed to get pending uploads:', err);
    return [];
  }
}

/**
 * Removes an uploaded audio record from IndexedDB once successfully synced.
 */
export async function removeUpload(id: string): Promise<void> {
  try {
    await del(`${QUEUE_PREFIX}${id}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mm_offline_queue_updated', { detail: { countChange: -1 } }));
    }
  } catch (err) {
    console.error(`[IndexedDB] Failed to delete upload ${id}:`, err);
  }
}

/**
 * Updates the status or retry count of a queued upload.
 */
export async function updateUploadStatus(
  id: string,
  status: 'pending' | 'syncing' | 'failed',
  lastError?: string
): Promise<void> {
  try {
    const key = `${QUEUE_PREFIX}${id}`;
    const item = await get<QueuedAudioUpload>(key);
    if (item) {
      item.status = status;
      if (status === 'failed') {
        item.retryCount = (item.retryCount || 0) + 1;
      }
      if (lastError) {
        item.lastError = lastError;
      }
      await set(key, item);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mm_offline_queue_updated'));
      }
    }
  } catch (err) {
    console.error(`[IndexedDB] Failed to update upload status for ${id}:`, err);
  }
}

/**
 * Clears all queued uploads from IndexedDB.
 */
export async function clearAllUploads(): Promise<void> {
  try {
    const allKeys = await keys();
    const queueKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(QUEUE_PREFIX));
    for (const key of queueKeys) {
      await del(key);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mm_offline_queue_updated'));
    }
  } catch (err) {
    console.error('[IndexedDB] Failed to clear offline queue:', err);
  }
}
