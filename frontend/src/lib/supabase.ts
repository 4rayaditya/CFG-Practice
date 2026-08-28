import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  (import.meta as any).env?.VITE_SUPABASE_URL &&
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY &&
  !(import.meta as any).env?.VITE_SUPABASE_URL.includes('placeholder')
);

/**
 * Singleton Supabase Client instance for authentication, database, and Realtime subscriptions
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper to retrieve the current session JWT token for sending to the FastAPI backend
 */
export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

/**
 * Helper to build an Authorization header object for API calls
 */
export async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}