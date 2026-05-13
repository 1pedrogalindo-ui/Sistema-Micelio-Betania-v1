'use client';

import { createClient } from '@supabase/supabase-js';
import { env, hasSupabaseBrowserEnv } from '@/lib/env';

export function getSupabaseBrowserClient() {
  if (!hasSupabaseBrowserEnv()) return null;

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
