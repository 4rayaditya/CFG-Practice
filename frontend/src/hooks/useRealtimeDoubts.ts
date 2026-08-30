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
    audio_url: r.audio_url || r.audioUrl || undefined,
    studentId: r.student_id || r.studentId || '',
    student_id: r.student_id || r.studentId || '',
    studentName: 
      r.student_profile?.full_name || 
      r.student_name || 
      r.studentName || 
      'Student',
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    created_at: r.created_at || r.createdAt || new Date().toISOString(),
    status: (r.status === 'cancelled' ? 'pending' : r.status) || 'pending',
    category: r.category || 'General',
    tags: r.tags || [],
    transcript: r.transcript || undefined,
    matchedMentors: r.matched_mentor_ids || r.matchedMentors || [],
    matched_mentor_ids: r.matched_mentor_ids || r.matchedMentors || [],
    similarityScore: r.similarity_score ?? r.similarityScore ?? undefined,
    answer: r.answer || undefined,
    answeredBy: r.answered_by_name || r.answeredBy || undefined,
    answered_by_name: r.answered_by_name || r.answeredBy || undefined,
    answeredAt: r.answered_at || r.answeredAt || undefined,
    answered_at: r.answered_at || r.answeredAt || undefined,
    urgency: r.urgency || 'Standard',
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
  unsubscribe: () => void;
}

export const SEED_DOUBTS: Doubt[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    title: 'Dynamic Programming Memoization vs Tabulation in Grid Travel',
    description: 'I am getting confused about state transitions and how to reconstruct the path after calculating the minimum cost grid travel.',
    transcript: 'I am practicing algorithmic problem solving and getting confused with dynamic programming memoization and state transitions in grid traversal.',
    category: 'Algorithms',
    tags: ['algorithms', 'dp', 'memoization', 'grid-traversal'],
    status: 'pending',
    urgency: 'Urgent',
    studentId: '00000000-0000-0000-0000-000000000001',
    studentName: 'Alex Chen',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    matchedMentors: ['00000000-0000-0000-0000-000000000004'],
  },
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    title: 'React 19 useEffect Cleanup and Web Audio Stream Leaks',
    description: 'When switching pages, the microphone MediaStream audio tracks keep running in the background and do not release the hardware.',
    transcript: 'I am building a responsive React dashboard with TypeScript and need advice on properly releasing MediaRecorder stream tracks in useEffect cleanup.',
    category: 'Frontend',
    tags: ['react', 'web-audio', 'useeffect', 'typescript'],
    status: 'pending',
    urgency: 'Standard',
    studentId: '00000000-0000-0000-0000-000000000001',
    studentName: 'Maya Patel',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    matchedMentors: ['00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'],
  },
  {
    id: 'd1000000-0000-0000-0000-000000000003',
    title: 'PostgreSQL pgvector Cosine Distance vs Inner Product Indexes',
    description: 'Which vector index operator should I configure in Supabase HNSW for normalized 384-dimensional sentence transformer embeddings?',
    transcript: 'How do I choose between vector_cosine_ops and vector_l2_ops in pgvector for my all-MiniLM embeddings index?',
    category: 'AI/ML',
    tags: ['pgvector', 'hnsw', 'embeddings', 'supabase', 'database'],
    status: 'pending',
    urgency: 'Standard',
    studentId: '00000000-0000-0000-0000-000000000005',
    studentName: 'Liam Johnson',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    matchedMentors: ['00000000-0000-0000-0000-000000000006'],
  },
  {
    id: 'd1000000-0000-0000-0000-000000000004',
    title: 'FastAPI SlowAPI Rate Limiting by Client IP with Proxies',
    description: 'When running behind NGINX reverse proxy, get_remote_address uses the proxy IP instead of the X-Forwarded-For client IP.',
    transcript: 'How can I configure SlowAPI key_func in FastAPI to correctly inspect the X-Forwarded-For header when behind a cloud load balancer?',
    category: 'Backend',
    tags: ['fastapi', 'slowapi', 'rate-limiting', 'nginx', 'python'],
    status: 'resolved',
    urgency: 'Standard',
    studentId: '00000000-0000-0000-0000-000000000001',
    studentName: 'Alex Chen',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    answer: 'To rate limit by the true client IP behind reverse proxies, define a custom key function: \n\n```python\ndef get_real_ip(request: Request):\n    forwarded = request.headers.get("X-Forwarded-For")\n    if forwarded:\n        return forwarded.split(",")[0].strip()\n    return request.client.host\n```\nPass `key_func=get_real_ip` to your `Limiter` instance.',
    answeredBy: 'Dr. Sarah Jenkins',
    answeredAt: new Date(Date.now() - 95 * 60000).toISOString(),
  }
];

export function getLocalCachedDoubts(): Doubt[] {
  try {
    const raw = localStorage.getItem('mm_persisted_doubts');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return SEED_DOUBTS;
}

export function saveLocalCachedDoubts(doubts: Doubt[]): void {
  try {
    localStorage.setItem('mm_persisted_doubts', JSON.stringify(doubts));
  } catch (e) {
    console.warn('Failed to persist doubts to local storage:', e);
  }
}

/**
 * Custom hook to fetch open doubts and maintain a live subscription
 * with Supabase Realtime for instant INSERT, UPDATE, and DELETE broadcasts.
 * Properly handles component lifecycle, teardown, and channel unsubscription.
 */
export function useRealtimeDoubts(options: UseRealtimeDoubtsOptions = {}): UseRealtimeDoubtsReturn {
  const { filterStatus = 'open', limit = 50 } = options;

  const [doubts, setDoubts] = useState<Doubt[]>(() => {
    const cached = getLocalCachedDoubts();
    if (filterStatus === 'open') {
      return cached.filter((d) => d.status === 'pending' || d.status === 'matched');
    } else if (filterStatus !== 'all') {
      return cached.filter((d) => d.status === filterStatus);
    }
    return cached;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Keep reference to active channel and mounted state
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef<boolean>(true);

  /**
   * Fetches the initial list of doubts from Supabase or cached storage
   */
  const fetchDoubts = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      if (!isSupabaseConfigured) {
        const local = getLocalCachedDoubts();
        let filtered = local;
        if (filterStatus === 'open') {
          filtered = local.filter((d) => d.status === 'pending' || d.status === 'matched');
        } else if (filterStatus !== 'all') {
          filtered = local.filter((d) => d.status === filterStatus);
        }
        if (isMountedRef.current) {
          setDoubts(filtered);
          setLoading(false);
        }
        return;
      }

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
          urgency,
          matched_mentor_ids,
          assigned_mentor_id,
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

      if (data && data.length > 0 && isMountedRef.current) {
        const mappedDoubts = data.map((row) => mapDoubtRowToDoubt(row as DoubtDbRow));
        setDoubts(mappedDoubts);

        // Merge into local cache
        const currentCache = getLocalCachedDoubts();
        const mergedMap = new Map<string, Doubt>();
        currentCache.forEach((d) => mergedMap.set(d.id, d));
        mappedDoubts.forEach((d) => mergedMap.set(d.id, d));
        saveLocalCachedDoubts(Array.from(mergedMap.values()));
      } else if (isMountedRef.current) {
        // Fall back to local cached doubts if remote table is fresh
        const local = getLocalCachedDoubts();
        let filtered = local;
        if (filterStatus === 'open') {
          filtered = local.filter((d) => d.status === 'pending' || d.status === 'matched');
        } else if (filterStatus !== 'all') {
          filtered = local.filter((d) => d.status === filterStatus);
        }
        setDoubts(filtered);
      }
    } catch (err: any) {
      console.warn('[useRealtimeDoubts] Supabase query notice, using local cached doubts:', err.message);
      if (isMountedRef.current) {
        const local = getLocalCachedDoubts();
        let filtered = local;
        if (filterStatus === 'open') {
          filtered = local.filter((d) => d.status === 'pending' || d.status === 'matched');
        } else if (filterStatus !== 'all') {
          filtered = local.filter((d) => d.status === filterStatus);
        }
        setDoubts(filtered);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [filterStatus, limit]);

  /**
   * Unsubscribe helper for explicit or unmount cleanup
   */
  const cleanupChannel = useCallback(() => {
    if (channelRef.current) {
      const activeChannel = channelRef.current;
      channelRef.current = null;
      try {
        supabase.removeChannel(activeChannel);
      } catch (e) {
        console.warn('[useRealtimeDoubts] Error removing realtime channel:', e);
      }
    }
  }, []);

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

  // Lifecycle: Synchronize query and Realtime channel subscription
  useEffect(() => {
    isMountedRef.current = true;
    fetchDoubts();

    if (!isSupabaseConfigured) {
      return () => {
        isMountedRef.current = false;
      };
    }

    // Clean up any existing channel before subscribing
    cleanupChannel();

    // Unique channel identifier per hook instance & subscription cycle
    const channelId = `realtime-doubts-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
          if (!isMountedRef.current) return;
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
          if (!isMountedRef.current) return;
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
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'doubts',
        },
        (payload) => {
          if (!isMountedRef.current) return;
          const deletedId = (payload.old as { id?: string })?.id;
          if (deletedId) {
            setDoubts((prev) => prev.filter((d) => d.id !== deletedId));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error(`[useRealtimeDoubts] Realtime subscription error on channel: ${channelId}`);
        }
      });

    channelRef.current = channel;

    // React cleanup function returned to unsubscribe and teardown channel
    return () => {
      isMountedRef.current = false;
      cleanupChannel();
    };
  }, [fetchDoubts, filterStatus, cleanupChannel]);

  return {
    doubts,
    loading,
    error,
    refetch: fetchDoubts,
    addOptimisticDoubt,
    updateOptimisticDoubt,
    unsubscribe: cleanupChannel,
  };
}
