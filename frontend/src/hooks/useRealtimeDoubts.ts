import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Doubt } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Raw database schema interface for the 'doubts' table in Supabase
 */
export interface DoubtDbRow {
  id: string;
  student_id: string;
  title: string;
  description: string;
  audio_url?: string | null;
  transcript?: string | null;
  category: string;
  tags?: string[] | null;
  status: 'pending' | 'matched' | 'resolved' | 'cancelled';
  urgency?: string | null;
  matched_mentor_ids?: string[] | null;
  assigned_mentor_id?: string | null;
  similarity_score?: number | null;
  answer?: string | null;
  answered_by_name?: string | null;
  answered_at?: string | null;
  created_at: string;
  updated_at?: string;
  student_profile?: {
    full_name?: string;
  } | null;
}

/**
 * Transforms a Supabase PostgreSQL row into the frontend Doubt type
 */
export function mapDoubtRowToDoubt(row: DoubtDbRow | Record<string, any>): Doubt {
  const r = row as Record<string, any>;
  return {
    id: r.id,
    title: r.title || 'Untitled Doubt',
    description: r.description || '',
    audioUrl: r.audio_url || r.audioUrl || undefined,
    studentId: r.student_id || r.studentId || '',
    studentName: 
      r.student_profile?.full_name || 
      r.student_name || 
      r.studentName || 
      'Student',
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    status: (r.status === 'cancelled' ? 'pending' : r.status) || 'pending',
    category: r.category || 'General',
    tags: r.tags || [],
    transcript: r.transcript || undefined,
    matchedMentors: r.matched_mentor_ids || r.matchedMentors || [],
    similarityScore: r.similarity_score ?? r.similarityScore ?? undefined,
    answer: r.answer || undefined,
    answeredBy: r.answered_by_name || r.answeredBy || undefined,
    answeredAt: r.answered_at || r.answeredAt || undefined,
  };
}

export interface UseRealtimeDoubtsOptions {
  /** Filter by specific status. Defaults to open doubts ('pending', 'matched') or pass 'all' */
  filterStatus?: 'open' | 'all' | 'pending' | 'matched' | 'resolved';
  /** Limit number of initial doubts loaded */
  limit?: number;
}

export interface UseRealtimeDoubtsReturn {
  doubts: Doubt[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addOptimisticDoubt: (newDoubt: Doubt) => void;
  updateOptimisticDoubt: (doubtId: string, partial: Partial<Doubt>) => void;
}

/**
 * Custom hook to fetch open doubts and maintain a live subscription
 * with Supabase Realtime for instant INSERT and UPDATE broadcasts.
 */
export function useRealtimeDoubts(options: UseRealtimeDoubtsOptions = {}): UseRealtimeDoubtsReturn {
  const { filterStatus = 'open', limit = 50 } = options;

  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Keep a reference to the active Realtime channel for reliable cleanup
  const channelRef = useRef<RealtimeChannel | null>(null);

  /**
   * Fetches the initial list of doubts from Supabase
   */
  const fetchDoubts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('doubts')
        .select(`
          id,
          student_id,
          title,
          description,
          audio_url,
          transcript,
          category,
          tags,
          status,
          matched_mentor_ids,
          answer,
          answered_by_name,
          answered_at,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filterStatus === 'open') {
        query = query.in('status', ['pending', 'matched']);
      } else if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (data) {
        const mappedDoubts = data.map((row) => mapDoubtRowToDoubt(row as DoubtDbRow));
        setDoubts(mappedDoubts);
      }
    } catch (err: any) {
      console.error('[useRealtimeDoubts] Failed to fetch initial doubts:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Error fetching doubts'));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, limit]);

  /**
   * Optimistically prepend a doubt to state
   */
  const addOptimisticDoubt = useCallback((newDoubt: Doubt) => {
    setDoubts((prev) => {
      // Prevent duplicate insertion if already present
      if (prev.some((d) => d.id === newDoubt.id)) return prev;
      return [newDoubt, ...prev];
    });
  }, []);

  /**
   * Optimistically update a doubt in state
   */
  const updateOptimisticDoubt = useCallback((doubtId: string, partial: Partial<Doubt>) => {
    setDoubts((prev) =>
      prev.map((d) => (d.id === doubtId ? { ...d, ...partial } : d))
    );
  }, []);

  // Fetch initial doubts and bind Realtime subscription
  useEffect(() => {
    fetchDoubts();

    if (!isSupabaseConfigured) {
      return;
    }

    // Generate unique channel identifier to avoid collision across components
    const channelId = `realtime-doubts-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'doubts',
        },
        (payload) => {
          const insertedDoubt = mapDoubtRowToDoubt(payload.new as DoubtDbRow);

          // If filtering for open doubts, verify status matches
          if (
            filterStatus === 'all' ||
            (filterStatus === 'open' && (insertedDoubt.status === 'pending' || insertedDoubt.status === 'matched')) ||
            filterStatus === insertedDoubt.status
          ) {
            setDoubts((prev) => {
              // Deduplicate: replace optimistic version or prepend if not present
              const existingIndex = prev.findIndex((d) => d.id === insertedDoubt.id);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...prev[existingIndex], ...insertedDoubt };
                return updated;
              }
              return [insertedDoubt, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'doubts',
        },
        (payload) => {
          const updatedDoubt = mapDoubtRowToDoubt(payload.new as DoubtDbRow);

          setDoubts((prev) => {
            // Check if updated doubt should remain in list given filter
            const shouldInclude =
              filterStatus === 'all' ||
              (filterStatus === 'open' && (updatedDoubt.status === 'pending' || updatedDoubt.status === 'matched')) ||
              filterStatus === updatedDoubt.status;

            if (!shouldInclude) {
              // Remove if status no longer matches (e.g. doubt resolved)
              return prev.filter((d) => d.id !== updatedDoubt.id);
            }

            const exists = prev.some((d) => d.id === updatedDoubt.id);
            if (exists) {
              return prev.map((d) => (d.id === updatedDoubt.id ? { ...d, ...updatedDoubt } : d));
            } else {
              // If it wasn't in state previously but now matches filter, prepend it
              return [updatedDoubt, ...prev];
            }
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Live connection established
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[useRealtimeDoubts] Realtime subscription error on channel: ${channelId}`);
        }
      });

    channelRef.current = channel;

    // Proper cleanup on component unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchDoubts, filterStatus]);

  return {
    doubts,
    loading,
    error,
    refetch: fetchDoubts,
    addOptimisticDoubt,
    updateOptimisticDoubt,
  };
}
