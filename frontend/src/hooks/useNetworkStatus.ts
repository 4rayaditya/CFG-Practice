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

export function useNetworkStatus(
  onAutoSyncSuccess?: (item: QueuedAudioUpload, result: any) => void
) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const isSyncingRef = useRef<boolean>(false);

  // Refresh pending count from IndexedDB
  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await getPendingUploads();
      setPendingCount(items.length);
    } catch (err) {
      console.warn('[useNetworkStatus] Error fetching pending count:', err);
    }
  }, []);

  // Flush Queue Dispatcher
  const flushQueueDispatcher = useCallback(async (): Promise<SyncResult> => {
    if (isSyncingRef.current) {
      return { total: 0, succeeded: 0, failed: 0, syncedItems: [] };
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    const pendingItems = await getPendingUploads();
    const result: SyncResult = {
      total: pendingItems.length,
      succeeded: 0,
      failed: 0,
      syncedItems: [],
    };

    if (pendingItems.length === 0) {
      isSyncingRef.current = false;
      setIsSyncing(false);
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
    setIsSyncing(false);
    setLastSyncResult(result);
    await refreshPendingCount();

    return result;
  }, [onAutoSyncSuccess, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      console.log('[Network] Connection restored: ONLINE');
      setIsOnline(true);
      // Auto-flush pending queue when back online
      flushQueueDispatcher();
    };

    const handleOffline = () => {
      console.log('[Network] Connection lost: OFFLINE');
      setIsOnline(false);
    };

    const handleQueueUpdated = () => {
      refreshPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('mm_offline_queue_updated', handleQueueUpdated);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mm_offline_queue_updated', handleQueueUpdated);
    };
  }, [flushQueueDispatcher, refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    flushQueueDispatcher,
    refreshPendingCount,
  };
}
