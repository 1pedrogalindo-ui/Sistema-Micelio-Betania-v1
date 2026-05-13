'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabaseBrowserEnv } from '@/lib/env';

let supabaseBrowserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!hasSupabaseBrowserEnv()) return null;

  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseBrowserClient;
}
