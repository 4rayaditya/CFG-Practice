import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getPendingUploads, 
  removeUpload, 
  updateUploadStatus, 
  deserializeAudioUpload, 
  QueuedAudioUpload 
} from '../utils/offlineQueue';
import { api } from '../services/api';

export interface SyncResult {
  total: number;
  succeeded: number;
  failed: number;
  syncedItems: QueuedAudioUpload[];
}

export interface UseNetworkStatusReturn {
  isOnline: boolean;
  isMounted: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  flushQueueDispatcher: () => Promise<SyncResult>;
  refreshPendingCount: () => Promise<void>;
}

/**
 * Custom hook to manage network status (online/offline) and background sync of offline voice recordings.
 * Designed with strict hydration and mounting safety:
 * - Deterministic initial state for SSR / initial render
 * - Browser APIs (navigator.onLine, IndexedDB) only accessed inside useEffect after mount
 * - Asynchronous state updates guarded by isMountedRef to prevent memory leaks
 */
export function useNetworkStatus(
  onAutoSyncSuccess?: (item: QueuedAudioUpload, result: any) => void
): UseNetworkStatusReturn {
  // Deterministic baseline state preventing hydration mismatches
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const isMountedRef = useRef<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);

  // Refresh pending count from IndexedDB (strictly client-side after mount)
  const refreshPendingCount = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const items = await getPendingUploads();
      if (isMountedRef.current) {
        setPendingCount(items.length);
      }
    } catch (err) {
      console.warn('[useNetworkStatus] Error fetching pending count:', err);
    }
  }, []);

  // Flush Queue Dispatcher with exponential backoff / sequential error isolation
  const flushQueueDispatcher = useCallback(async (): Promise<SyncResult> => {
    if (typeof window === 'undefined' || isSyncingRef.current) {
      return { total: 0, succeeded: 0, failed: 0, syncedItems: [] };
    }

    isSyncingRef.current = true;
    if (isMountedRef.current) setIsSyncing(true);

    const pendingItems = await getPendingUploads();
    const result: SyncResult = {
      total: pendingItems.length,
      succeeded: 0,
      failed: 0,
      syncedItems: [],
    };

    if (pendingItems.length === 0) {
      isSyncingRef.current = false;
      if (isMountedRef.current) setIsSyncing(false);
      return result;
    }

    console.log(`[OfflineQueue] Flushing ${pendingItems.length} pending voice uploads...`);

    for (const item of pendingItems) {
      try {
        await updateUploadStatus(item.id, 'syncing');
        const { blob, file } = deserializeAudioUpload(item);

        // Upload to backend FastAPI /api/process-audio
        const uploadResponse = await api.uploadAudio(blob, file.name);

        // Remove from IndexedDB on success
        await removeUpload(item.id);
        result.succeeded += 1;
        result.syncedItems.push(item);

        console.log(`[OfflineQueue] Successfully synced audio upload ${item.id}`);

        if (onAutoSyncSuccess) {
          onAutoSyncSuccess(item, uploadResponse);
        }
      } catch (err: any) {
        console.error(`[OfflineQueue] Sync failed for upload ${item.id}:`, err);
        result.failed += 1;
        await updateUploadStatus(item.id, 'failed', err?.message || 'Network error');
      }
    }

    isSyncingRef.current = false;
    if (isMountedRef.current) {
      setIsSyncing(false);
      setLastSyncResult(result);
    }
    await refreshPendingCount();

    return result;
  }, [onAutoSyncSuccess, refreshPendingCount]);

  // Client-only hydration effect for browser API checks & event listeners
  useEffect(() => {
    isMountedRef.current = true;
    setIsMounted(true);

    // Initial check of browser navigator API only after client mount
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // Initial check of IndexedDB queue store only after client mount
    refreshPendingCount();

    const handleOnline = () => {
      console.log('[Network] Connection restored: ONLINE');
      if (isMountedRef.current) {
        setIsOnline(true);
      }
      // Auto-flush pending queue when back online
      flushQueueDispatcher();
    };

    const handleOffline = () => {
      console.log('[Network] Connection lost: OFFLINE');
      if (isMountedRef.current) {
        setIsOnline(false);
      }
    };

    const handleQueueUpdated = () => {
      refreshPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('mm_offline_queue_updated', handleQueueUpdated);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mm_offline_queue_updated', handleQueueUpdated);
    };
  }, [flushQueueDispatcher, refreshPendingCount]);

  return {
    isOnline,
    isMounted,
    pendingCount,
    isSyncing,
    lastSyncResult,
    flushQueueDispatcher,
    refreshPendingCount,
  };
}
