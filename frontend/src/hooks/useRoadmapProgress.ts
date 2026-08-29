import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RoadmapData, MilestoneItem } from '../components/roadmap/RoadmapTree';

export interface SyncToast {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface QueuedUpdate {
  milestoneId: string | number;
  subtaskKey: string;
  isCompleted: boolean;
  completedSubtaskIndices: number[];
  progressPercentage: number;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'mm_offline_roadmap_queue';

export function useRoadmapProgress(initialRoadmap?: RoadmapData) {
  const [roadmap, setRoadmap] = useState<RoadmapData | undefined>(initialRoadmap);
  const [completedSubtasks, setCompletedSubtasks] = useState<Record<string, boolean>>({
    '1-0': true,
    '1-1': true,
    '1-2': false,
    '2-0': true,
    '2-1': false,
    '2-2': false,
    '3-0': false,
    '3-1': false,
    '3-2': false,
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'queued' | 'error'>('synced');
  const [syncToast, setSyncToast] = useState<SyncToast | null>(null);
  const [celebrationMilestone, setCelebrationMilestone] = useState<{ id: number; title: string } | null>(null);

  // Update roadmap when initialRoadmap changes
  useEffect(() => {
    if (initialRoadmap) {
      setRoadmap(initialRoadmap);
    }
  }, [initialRoadmap]);

  const showToast = useCallback((type: SyncToast['type'], message: string, durationMs = 3500) => {
    setSyncToast({ type, message });
    setTimeout(() => {
      setSyncToast((current) => (current?.message === message ? null : current));
    }, durationMs);
  }, []);

  // ---------------------------------------------------------------------------
  // OFFLINE QUEUE UTILS
  // ---------------------------------------------------------------------------
  const getQueuedUpdates = useCallback((): QueuedUpdate[] => {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const saveQueuedUpdates = useCallback((queue: QueuedUpdate[]) => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save offline roadmap queue to localStorage:', e);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // SYNC SINGLE UPDATE (ONLINE OR QUEUE)
  // ---------------------------------------------------------------------------
  const dispatchMilestoneSync = useCallback(
    async (update: QueuedUpdate) => {
      if (!navigator.onLine) {
        // Enqueue offline update
        const queue = getQueuedUpdates();
        queue.push(update);
        saveQueuedUpdates(queue);
        setSyncStatus('queued');
        showToast('warning', 'Offline: Progress saved locally. Will sync when reconnected.');
        return;
      }

      setSyncStatus('syncing');
      try {
        // Try backend PATCH API first
        await api.updateMilestoneProgress(String(update.milestoneId), {
          is_completed: update.isCompleted,
          completed_subtasks: update.completedSubtaskIndices,
          progress_percentage: update.progressPercentage,
        });
        setSyncStatus('synced');
      } catch (apiErr) {
        // If Supabase direct client is available, try fallback direct update
        if (isSupabaseConfigured) {
          try {
            await supabase
              .from('milestones')
              .update({
                is_completed: update.isCompleted,
                updated_at: new Date().toISOString(),
              })
              .eq('id', update.milestoneId);
            setSyncStatus('synced');
            return;
          } catch (supaErr) {
            console.warn('Direct Supabase sync fallback failed:', supaErr);
          }
        }

        // On network failure, enqueue for retry
        const queue = getQueuedUpdates();
        queue.push(update);
        saveQueuedUpdates(queue);
        setSyncStatus('queued');
        showToast('info', 'Progress saved locally (queued for cloud sync).');
      }
    },
    [getQueuedUpdates, saveQueuedUpdates, showToast]
  );

  // ---------------------------------------------------------------------------
  // AUTO-REPLAY QUEUED UPDATES ON NETWORK RECONNECTION
  // ---------------------------------------------------------------------------
  const flushOfflineQueue = useCallback(async () => {
    const queue = getQueuedUpdates();
    if (queue.length === 0) return;

    setSyncStatus('syncing');
    let successCount = 0;

    for (const item of queue) {
      try {
        await api.updateMilestoneProgress(String(item.milestoneId), {
          is_completed: item.isCompleted,
          completed_subtasks: item.completedSubtaskIndices,
          progress_percentage: item.progressPercentage,
        });
        successCount++;
      } catch (err) {
        console.warn('Could not sync queued update:', item, err);
      }
    }

    // Clear queue
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    setSyncStatus('synced');
    showToast('success', `Reconnected! Synced ${successCount} pending roadmap milestone updates.`);
  }, [getQueuedUpdates, showToast]);

  // Monitor network status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('queued');
      showToast('warning', 'You are currently offline. Changes are saved to your device.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for pending queue on mount
    if (navigator.onLine) {
      flushOfflineQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushOfflineQueue, showToast]);

  // ---------------------------------------------------------------------------
  // REAL-TIME PROGRESS CALCULATIONS
  // ---------------------------------------------------------------------------
  const metrics = useMemo(() => {
    if (!roadmap || !roadmap.milestones) {
      return {
        totalSubtasks: 0,
        completedCount: 0,
        progressPercentage: 0,
        hoursCompleted: 0,
      };
    }

    let total = 0;
    let completed = 0;
    let earnedHours = 0;

    roadmap.milestones.forEach((m) => {
      let mCompletedCount = 0;
      const subtasks = m.subtasks || [];
      subtasks.forEach((_, idx) => {
        total += 1;
        if (completedSubtasks[`${m.id}-${idx}`]) {
          completed += 1;
          mCompletedCount += 1;
        }
      });
      if (subtasks.length > 0) {
        earnedHours += Math.round((mCompletedCount / subtasks.length) * m.estimated_hours);
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalSubtasks: total,
      completedCount: completed,
      progressPercentage: percent,
      hoursCompleted: earnedHours,
    };
  }, [roadmap, completedSubtasks]);

  // ---------------------------------------------------------------------------
  // OPTIMISTIC SUBTASK TOGGLE HANDLER
  // ---------------------------------------------------------------------------
  const toggleSubtask = useCallback(
    (milestoneId: number, taskIndex: number, milestoneTitle: string) => {
      const key = `${milestoneId}-${taskIndex}`;
      const nextState = !completedSubtasks[key];

      // 1. Optimistically update local state immediately
      const updated = { ...completedSubtasks, [key]: nextState };
      setCompletedSubtasks(updated);

      // 2. Check milestone completion for celebration
      const currentMilestone = roadmap?.milestones.find((m) => m.id === milestoneId);
      let isAllCompleted = false;
      const completedIndices: number[] = [];

      if (currentMilestone && currentMilestone.subtasks) {
        currentMilestone.subtasks.forEach((_, idx) => {
          const k = `${milestoneId}-${idx}`;
          if (k === key ? nextState : !!updated[k]) {
            completedIndices.push(idx);
          }
        });

        isAllCompleted = completedIndices.length === currentMilestone.subtasks.length;
        if (isAllCompleted && nextState) {
          setCelebrationMilestone({ id: milestoneId, title: milestoneTitle });
          setTimeout(() => setCelebrationMilestone(null), 5000);
        }
      }

      // 3. Dispatch background sync (online or offline queue)
      dispatchMilestoneSync({
        milestoneId,
        subtaskKey: key,
        isCompleted: isAllCompleted,
        completedSubtaskIndices: completedIndices,
        progressPercentage: metrics.progressPercentage,
        timestamp: Date.now(),
      });
    },
    [completedSubtasks, roadmap, metrics.progressPercentage, dispatchMilestoneSync]
  );

  return {
    roadmap,
    setRoadmap,
    completedSubtasks,
    setCompletedSubtasks,
    toggleSubtask,
    metrics,
    isOnline,
    syncStatus,
    syncToast,
    celebrationMilestone,
    setCelebrationMilestone,
    dismissToast: () => setSyncToast(null),
  };
}
